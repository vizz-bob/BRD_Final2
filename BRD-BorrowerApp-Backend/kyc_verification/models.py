from django.db import models
from django.contrib.auth.models import User


class KYCVerification(models.Model):

    STATUS = (
        ("pending", "Pending"),
        ("verified", "Verified"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="kyc")

    # Aadhar
    aadhar_number = models.CharField(max_length=12, blank=True, null=True)
    aadhar_file = models.FileField(upload_to="kyc/aadhar/", blank=True, null=True)
    aadhar_status = models.CharField(max_length=10, choices=STATUS, default="pending")

    # PAN
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    pan_file = models.FileField(upload_to="kyc/pan/", blank=True, null=True)
    pan_status = models.CharField(max_length=10, choices=STATUS, default="pending")

    # DigiLocker
    digilocker_mobile = models.CharField(max_length=10, blank=True, null=True)
    digilocker_status = models.CharField(max_length=10, choices=STATUS, default="pending")

    # Credit Score
    credit_score = models.IntegerField(blank=True, null=True)
    credit_status = models.CharField(max_length=10, choices=STATUS, default="pending")

    def kyc_completed(self):
        return (
            self.aadhar_status == "verified"
            and self.pan_status == "verified"
            and self.digilocker_status == "verified"
        )

    def __str__(self):
        return self.user.username
#-------------------------------
# Help & Support
#--------------------------------
from django.db import models
from django.contrib.auth.models import User


class SupportTicket(models.Model):

    CATEGORY_CHOICES = [
        ("emi", "EMI / Payment Issue"),
        ("mandate", "Mandate Issue"),
        ("document", "Document Issue"),
        ("kyc", "KYC Issue"),
        ("technical", "App / Technical Issue"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.category}"
