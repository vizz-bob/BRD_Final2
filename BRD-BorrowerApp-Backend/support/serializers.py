from rest_framework import serializers
from .models import SupportTicket


class SupportTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = SupportTicket
        fields = "__all__"
        read_only_fields = [
            "user",
            "status",
            "admin_response",
            "created_at",
            "updated_at"
        ]