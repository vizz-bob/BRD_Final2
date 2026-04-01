from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal

class LoanApplication(models.Model):

    LOAN_TYPES = [
        ("personal", "Personal Loan"),
        ("business", "Business Loan"),
        ("education", "Education Loan"),
        ("consumer", "Consumer Durable Loan"),
        ("gold", "Gold Loan"),
        ("property", "Loan Against Property"),
        ("vehicle", "Vehicle Loan"),
        ("securities", "Loan Against Securities"),
        ("supply_chain", "Supply Chain Financing"),
    ]

    STATUS = [
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("document_required", "Document Required"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    application_id = models.CharField(max_length=20, unique=True, editable=False)

    user = models.ForeignKey(User,on_delete=models.DO_NOTHING,related_name="loan_applications")

    # Loan Type
    loan_type = models.CharField(max_length=50, choices=LOAN_TYPES)
    status = models.CharField(max_length=30, choices=STATUS, default="submitted")

    # Basic Details
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    # Address Details
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    # Employment & Loan Details
    occupation = models.CharField(max_length=100)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2)
    loan_amount = models.DecimalField(max_digits=14, decimal_places=2)
    loan_purpose = models.TextField()

    # Common Documents
    pan_card = models.FileField(upload_to="loan_docs/pan/", null=True, blank=True)
    aadhar_front = models.FileField(upload_to="loan_docs/aadhar/front/", null=True, blank=True)
    aadhar_back = models.FileField(upload_to="loan_docs/aadhar/back/", null=True, blank=True)
    income_proof = models.FileField(upload_to="loan_docs/income/", null=True, blank=True)
    itr_last_year = models.FileField(upload_to="loan_docs/itr/", null=True, blank=True)
    bank_statement = models.FileField(upload_to="loan_docs/bank_statements/", null=True, blank=True)

    # Employment Documents
    employment_proof = models.FileField(upload_to="loan_docs/employment_proof/", null=True, blank=True)
    salary_slip = models.FileField(upload_to="loan_docs/salary_slip/", null=True, blank=True)

    # Business Documents
    business_registration_documents = models.FileField(upload_to="loan_docs/business_registration/", null=True, blank=True)
    gst_returns = models.FileField(upload_to="loan_docs/gst_returns/", null=True, blank=True)
    financial_statements = models.FileField(upload_to="loan_docs/financial_statements/", null=True, blank=True)

    # Education Documents
    admission_letter = models.FileField(upload_to="loan_docs/admission_letter/", null=True, blank=True)
    fee_structure = models.FileField(upload_to="loan_docs/fee_structure/", null=True, blank=True)
    academic_records = models.FileField(upload_to="loan_docs/academic_records/", null=True, blank=True)
    collateral_documents = models.FileField(upload_to="loan_docs/collateral_documents/", null=True, blank=True)

    # Consumer Durable
    invoice_product = models.FileField(upload_to="loan_docs/product_invoice/", null=True, blank=True)

    # Gold Loan
    gold_ornaments = models.FileField(upload_to="loan_docs/gold_ornaments/", null=True, blank=True)
    address_proof = models.FileField(upload_to="loan_docs/address_proof/", null=True, blank=True)

    # Property Loan
    property_papers = models.FileField(upload_to="loan_docs/property_papers/", null=True, blank=True)
    title_deed = models.FileField(upload_to="loan_docs/title_deed/", null=True, blank=True)
    valuation_report = models.FileField(upload_to="loan_docs/valuation_report/", null=True, blank=True)

    # Vehicle Loan
    driving_license = models.FileField(upload_to="loan_docs/driving_license/", null=True, blank=True)
    vehicle_quotation = models.FileField(upload_to="loan_docs/vehicle_quotation/", null=True, blank=True)

    # Securities Loan
    demat_account_statements = models.FileField(upload_to="loan_docs/demat_statements/", null=True, blank=True)
    securities_pledge_agreement = models.FileField(upload_to="loan_docs/pledge_agreement/", null=True, blank=True)

    # Supply Chain Financing
    invoices = models.FileField(upload_to="loan_docs/invoices/", null=True, blank=True)
    buyer_supplier_agreements = models.FileField(upload_to="loan_docs/agreements/", null=True, blank=True)
    business_financials = models.FileField(upload_to="loan_docs/business_financials/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    def save(self, *args, **kwargs):
        if not self.application_id:
            year = timezone.now().year

            last_application = LoanApplication.objects.filter(
                application_id__startswith=f"LA{year}"
            ).order_by("application_id").last()

            if last_application:
                last_number = int(last_application.application_id[-6:])
                new_number = last_number + 1
            else:
                new_number = 1

            self.application_id = f"LA{year}{new_number:06d}"

        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.full_name} - {self.get_loan_type_display()}"
    

class Loan(models.Model):

    STATUS = [
        ("approved", "Approved"),
        ("pending", "Pending"),
        ("rejected", "Rejected"),
    ]

    CURRENT_STAGE_CHOICES = [
        ("submitted", "Submitted"),
        ("sanction_process", "Sanction Process"),
        ("kfs_review", "KFS Review"),
        ("kfs_completed", "KFS Completed"),
        ("disbursed", "Disbursed"),
    ]

    application = models.OneToOneField(
        LoanApplication,
        on_delete=models.CASCADE,
        related_name="loan"
    )

    principal_amount = models.DecimalField(max_digits=14, decimal_places=2)
    remaining_principal = models.DecimalField(max_digits=14, decimal_places=2)

    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Annual interest rate %"
    )

    tenure_months = models.PositiveIntegerField()

    monthly_emi = models.DecimalField(max_digits=12, decimal_places=2)

    disbursed_on = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS, default="pending")

    current_stage = models.CharField(
        max_length=30,
        choices=CURRENT_STAGE_CHOICES,
        default="submitted"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def generate_emis(self):
        if not self.disbursed_on:
            return

        monthly_rate = Decimal(self.interest_rate) / Decimal(12 * 100)
        p = Decimal(self.principal_amount)
        n = self.tenure_months
        if not self.monthly_emi:
            emi_amount = p * monthly_rate * ((1 + monthly_rate) ** n) / (((1 + monthly_rate) ** n) - 1)
            self.monthly_emi = emi_amount.quantize(Decimal('0.01'))
            self.save()

        current_principal_balance = p 
        next_due_date = self.disbursed_on + relativedelta(months=1)
        emi_objects = []

        for i in range(n):
            interest_comp = (current_principal_balance * monthly_rate).quantize(Decimal('0.01'))
            principal_comp = Decimal(self.monthly_emi) - interest_comp
            if i == n - 1 or principal_comp > current_principal_balance:
                principal_comp = current_principal_balance

            emi_objects.append(EMI(
                loan=self,
                emi_number=i + 1,
                amount=self.monthly_emi,
                principal_component=principal_comp,
                interest_component=interest_comp,
                remaining_balance_after_emi=current_principal_balance - principal_comp,
                due_date=next_due_date,
                status="scheduled"
            ))
            current_principal_balance -= principal_comp
            next_due_date += relativedelta(months=1)

        EMI.objects.bulk_create(emi_objects)
    

class EMI(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
        ("partially_paid", "Partially Paid"),
    ]
    
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="emis")
    emi_number = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    principal_component = models.DecimalField(max_digits=12, decimal_places=2, help_text="Part of EMI reducing principal")
    interest_component = models.DecimalField(max_digits=12, decimal_places=2, help_text="Part of EMI paying interest")
    remaining_balance_after_emi = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    due_date = models.DateField()
    paid_on = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")

