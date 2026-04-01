from rest_framework import serializers
from .models import AutoPayMandate
from .models import Payment, EMI

class AutoPayMandateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoPayMandate
        exclude = ["user", "status", "mandate_reference", "created_at", "updated_at", "is_active"]

    def validate_loan(self, value):
        if hasattr(value, "autopay"):
            raise serializers.ValidationError("AutoPay already exists for this loan.")
        return value

class MakePaymentSerializer(serializers.Serializer):
    emi_id = serializers.IntegerField()
    transaction_id = serializers.CharField(max_length=200)
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHODS)

    def validate(self, data):
        emi_id = data["emi_id"]

        try:
            emi = EMI.objects.get(id=emi_id)
        except EMI.DoesNotExist:
            raise serializers.ValidationError("EMI not found")

        if emi.status == "paid":
            raise serializers.ValidationError("This EMI is already paid")

        if hasattr(emi, "payment"):
            raise serializers.ValidationError("Payment already exists for this EMI")

        data["emi"] = emi
        return data


class PaymentHistorySerializer(serializers.ModelSerializer):
    loanType = serializers.CharField(source="emi.loan.application.get_loan_type_display")
    amount = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    paymentMode = serializers.CharField(source="get_payment_method_display")
    transactionId = serializers.CharField(source="transaction_id")

    class Meta:
        model = Payment
        fields = [
            "id",
            "loanType",
            "amount",
            "date",
            "status",
            "paymentMode",
            "transactionId",
        ]

    def get_amount(self, obj):
        return f"₹{obj.emi.amount:,.0f}"

    def get_date(self, obj):
        if obj.emi.paid_on:
            return obj.emi.paid_on.date()
        return obj.date

    def get_status(self, obj):
        if obj.emi.status == "paid":
            return "success"
        return "failed"