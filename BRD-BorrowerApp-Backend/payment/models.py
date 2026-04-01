from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
LOAN_TYPES = [
    ("personal", "Personal Loan"),
    ("business", "Business Loan"),
    ("education", "Education Loan"),
    ("consumer_durable", "Consumer Durable Loan"),
    ("gold", "Gold Loan"),
    ("lap", "Loan Against Property"),
    ("vehicle", "Vehicle Loan"),
    ("las", "Loan Against Securities"),
    ("scf", "Supply Chain Financing"),
]

POPULAR_BANKS = [
    ("SBI", "State Bank of India"),
    ("HDFC", "HDFC Bank"),
    ("ICICI", "ICICI Bank"),
    ("AXIS", "Axis Bank"),
    ("KOTAK", "Kotak Mahindra Bank"),
    ("PNB", "Punjab National Bank"),
    ("OTHER", "Other Bank"),
]

ACCOUNT_TYPES = [
    ("SAVINGS", "Savings"),
    ("CURRENT", "Current"),
]

FREQUENCY_CHOICES = [
    ("MONTHLY", "Monthly"),
    ("QUARTERLY", "Quarterly"),
]

DEBIT_DAYS = [(str(i), str(i)) for i in range(1, 13)]

AUTH_METHODS = [
    ("NET_BANKING", "Net Banking"),
    ("DEBIT_CARD", "Debit Card"),
]

class SetupAutoPay(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    loan_type = models.CharField(max_length=30, choices=LOAN_TYPES)

    loan_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    principal_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    emi_number = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    due_date = models.DateField(
        null=True,
        blank=True
    )

    popular_bank = models.CharField(
        max_length=20,
        choices=POPULAR_BANKS,
        blank=True,
        null=True
    )

    bank_name = models.CharField(max_length=150)
    account_holder_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=25)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    ifsc_code = models.CharField(max_length=15)

    maximum_debit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    debit_day_of_month = models.CharField(
        max_length=2,
        choices=DEBIT_DAYS,
        null=True,
        blank=True
    )

    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        null=True,
        blank=True
    )

    mandate_start_date = models.DateField(
        null=True,
        blank=True
    )

    mandate_end_date = models.DateField(
        null=True,
        blank=True
    )

    authentication_method = models.CharField(
        max_length=20,
        choices=AUTH_METHODS,
        null=True,
        blank=True
    )

    mobile_number = models.CharField(max_length=15)
    email = models.EmailField()

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):

        if self.mandate_start_date and self.mandate_end_date:
            if self.mandate_end_date <= self.mandate_start_date:
                raise ValidationError(
                    "Mandate End Date must be after Start Date."
                )

        if self.principal_amount and self.loan_amount:
            if self.principal_amount > self.loan_amount:
                raise ValidationError(
                    "Principal cannot be greater than Loan Amount."
                )

    def __str__(self):
        return f"{self.user.username} - {self.loan_type} AutoPay"
#--------------------------
# Upcoming payment
#-------------------------
class UpcomingPayment(models.Model):
    LOAN_TYPES = [
        ("personal", "Personal Loan"),
        ("business", "Business Loan"),
        ("education", "Education Loan"),
        ("consumer_durable", "Consumer Durable Loan"),
        ("gold", "Gold Loan"),
        ("lap", "Loan Against Property"),
        ("vehicle", "Vehicle Loan"),
        ("las", "Loan Against Securities"),
        ("scf", "Supply Chain Financing"),
    ]
    PAYMENT_METHODS = [
        ("upi", "UPI"),
        ("net_banking", "Net Banking"),
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    loan_type = models.CharField(max_length=30, choices=LOAN_TYPES)

    emi_number = models.PositiveIntegerField()

    due_date = models.DateField()

    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)

    interest_amount = models.DecimalField(max_digits=12, decimal_places=2)

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    last_paid_on = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    def save(self, *args, **kwargs):

        # Auto calculate total
        self.total_amount = self.principal_amount + self.interest_amount

        # Auto status update
        if self.status != "paid":
            if self.due_date < timezone.now().date():
                self.status = "overdue"
            else:
                self.status = "pending"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.loan_type} - EMI {self.emi_number}"