class KeyFactStatement(models.Model):
    loan = models.OneToOneField(
        Loan,
        on_delete=models.CASCADE,
        related_name="kfs"
    )

    processing_fee = models.DecimalField(max_digits=10, decimal_places=2)

    annual_percentage_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    total_interest = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    total_amount_payable = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    late_payment_charges = models.CharField(max_length=200)
    prepayment_charges = models.CharField(max_length=200)
    bounce_charges = models.CharField(max_length=200)
    legal_charges = models.CharField(max_length=200)

    generated_on = models.DateField(auto_now_add=True)

class SanctionLetter(models.Model):
    loan = models.OneToOneField(
        Loan,
        on_delete=models.CASCADE,
        related_name="sanction_letter"
    )

    sanction_number = models.CharField(max_length=30, unique=True)

    sanction_date = models.DateField()

    valid_till = models.DateField()

    processing_fee = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

class SanctionTerm(models.Model):
    sanction_letter = models.ForeignKey(
        SanctionLetter,
        on_delete=models.CASCADE,
        related_name="terms"
    )

    text = models.TextField()

class LoanAgreement(models.Model):
    loan = models.OneToOneField(
        Loan,
        on_delete=models.CASCADE,
        related_name="agreement"
    )

    agreement_number = models.CharField(max_length=30, unique=True)

    agreement_date = models.DateField()

    agreement_file = models.FileField(
        upload_to="loan_docs/agreements/",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)