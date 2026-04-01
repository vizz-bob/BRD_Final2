from django.urls import path
from .views import SimpleLoginView, UserProfileView

urlpatterns = [
    path('simple-login/', SimpleLoginView.as_view(), name='simple-login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
