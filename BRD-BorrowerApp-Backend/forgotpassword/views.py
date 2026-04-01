import random
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib import messages
from .models import ForgotPasswordOTP, ResetPasswordToken
from .forms import ResetPasswordForm


# ==============================
# SEND OTP
# ==============================
def send_otp(request):
    if request.method == "POST":
        mobile = request.POST.get("mobile_number")

        if not mobile:
            return JsonResponse({"error": "Mobile number required"}, status=400)

        # Delete old OTP for same mobile
        ForgotPasswordOTP.objects.filter(contact=mobile).delete()

        # Create new OTP (OTP auto-generate hoga model me)
        otp_obj = ForgotPasswordOTP.objects.create(
            contact=mobile
        )

        # TEMP (testing)
        print("Generated OTP:", otp_obj.otp)

        return JsonResponse({"message": "OTP sent successfully"})

    return JsonResponse({"error": "Invalid request"}, status=400)


# ==============================
# VERIFY OTP
# ==============================
def verify_otp(request):
    if request.method == "POST":
        mobile = request.POST.get("mobile_number")
        entered_otp = request.POST.get("otp")

        otp_obj = ForgotPasswordOTP.objects.filter(
            contact=mobile
        ).first()

        if not otp_obj:
            return JsonResponse({"error": "OTP not found"}, status=400)

        if entered_otp == otp_obj.otp:
            otp_obj.delete()
            return JsonResponse({"message": "OTP verified successfully"})
        else:
            return JsonResponse({"error": "Invalid OTP"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)


# ==============================
# RESET PASSWORD
# ==============================
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from .forms import ResetPasswordForm

def reset_password(request):
    if request.method == "POST":
        form = ResetPasswordForm(request.POST)
        if form.is_valid():
            new_password = form.cleaned_data["new_password"]
            confirm_password = form.cleaned_data["confirm_password"]

            if new_password == confirm_password:
                user = request.user   # logged in user
                user.set_password(new_password)
                user.save()
                messages.success(request, "Password reset successfully")
                return redirect("login")
            else:
                messages.error(request, "Passwords do not match")
    else:
        form = ResetPasswordForm()

    return render(request, "forgotpassword/reset_password.html", {"form": form})
