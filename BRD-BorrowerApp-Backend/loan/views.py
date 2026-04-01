from rest_framework.viewsets import ModelViewSet,ReadOnlyModelViewSet
from .models import LoanApplication,Loan,KeyFactStatement,SanctionLetter,LoanAgreement
from .serializers import LoanApplicationSerializer,LoanSerializer,ActiveLoanSerializer,KFSSerializer,SanctionLetterSerializer, LoanAgreementSerializer
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from decimal import Decimal
from datetime import date, timedelta
from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required


class LoanApplicationViewSet(ModelViewSet):
    serializer_class = LoanApplicationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return LoanApplication.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LoansViewSet(ReadOnlyModelViewSet):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Loan.objects.filter(application__user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ActiveLoansView(request):
    loans = Loan.objects.filter(application__user=request.user,status="approved")
    serializer = ActiveLoanSerializer(loans,many=True)
    return Response(serializer.data)

def create_loan_from_application(application):

    loan = Loan.objects.create(
        application=application,
        principal_amount=application.loan_amount,
        remaining_principal=application.loan_amount,
        interest_rate=Decimal("12.0"), # temporary
        tenure_months=36,
        monthly_emi=Decimal("0"), # temporary
        status="approved",
        current_stage="sanction_process"
    )

    return loan

@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_application(request, pk):

    application = LoanApplication.objects.get(id=pk)

    application.status = "approved"
    application.save()

    loan = create_loan_from_application(application)

    return Response({"loan_id": loan.id})


class CreateKFSView(CreateAPIView):
    serializer_class = KFSSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        loan_id = self.kwargs["loan_id"]

        loan = get_object_or_404(
            Loan,
            id=loan_id,
            application__user=self.request.user
        )

        serializer.save(loan=loan)


class GetKFSView(RetrieveAPIView):
    serializer_class = KFSSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        loan_id = self.kwargs["loan_id"]

        return get_object_or_404(
            KeyFactStatement,
            loan__id=loan_id,
            loan__application__user=self.request.user
        )



class CreateSanctionLetterView(CreateAPIView):
    serializer_class = SanctionLetterSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        loan_id = self.kwargs["loan_id"]

        loan = get_object_or_404(
            Loan,
            id=loan_id,
            application__user=self.request.user
        )

        serializer.save(loan=loan)


class GetSanctionLetterView(RetrieveAPIView):
    serializer_class = SanctionLetterSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        loan_id = self.kwargs["loan_id"]

        return get_object_or_404(
            SanctionLetter,
            loan__id=loan_id,
            loan__application__user=self.request.user
        )


class CreateLoanAgreementView(CreateAPIView):
    serializer_class = LoanAgreementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        loan_id = self.kwargs["loan_id"]

        loan = get_object_or_404(
            Loan,
            id=loan_id,
            application__user=self.request.user
        )

        serializer.save(loan=loan)


class GetLoanAgreementView(RetrieveAPIView):
    serializer_class = LoanAgreementSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        loan_id = self.kwargs["loan_id"]

        return get_object_or_404(
            LoanAgreement,
            loan__id=loan_id,
            loan__application__user=self.request.user
        )
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_kfs_completed(request, loan_id):
    loan = get_object_or_404(
        Loan,
        id=loan_id,
        application__user=request.user
    )

    # Validate stage
    if loan.current_stage != "kfs_review":
        return Response(
            {"error": "KFS cannot be completed at this stage."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Ensure KFS exists
    if not hasattr(loan, "kfs"):
        return Response(
            {"error": "KFS not generated for this loan."},
            status=status.HTTP_400_BAD_REQUEST
        )

    loan.current_stage = "kfs_completed"
    loan.save(update_fields=["current_stage"])

    return Response({
        "message": "KFS marked as completed",
        "loan_id": loan.id,
        "current_stage": loan.current_stage
    })

    return JsonResponse({
        "message": "KFS marked as completed",
        "loan_id": loan.id,
        "current_stage": loan.current_stage
    })