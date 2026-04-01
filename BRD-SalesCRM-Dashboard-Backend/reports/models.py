from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class WeeklySnapshot(models.Model):
    week_number = models.IntegerField()
    year = models.IntegerField()
    total_leads = models.IntegerField(default=0)
    applications = models.IntegerField(default=0)
    disbursed_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-year", "-week_number"]
        unique_together = ['week_number', 'year']

    def __str__(self):
        return f"Week {self.week_number}, {self.year} Snapshot"

class Report(models.Model):
    CATEGORY_CHOICES = [
        ('overview', 'Overview'),
        ('team', 'Team Performance'),
        ('conversion', 'Conversion Metrics'),
        ('financial', 'Financial'),
        ('pipeline', 'Pipeline'),
        ('productivity', 'Productivity'),
    ]
    
    TREND_CHOICES = [
        ('up', 'Up'),
        ('down', 'Down'),
        ('stable', 'Stable'),
    ]

    title = models.CharField(max_length=255)
    metric_name = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    target = models.CharField(max_length=100, blank=True, null=True)
    trend = models.CharField(max_length=20, choices=TREND_CHOICES, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='overview')
    chart_data = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.metric_name})"

class ReportSchedule(models.Model):
    """Automated report generation schedule"""
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=100)  # weekly, monthly, quarterly
    recipients = models.JSONField(default=list)  # List of user IDs
    is_active = models.BooleanField(default=True)
    next_run = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.report_type}"

class ReportTemplate(models.Model):
    """Reusable report templates"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    template_config = models.JSONField(default=dict)  # Chart configurations, metrics, etc.
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class DashboardMetric(models.Model):
    """Real-time dashboard metrics"""
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    previous_value = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    change_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    unit = models.CharField(max_length=20, default='')  # %, ₹, count, etc.
    category = models.CharField(max_length=50, default='overview')
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'name']
        unique_together = ['name', 'category']

    def __str__(self):
        return f"{self.name} - {self.value} {self.unit}"