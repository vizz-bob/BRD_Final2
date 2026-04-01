from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import ObligationManagement
from .serializers import ObligationManagementSerializer

class ObligationManagementViewSet(ModelViewSet):
    queryset = ObligationManagement.objects.all().order_by("-created_at")
    serializer_class = ObligationManagementSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "put", "delete", "head", "options"]
