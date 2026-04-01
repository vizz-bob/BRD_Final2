from rest_framework import serializers
from .models import ObligationManagement

class ObligationManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObligationManagement
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
