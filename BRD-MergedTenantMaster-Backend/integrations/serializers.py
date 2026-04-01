from rest_framework import serializers
from .models import APIIntegration, WebhookLog, GlobalApiCategory, GlobalApiProvider

class GlobalApiProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalApiProvider
        fields = "__all__"

class GlobalApiCategorySerializer(serializers.ModelSerializer):
    providers = GlobalApiProviderSerializer(many=True, read_only=True)

    class Meta:
        model = GlobalApiCategory
        fields = ["id", "name", "description", "icon", "providers"]

class APIIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIIntegration
        fields = "__all__"
        read_only_fields = ("created_at",)

class WebhookLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookLog
        fields = "__all__"
        read_only_fields = ("received_at",)
