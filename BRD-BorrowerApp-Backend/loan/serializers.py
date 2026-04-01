from rest_framework import serializers
from .models import LoanApplication,Loan,EMI,KeyFactStatement, SanctionLetter, LoanAgreement

class LoanApplicationSerializer(serializers.ModelSerializer):
    loan_type_label = serializers.CharField(
        source="get_loan_type_display",
        read_only=True
    )
    class Meta:
        model = LoanApplication
        fields = "__all__"
        read_only_fields = ["application_id", "user", "status", "created_at"]

class EMISerializer(serializers.ModelSerializer):
    payment_method = serializers.SerializerMethodField()
    payment_date = serializers.SerializerMethodField()
    class Meta:
        model = EMI
        fields = '__all__'
        
    def get_payment_method(self, obj):
        if hasattr(obj, "payment"):
            return obj.payment.get_payment_method_display()
        return None

    def get_payment_date(self, obj):
        if hasattr(obj, "payment"):
            return obj.payment.date
        return None

class LoanSerializer(serializers.ModelSerializer):
    application = LoanApplicationSerializer(read_only=True)
    emis = EMISerializer(many=True, read_only=True)
    class Meta:
        model = Loan
        fields = "__all__"

class ActiveLoanSerializer(serializers.ModelSerializer):
    loan_type = serializers.CharField(source = "application.get_loan_type_display",read_only = True)

    class Meta:
        model = Loan
        fields = ['loan_type','principal_amount','monthly_emi']

class KFSSerializer(serializers.ModelSerializer):

    loanAmount = serializers.SerializerMethodField()
    interestRate = serializers.SerializerMethodField()
    processingFee = serializers.SerializerMethodField()
    annualPercentageRate = serializers.SerializerMethodField()
    tenure = serializers.SerializerMethodField()
    emi = serializers.SerializerMethodField()
    totalInterest = serializers.SerializerMethodField()
    totalAmount = serializers.SerializerMethodField()
    latePaymentCharges = serializers.CharField(source="late_payment_charges")
    prepaymentCharges = serializers.CharField(source="prepayment_charges")
    bounceCharges = serializers.CharField(source="bounce_charges")
    legalCharges = serializers.CharField(source="legal_charges")

    class Meta:
        model = KeyFactStatement
        fields = [
            "loanAmount",
            "interestRate",
            "processingFee",
            "annualPercentageRate",
            "tenure",
            "emi",
            "totalInterest",
            "totalAmount",
            "latePaymentCharges",
            "prepaymentCharges",
            "bounceCharges",
            "legalCharges",
        ]

    def get_loanAmount(self, obj):
        return f"₹{obj.loan.principal_amount:,.0f}"

    def get_interestRate(self, obj):
        return f"{obj.loan.interest_rate}% p.a."

    def get_processingFee(self, obj):
        return f"₹{obj.processing_fee:,.0f}"

    def get_annualPercentageRate(self, obj):
        return f"{obj.annual_percentage_rate}%"

    def get_tenure(self, obj):
        return f"{obj.loan.tenure_months} months"

    def get_emi(self, obj):
        return f"₹{obj.loan.monthly_emi:,.0f}"

    def get_totalInterest(self, obj):
        return f"₹{obj.total_interest:,.0f}"

    def get_totalAmount(self, obj):
        return f"₹{obj.total_amount_payable:,.0f}"


class SanctionLetterSerializer(serializers.ModelSerializer):

    sanctionNumber = serializers.CharField(source="sanction_number")
    sanctionDate = serializers.DateField(source="sanction_date", format="%d %b %Y")
    validTill = serializers.DateField(source="valid_till", format="%d %b %Y")

    loanType = serializers.SerializerMethodField()
    sanctionedAmount = serializers.SerializerMethodField()
    interestRate = serializers.SerializerMethodField()
    processingFee = serializers.SerializerMethodField()
    tenure = serializers.SerializerMethodField()
    emi = serializers.SerializerMethodField()
    terms = serializers.SerializerMethodField()

    class Meta:
        model = SanctionLetter
        fields = [
            "sanctionNumber",
            "sanctionDate",
            "validTill",
            "loanType",
            "sanctionedAmount",
            "interestRate",
            "processingFee",
            "tenure",
            "emi",
            "terms",
        ]

    def get_loanType(self, obj):
        return obj.loan.application.get_loan_type_display()

    def get_sanctionedAmount(self, obj):
        return f"₹{obj.loan.principal_amount:,.0f}"

    def get_interestRate(self, obj):
        return f"{obj.loan.interest_rate}%"

    def get_processingFee(self, obj):
        return f"₹{obj.processing_fee:,.0f}"

    def get_tenure(self, obj):
        return f"{obj.loan.tenure_months} months"

    def get_emi(self, obj):
        return f"₹{obj.loan.monthly_emi:,.0f}"

    def get_terms(self, obj):
        return [term.text for term in obj.terms.all()]


class LoanAgreementSerializer(serializers.ModelSerializer):
    agreementNumber = serializers.CharField(source="agreement_number")
    agreementDate = serializers.SerializerMethodField()
    borrowerName = serializers.CharField(source="loan.application.full_name")
    loanType = serializers.SerializerMethodField()
    loanAmount = serializers.SerializerMethodField()
    interestRate = serializers.SerializerMethodField()
    tenure = serializers.SerializerMethodField()
    emi = serializers.SerializerMethodField()
    downloadUrl = serializers.SerializerMethodField()

    class Meta:
        model = LoanAgreement
        fields = [
            "agreementNumber",
            "agreementDate",
            "borrowerName",
            "loanType",
            "loanAmount",
            "interestRate",
            "tenure",
            "emi",
            "downloadUrl",
        ]

    def get_agreementDate(self, obj):
        return obj.agreement_date.strftime("%d %b %Y")

    def get_loanType(self, obj):
        return obj.loan.application.get_loan_type_display()

    def get_loanAmount(self, obj):
        return f"₹{obj.loan.principal_amount:,.0f}"

    def get_interestRate(self, obj):
        return f"{obj.loan.interest_rate}% p.a."

    def get_tenure(self, obj):
        return f"{obj.loan.tenure_months} months"

    def get_emi(self, obj):
        return f"₹{obj.loan.monthly_emi:,.0f}"

    def get_downloadUrl(self, obj):
        request = self.context.get("request")
        if obj.agreement_file:
            return request.build_absolute_uri(obj.agreement_file.url)
        return None