#------------------------------
# Manage payment
#-----------------------------
class ManagePayment(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    total_pending = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    total_overdue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"{self.user.username} - Manage Payment"
#--------------------------
#Recent transactions
#--------------------------
class RecentTransaction(models.Model):

    LOAN_TYPES = [
        ("personal", "Personal Loan"),
        ("business", "Business Loan"),
        ("education", "Education Loan"),
        ("consumer_durable", "Consumer Durable Loan"),
        ("gold", "Gold Loan"),
        ("lap", "Loan Against Property"),
        ("vehicle", "Vehicle Loan"),
        ("las", "Loan Against Securities"),
        ("scf", "Supply Chain Financing"),
    ]

    PAYMENT_METHODS = [
        ("upi", "UPI"),
        ("net_banking", "Net Banking"),
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    loan_type = models.CharField(
        max_length=30,
        choices=LOAN_TYPES
    )

    transaction_date = models.DateField()

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    emi_number = models.PositiveIntegerField()
    def __str__(self):
        return f"{self.user.username} - {self.loan_type} - ₹{self.amount}"
#-------------------------------
#Review and confirmation
#--------------------------------
LOAN_TYPES = [
    ("personal", "Personal Loan"),
    ("business", "Business Loan"),
    ("education", "Education Loan"),
    ("consumer_durable", "Consumer Durable Loan"),
    ("gold", "Gold Loan"),
    ("lap", "Loan Against Property"),
    ("vehicle", "Vehicle Loan"),
    ("las", "Loan Against Securities"),
    ("scf", "Supply Chain Financing"),
]

POPULAR_BANKS = [
    ("SBI", "State Bank of India"),
    ("HDFC", "HDFC Bank"),
    ("ICICI", "ICICI Bank"),
    ("AXIS", "Axis Bank"),
    ("KOTAK", "Kotak Mahindra Bank"),
    ("PNB", "Punjab National Bank"),
    ("OTHER", "Other Bank"),
]

ACCOUNT_TYPES = [
    ("SAVINGS", "Savings"),
    ("CURRENT", "Current"),
]

FREQUENCY_CHOICES = [
    ("MONTHLY", "Monthly"),
    ("QUARTERLY", "Quarterly"),
]

DEBIT_DAYS = [(str(i), str(i)) for i in range(1, 13)]

AUTH_METHODS = [
    ("NET_BANKING", "Net Banking"),
    ("DEBIT_CARD", "Debit Card"),
]

class Review(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    loan_type = models.CharField(max_length=30, choices=LOAN_TYPES)

    loan_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    principal_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    emi_number = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    due_date = models.DateField(
        null=True,
        blank=True
    )

    popular_bank = models.CharField(
        max_length=20,
        choices=POPULAR_BANKS,
        blank=True,
        null=True
    )

    bank_name = models.CharField(max_length=150)
    account_holder_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=25)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    ifsc_code = models.CharField(max_length=15)

    maximum_debit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    debit_day_of_month = models.CharField(
        max_length=2,
        choices=DEBIT_DAYS,
        null=True,
        blank=True
    )

    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        null=True,
        blank=True
    )

    mandate_start_date = models.DateField(
        null=True,
        blank=True
    )

    mandate_end_date = models.DateField(
        null=True,
        blank=True
    )

    authentication_method = models.CharField(
        max_length=20,
        choices=AUTH_METHODS,
        null=True,
        blank=True
    )

    mobile_number = models.CharField(max_length=15)
    email = models.EmailField()

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):

        if self.mandate_start_date and self.mandate_end_date:
            if self.mandate_end_date <= self.mandate_start_date:
                raise ValidationError(
                    "Mandate End Date must be after Start Date."
                )

        if self.principal_amount and self.loan_amount:
            if self.principal_amount > self.loan_amount:
                raise ValidationError(
                    "Principal cannot be greater than Loan Amount."
                )

    def __str__(self):
        return f"{self.user.username} - {self.loan_type} AutoPay"
    
from django.db import models
from django.conf import settings
from loan.models import Loan,EMI


class AutoPayMandate(models.Model):

    AUTH_METHOD_CHOICES = [
        ("netbanking", "Net Banking"),
        ("debitcard", "Debit Card"),
    ]

    ACCOUNT_TYPE_CHOICES = [
        ("savings", "Savings"),
        ("current", "Current"),
    ]

    FREQUENCY_CHOICES = [
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="autopay_mandates"
    )

    loan = models.OneToOneField(
        Loan,
        on_delete=models.CASCADE,
        related_name="autopay"
    )

    # Bank Details
    bank_name = models.CharField(max_length=150)
    account_holder_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=25)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES)
    ifsc_code = models.CharField(max_length=11)

    # Mandate configuration
    max_debit_amount = models.DecimalField(max_digits=12, decimal_places=2)
    debit_day = models.IntegerField()
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)

    start_date = models.DateField()
    end_date = models.DateField()

    # Authentication
    auth_method = models.CharField(max_length=20, choices=AUTH_METHOD_CHOICES)
    mobile_number = models.CharField(max_length=10)
    email = models.EmailField()

    # Mandate status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    mandate_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Reference ID returned by bank/NPCI"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.loan} - AutoPay Mandate"
    
class Payment(models.Model):
    PAYMENT_METHODS = [
        ("upi", "UPI"),
        ("net_banking", "Net Banking"),
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
    ]
    transaction_id = models.CharField(max_length=200)
    payment_method = models.CharField(max_length=100,choices=PAYMENT_METHODS)
    date = models.DateField(auto_now_add=True)
    emi = models.OneToOneField(EMI,on_delete=models.CASCADE,related_name="payment")