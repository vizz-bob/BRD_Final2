from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Loan, EMI

@receiver(post_save, sender=Loan)
def trigger_emi_generation(sender, instance, created, **kwargs):
    if instance.current_stage == "disbursed" and not instance.emis.exists():
        instance.generate_emis()