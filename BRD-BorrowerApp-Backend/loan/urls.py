from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import LoanApplicationViewSet,LoansViewSet,ActiveLoansView,mark_kfs_completed,  CreateKFSView, GetKFSView,CreateSanctionLetterView, GetSanctionLetterView, CreateLoanAgreementView, GetLoanAgreementView

router = DefaultRouter()
router.register("applications", LoanApplicationViewSet, basename="loanapplication")
router.register("loans",LoansViewSet,basename="loans")
urlpatterns = router.urls + [
    path("active/",ActiveLoansView,name="active"),
    path("<int:loan_id>/kfs/", GetKFSView.as_view()),
    path("<int:loan_id>/kfs/create/", CreateKFSView.as_view()),

    path("<int:loan_id>/sanction/", GetSanctionLetterView.as_view()),
    path("<int:loan_id>/sanction/create/", CreateSanctionLetterView.as_view()),

    path("<int:loan_id>/agreement/", GetLoanAgreementView.as_view()),
    path("<int:loan_id>/agreement/create/", CreateLoanAgreementView.as_view()),

    path(
        "<int:loan_id>/complete-kfs/",
        mark_kfs_completed,
        name="mark_kfs_completed",
    ),
]