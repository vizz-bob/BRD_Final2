from django.urls import path
from .views import LoginView, RegisterView, VerifyTokenView, LogoutView, SSOLoginView, SignupView
from .sync_user import sync_user_to_tenant

urlpatterns = [
    path('login/',    LoginView.as_view(),       name='auth-login'),
    path('register/', RegisterView.as_view(),    name='auth-register'),
    path('signup/',   SignupView.as_view(),      name='auth-signup'),
    path('verify/',   VerifyTokenView.as_view(), name='auth-verify'),
    path('logout/',   LogoutView.as_view(),      name='auth-logout'),
    path('sso-login/', SSOLoginView.as_view(),   name='sso-login'),
    path('sync-user/', sync_user_to_tenant,      name='sync-user-to-tenant'),
]