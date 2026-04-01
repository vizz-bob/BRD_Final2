from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models.functions import TruncWeek, TruncMonth

from .models import Report, WeeklySnapshot, ReportSchedule, ReportTemplate, DashboardMetric
from .serializers import (
    ReportSerializer, WeeklySnapshotSerializer, ReportScheduleSerializer,
    ReportTemplateSerializer, DashboardMetricSerializer, ReportAnalyticsSerializer
)

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Report.objects.all()
        category = self.request.query_params.get('category')
        metric_name = self.request.query_params.get('metric_name')
        trend = self.request.query_params.get('trend')
        
        if category:
            queryset = queryset.filter(category=category)
        if metric_name:
            queryset = queryset.filter(metric_name=metric_name)
        if trend:
            queryset = queryset.filter(trend=trend)
            
        return queryset.select_related('created_by')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get comprehensive report analytics"""
        total_reports = Report.objects.count()
        
        # Reports by category
        reports_by_category = list(
            Report.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('category')
        )
        
        # Recent reports
        recent_reports = Report.objects.select_related('created_by')[:10]
        
        # Top dashboard metrics
        top_metrics = DashboardMetric.objects.filter(is_active=True)[:20]
        
        # Weekly trends (last 12 weeks)
        twelve_weeks_ago = timezone.now() - timedelta(weeks=12)
        weekly_trends = WeeklySnapshot.objects.filter(
            created_at__gte=twelve_weeks_ago
        ).order_by('-year', '-week_number')[:12]
        
        data = {
            'total_reports': total_reports,
            'reports_by_category': reports_by_category,
            'recent_reports': ReportSerializer(recent_reports, many=True).data,
            'top_metrics': DashboardMetricSerializer(top_metrics, many=True).data,
            'weekly_trends': WeeklySnapshotSerializer(weekly_trends, many=True).data,
        }
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def dashboard_metrics(self, request):
        """Get all dashboard metrics"""
        metrics = DashboardMetric.objects.filter(is_active=True)
        return Response(DashboardMetricSerializer(metrics, many=True).data)

    @action(detail=False, methods=['post'])
    def generate_report(self, request):
        """Generate a new report based on template"""
        template_id = request.data.get('template_id')
        if not template_id:
            return Response({'error': 'Template ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            template = ReportTemplate.objects.get(id=template_id)
            # Generate report based on template configuration
            # This is a placeholder - implement actual report generation logic
            report_data = template.template_config
            
            report = Report.objects.create(
                title=f"Generated Report - {template.name}",
                metric_name=report_data.get('metric_name', 'custom'),
                value=report_data.get('value', '0'),
                category=report_data.get('category', 'overview'),
                chart_data=report_data.get('chart_data', {}),
                created_by=request.user
            )
            
            return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)
        except ReportTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

class WeeklySnapshotViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklySnapshotSerializer
    queryset = WeeklySnapshot.objects.all()

    @action(detail=False, methods=['get'])
    def current_week(self, request):
        """Get current week snapshot"""
        now = timezone.now()
        week_number = now.isocalendar()[1]
        year = now.year
        
        snapshot, created = WeeklySnapshot.objects.get_or_create(
            week_number=week_number,
            year=year,
            defaults={
                'total_leads': 0,
                'applications': 0,
                'disbursed_amount': 0.0
            }
        )
        
        return Response(WeeklySnapshotSerializer(snapshot).data)

    @action(detail=False, methods=['get'])
    def weekly_trends(self, request):
        """Get weekly trends for the last 12 weeks"""
        twelve_weeks_ago = timezone.now() - timedelta(weeks=12)
        snapshots = WeeklySnapshot.objects.filter(
            created_at__gte=twelve_weeks_ago
        ).order_by('year', 'week_number')
        
        return Response(WeeklySnapshotSerializer(snapshots, many=True).data)

class ReportScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ReportScheduleSerializer
    queryset = ReportSchedule.objects.all()

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle schedule active status"""
        schedule = self.get_object()
        schedule.is_active = not schedule.is_active
        schedule.save()
        return Response(ReportScheduleSerializer(schedule).data)

class ReportTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = ReportTemplateSerializer
    queryset = ReportTemplate.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a template"""
        template = self.get_object()
        new_template = ReportTemplate.objects.create(
            name=f"{template.name} (Copy)",
            description=template.description,
            template_config=template.template_config,
            created_by=request.user
        )
        return Response(ReportTemplateSerializer(new_template).data, status=status.HTTP_201_CREATED)

class DashboardMetricViewSet(viewsets.ModelViewSet):
    serializer_class = DashboardMetricSerializer
    queryset = DashboardMetric.objects.all()

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update multiple metrics"""
        metrics_data = request.data.get('metrics', [])
        updated_metrics = []
        
        for metric_data in metrics_data:
            metric_id = metric_data.get('id')
            if metric_id:
                try:
                    metric = DashboardMetric.objects.get(id=metric_id)
                    for field, value in metric_data.items():
                        if field != 'id':
                            setattr(metric, field, value)
                    metric.save()
                    updated_metrics.append(metric)
                except DashboardMetric.DoesNotExist:
                    continue
        
        return Response(DashboardMetricSerializer(updated_metrics, many=True).data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get metrics grouped by category"""
        category = request.query_params.get('category')
        if category:
            metrics = DashboardMetric.objects.filter(category=category, is_active=True)
        else:
            metrics = DashboardMetric.objects.filter(is_active=True)
        
        # Group by category
        grouped_metrics = {}
        for metric in metrics:
            if metric.category not in grouped_metrics:
                grouped_metrics[metric.category] = []
            grouped_metrics[metric.category].append(DashboardMetricSerializer(metric).data)
        
        return Response(grouped_metrics)