from django.db import models
import uuid

class ObligationManagement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Matching React Frontend Details
    loan_status = models.CharField(max_length=100)
    loan_performance = models.CharField(max_length=100)
    
    card_type = models.CharField(max_length=100)
    credit_card_status = models.CharField(max_length=100)
    credit_card_performance = models.CharField(max_length=100)
    
    total_loans = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "obligation_management"
        verbose_name = "Obligation Management"
        verbose_name_plural = "Obligation Managements"

    def __str__(self):
        return f"Obligation - {self.loan_status}"
