from django.urls import path
from .views import KYCVerificationViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("verification", KYCVerificationViewSet, basename="verification")

urlpatterns = router.urls
