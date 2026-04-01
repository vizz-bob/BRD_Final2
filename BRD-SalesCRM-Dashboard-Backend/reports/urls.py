from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet, WeeklySnapshotViewSet, ReportScheduleViewSet,
    ReportTemplateViewSet, DashboardMetricViewSet
)

router = DefaultRouter()
router.register(r'weekly', WeeklySnapshotViewSet, basename='weekly-snapshot')
router.register(r'schedules', ReportScheduleViewSet, basename='report-schedule')
router.register(r'templates', ReportTemplateViewSet, basename='report-template')
router.register(r'metrics', DashboardMetricViewSet, basename='dashboard-metric')
router.register(r'', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]