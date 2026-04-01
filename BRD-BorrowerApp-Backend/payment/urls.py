from django.urls import path
from .views import UpcomingPaymentsViewSet,AutoPayMandateCreateView,MakePaymentView,PaymentHistoryView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register('upcoming-payments',UpcomingPaymentsViewSet,basename="upcoming_payments")
urlpatterns = router.urls + [
    path("autopay/create/", AutoPayMandateCreateView.as_view(), name="create-autopay"),
    path("pay/",MakePaymentView.as_view(),name="pay"),
    path("history/", PaymentHistoryView.as_view(),name="transaction_history"),
]
