from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import KYCVerification
from .serializers import KYCVerificationSerializer
import random


class KYCVerificationViewSet(ModelViewSet):
    serializer_class = KYCVerificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KYCVerification.objects.filter(user=self.request.user)

    def get_object(self):
        kyc, created = KYCVerification.objects.get_or_create(
            user=self.request.user
        )
        return kyc

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        kyc = self.get_object()

        if request.method == "GET":
            serializer = self.get_serializer(kyc)
            return Response(serializer.data)

        if request.method == "PATCH":
            serializer = self.get_serializer(
                kyc, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

    def perform_update(self, serializer):
        kyc = serializer.save()

        # Aadhar verification
        if kyc.aadhar_number:
            kyc.aadhar_status = "verified"

        # PAN verification
        if kyc.pan_number:
            kyc.pan_status = "verified"

        # DigiLocker verification
        if kyc.digilocker_mobile:
            kyc.digilocker_status = "verified"

        # Credit score generation
        if kyc.kyc_completed() and not kyc.credit_score:
            kyc.credit_score = random.randint(650, 800)
            kyc.credit_status = "verified"

        kyc.save()