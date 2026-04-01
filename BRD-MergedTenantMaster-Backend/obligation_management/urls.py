from rest_framework.routers import DefaultRouter
from .views import ObligationManagementViewSet

router = DefaultRouter()
router.register("obligations", ObligationManagementViewSet, basename="obligation-management")

urlpatterns = router.urls
