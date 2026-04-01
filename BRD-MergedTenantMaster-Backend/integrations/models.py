from django.db import models
from tenants.models import Tenant

class GlobalApiCategory(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Lucide icon name or CSS class")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "global_api_categories"
        verbose_name = "Global API Category"
        verbose_name_plural = "Global API Categories"

    def __str__(self):
        return self.name

class GlobalApiProvider(models.Model):
    category = models.ForeignKey(GlobalApiCategory, related_name='providers', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='inactive')
    base_url = models.URLField(max_length=500, blank=True)
    auth_type = models.CharField(max_length=100, blank=True)
    test_key = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "global_api_providers"
        verbose_name = "Global API Provider"
        verbose_name_plural = "Global API Providers"

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class APIIntegration(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    global_provider = models.ForeignKey(GlobalApiProvider, on_delete=models.SET_NULL, null=True, blank=True, related_name='tenant_integrations')
    provider = models.CharField(max_length=200, blank=True) # Keep for legacy or custom
    config = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "integrations"

    def __str__(self):
        return f"{self.name} ({self.tenant})"

class WebhookLog(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)
    event = models.CharField(max_length=200)
    payload = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "webhook_logs"

    def __str__(self):
        return f"Webhook: {self.event} ({self.tenant})"
