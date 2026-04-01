from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import CreateAPIView,ListAPIView
from rest_framework.response import Response
from .serializers import AutoPayMandateSerializer,MakePaymentSerializer,PaymentHistorySerializer
from django.utils import timezone
from loan.models import Loan
from .models import Payment
from rest_framework import status
from django.db import transaction
from rest_framework.exceptions import ValidationError

class UpcomingPaymentsViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Loan.objects.none()
    serializer_class = None

    def list(self, request):
        user = request.user
        today = timezone.now().date()

        loans = (
            Loan.objects
            .filter(application__user=user)
            .select_related("application", "autopay")
            .prefetch_related("emis")
        )

        results = []

        for loan in loans:

            # next unpaid emi
            emi = (
                loan.emis
                .filter(status__in=["scheduled", "partially_paid"])
                .order_by("due_date")
                .first()
            )

            if not emi:
                continue

            days_left = (emi.due_date - today).days

            # autopay detection
            autopay = getattr(loan, "autopay", None)

            autopay_enabled = (
                autopay is not None
                and autopay.is_active
                and autopay.status == "active"
            )

            results.append({
                "loanId": loan.id,
                "emi_id": emi.id,
                "loanType": loan.application.get_loan_type_display(),

                "loanAmount": f"₹{loan.principal_amount:,.0f}",

                "emiNumber": emi.emi_number,
                "dueDate": emi.due_date,

                "emiAmount": f"₹{emi.amount:,.0f}",
                "principal": f"₹{emi.principal_component:,.0f}",
                "interest": f"₹{emi.interest_component:,.0f}",

                "daysLeft": days_left,
                "isOverdue": days_left < 0,

                "autoPayEnabled": autopay_enabled,
            })

        return Response(results)
    
class AutoPayMandateCreateView(CreateAPIView):
    serializer_class = AutoPayMandateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        loan_id = self.request.data.get("loan")

        try:
            loan = Loan.objects.get(
                id=loan_id,
                application__user=self.request.user
            )
        except Loan.DoesNotExist:
            raise ValidationError("Invalid loan")

        serializer.save(
            user=self.request.user,
            loan=loan,
            is_active=True,
            status="active"
        )

class MakePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = MakePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        emi = serializer.validated_data["emi"]

        payment = Payment.objects.create(
            emi=emi,
            transaction_id=serializer.validated_data["transaction_id"],
            payment_method=serializer.validated_data["payment_method"],
        )

        # Update EMI
        emi.status = "paid"
        emi.paid_on = timezone.now()
        emi.save()

        return Response(
            {
                "message": "Payment successful",
                "payment_id": payment.id,
                "emi_id": emi.id,
                "status": emi.status,
            },
            status=status.HTTP_201_CREATED,
        )
    

class PaymentHistoryView(ListAPIView):
    serializer_class = PaymentHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Payment.objects.filter(
            emi__loan__application__user=user
        ).select_related(
            "emi",
            "emi__loan",
            "emi__loan__application"
        ).order_by("-date")