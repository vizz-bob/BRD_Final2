from django.db import models
from django.utils import timezone
import random
from django.contrib.auth.models import User


# ============================
# FORGOT PASSWORD (OTP ONLY)
# ============================

class ForgotPasswordOTP(models.Model):
    contact = models.CharField(max_length=100)
    otp = models.CharField(max_length=6, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        # Generate OTP if not exists
        if not self.otp:
            self.otp = str(random.randint(100000, 999999))

        super().save(*args, **kwargs)

        # Just print OTP in console (for testing)
        print("Generated OTP:", self.otp)

    def __str__(self):
        return self.contact
# ============================
# RESET PASSWORD (TOKEN)
# ============================
class ResetPasswordToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    new_password = models.CharField(max_length=128, null=True, blank=True)
    confirm_new_password = models.CharField(max_length=128, null=True, blank=True)

    def __str__(self):
        return self.user.username
