from django.contrib import admin
from .models import SetupAutoPay , UpcomingPayment , ManagePayment , RecentTransaction , Review, AutoPayMandate

admin.site.register(AutoPayMandate)
@admin.register(SetupAutoPay)

class SetupAutoPayAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "loan_type",
        "loan_amount",
        "principal_amount",
        "interest_rate",
        "emi_number",
        "due_date",
        "bank_name",
        "frequency",
        "authentication_method",
        "created_at",
    )

    list_filter = (
        "loan_type",
        "frequency",
        "authentication_method",
        "account_type",
    )

    search_fields = (
        "user__username",
        "bank_name",
        "account_holder_name",
        "mobile_number",
        "email",
    )
#---------------------------
# Upcoming payment
#-----------------------------
@admin.register(UpcomingPayment)
class UpcomingPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "loan_type",
        "emi_number",
        "due_date",
        "total_amount",
        "status",
        "payment_method",
        "last_paid_on",
    )

    list_filter = ("loan_type", "status", "payment_method")
    search_fields = ("user__username",)
#------------------------------
# Manage payment
#------------------------------
admin.site.register(ManagePayment)
#--------------------------------
# Recent Transactions
#--------------------------------
admin.site.register(RecentTransaction)
admin.site.register(Review)