from django.contrib import admin
from .models import KYCVerification


@admin.register(KYCVerification)
class KYCAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "aadhar_status",
        "pan_status",
        "digilocker_status",
        "credit_status",
    )
#---------------------------------
#Help and support
#---------------------------------
from django.contrib import admin
from .models import SupportTicket


@admin.register(SupportTicket)
class SupportAdmin(admin.ModelAdmin):

    list_display = ("user", "category", "status", "created_at")
    list_filter = ("category", "status")
    search_fields = ("user__username",)

