from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Report, WeeklySnapshot, ReportSchedule, ReportTemplate, DashboardMetric

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class ReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    trend_display = serializers.CharField(source='get_trend_display', read_only=True)

    class Meta:
        model = Report
        fields = '__all__'

class WeeklySnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklySnapshot
        fields = '__all__'

class ReportScheduleSerializer(serializers.ModelSerializer):
    recipients_details = serializers.SerializerMethodField()

    class Meta:
        model = ReportSchedule
        fields = '__all__'

    def get_recipients_details(self, obj):
        if obj.recipients:
            users = User.objects.filter(id__in=obj.recipients)
            return UserSerializer(users, many=True).data
        return []

class ReportTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = ReportTemplate
        fields = '__all__'

class DashboardMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardMetric
        fields = '__all__'

class ReportAnalyticsSerializer(serializers.Serializer):
    """Serializer for analytics endpoints"""
    total_reports = serializers.IntegerField()
    reports_by_category = serializers.JSONField()
    recent_reports = ReportSerializer(many=True)
    top_metrics = DashboardMetricSerializer(many=True)
    weekly_trends = WeeklySnapshotSerializer(many=True)
