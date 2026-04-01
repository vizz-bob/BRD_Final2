from django.contrib import admin
from .models import ObligationManagement

@admin.register(ObligationManagement)
class ObligationManagementAdmin(admin.ModelAdmin):
    # Matching the 'Eligibility Management' format shown by the user in the screenshot
    list_display = (
        "loan_status", 
        "loan_performance", 
        "card_type", 
        "credit_card_status", 
        "credit_card_performance", 
        "total_loans", 
        "is_active", 
        "created_at"
    )
    list_filter = ("is_active", "loan_performance", "credit_card_performance")
    search_fields = ("loan_status", "card_type", "credit_card_status")
    ordering = ("-created_at",)
    
    # Ensuring the form fields order follows the same "feel" as the user's reference
    fieldsets = (
        ("Loan Details", {
            "fields": ("loan_status", "loan_performance", "total_loans")
        }),
        ("Credit Card Details", {
            "fields": ("card_type", "credit_card_status", "credit_card_performance")
        }),
        ("Status", {
            "fields": ("is_active",)
        }),
    )
