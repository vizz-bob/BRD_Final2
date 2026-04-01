from django.contrib.auth.models import User
from django.db import models
import random

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    account_number = models.CharField(max_length=12, unique=True, editable=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_pic = models.ImageField(upload_to="user/", blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.account_number:
            while True:
                number = "ACC" + str(random.randint(100000000, 999999999))
                if not UserProfile.objects.filter(account_number=number).exists():
                    self.account_number = number
                    break
        super().save(*args, **kwargs)