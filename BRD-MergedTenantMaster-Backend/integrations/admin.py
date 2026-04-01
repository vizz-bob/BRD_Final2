from django.contrib import admin
from .models import APIIntegration, WebhookLog, GlobalApiCategory, GlobalApiProvider

class GlobalApiProviderInline(admin.TabularInline):
    model = GlobalApiProvider
    extra = 1

@admin.register(GlobalApiCategory)
class GlobalApiCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    inlines = [GlobalApiProviderInline]

@admin.register(GlobalApiProvider)
class GlobalApiProviderAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status_symbol', 'auth_type', 'created_at')
    list_filter = ('category', 'status', 'auth_type')
    search_fields = ('name', 'category__name')

    @admin.display(boolean=True, description='Status')
    def status_symbol(self, obj):
        return obj.status == 'active'


@admin.register(APIIntegration)
class APIIntegrationAdmin(admin.ModelAdmin):
    list_display = ('is_active', 'name', 'tenant', 'global_provider', 'provider', 'created_at')
    list_filter = ('is_active', 'tenant', 'global_provider')
    search_fields = ('name', 'provider')
    readonly_fields = ('created_at',)


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'event', 'received_at')
    list_filter = ('tenant', 'event', 'received_at')
    search_fields = ('event',)
    readonly_fields = ('received_at',)
