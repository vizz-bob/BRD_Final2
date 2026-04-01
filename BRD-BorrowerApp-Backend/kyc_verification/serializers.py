from rest_framework import serializers
from .models import KYCVerification

class KYCVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCVerification
        fields = "__all__"
        read_only_fields = [
            "aadhar_status",
            "pan_status",
            "digilocker_status",
            "credit_score",
            "credit_status",
        ]