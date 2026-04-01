from django.urls import path
from .views import LoginView, MeView, sso_login

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("me/", MeView.as_view()),
    path("sso-login/", sso_login),
]
