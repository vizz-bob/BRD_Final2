from django.urls import path
from . import views 
from .views import reset_password

urlpatterns = [
    path("send-otp/", views.send_otp, name="send_otp"),
    path("verify-otp/", views.verify_otp, name="verify_otp"),
    path('reset-password/', reset_password, name='reset_password'),
]



