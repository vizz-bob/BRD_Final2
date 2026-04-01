from django.db import models
from django.contrib.auth.models import User


class SupportTicket(models.Model):

    CATEGORY_CHOICES = [
        ("emi_payment", "EMI / Payment Issue"),
        ("mandate", "Mandate Issue"),
        ("document", "Document Issue"),
        ("kyc", "KYC Issue"),
        ("technical", "App / Technical Issue"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="support_tickets"
    )

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    description = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="open"
    )

    admin_response = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id} - {self.user}"