from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *


class EligibilityManagementViewSet(ModelViewSet):
    queryset = EligibilityManagement.objects.all()
    serializer_class = EligibilityManagementSerializer
    permission_classes = [IsAuthenticated]


from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *


class EligibilityManagementViewSet(ModelViewSet):
    queryset = EligibilityManagement.objects.all()
    serializer_class = EligibilityManagementSerializer
    permission_classes = [IsAuthenticated]


class BankingManagementViewSet(ModelViewSet):
    queryset = BankingManagement.objects.all()
    serializer_class = BankingManagementSerializer
    permission_classes = [IsAuthenticated]


from adminpanel.obligation_management.views import ObligationManagementViewSet as ExistingObligationManagementViewSet


class ScoreCardManagementViewSet(ModelViewSet):
    queryset = ScoreCardManagement.objects.all()
    serializer_class = ScoreCardManagementSerializer
    permission_classes = [IsAuthenticated]
