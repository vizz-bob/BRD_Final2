from django.contrib import admin
from .models import ForgotPasswordOTP, ResetPasswordToken


admin.site.register(ForgotPasswordOTP)
admin.site.register(ResetPasswordToken)
