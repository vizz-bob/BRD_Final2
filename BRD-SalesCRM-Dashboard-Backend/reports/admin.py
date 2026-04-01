# Register your models here.
from django.contrib import admin
from .models import WeeklySnapshot, Report, ReportSchedule, ReportTemplate, DashboardMetric


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'metric_name', 'value', 'category', 'trend', 'created_by', 'updated_at']
    list_filter = ['category', 'metric_name', 'trend', 'created_at']
    search_fields = ['title', 'metric_name', 'description']
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'metric_name', 'description', 'created_by')
        }),
        ('Metrics', {
            'fields': ('value', 'target', 'trend', 'category')
        }),
        ('Chart Data', {
            'fields': ('chart_data',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WeeklySnapshot)
class WeeklySnapshotAdmin(admin.ModelAdmin):
    list_display = (
        "week_number",
        "year", 
        "total_leads",
        "applications",
        "disbursed_amount",
        "created_at",
    )
    list_filter = ("year", "week_number")
    ordering = ("-year", "-week_number")
    readonly_fields = ("created_at",)
    search_fields = ('year', 'week_number')
    fieldsets = (
        ("Week Info", {
            "fields": ("week_number", "year")
        }),
        ("Performance Metrics", {
            "fields": ("total_leads", "applications", "disbursed_amount")
        }),
        ("System", {
            "fields": ("created_at",)
        }),
    )


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'report_type', 'is_active', 'next_run', 'created_at']
    list_filter = ['report_type', 'is_active', 'created_at']
    search_fields = ['name', 'report_type']
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Schedule Information', {
            'fields': ('name', 'report_type', 'is_active')
        }),
        ('Recipients', {
            'fields': ('recipients',)
        }),
        ('Timing', {
            'fields': ('next_run',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_default', 'created_by', 'created_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Template Information', {
            'fields': ('name', 'description', 'is_default', 'created_by')
        }),
        ('Configuration', {
            'fields': ('template_config',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DashboardMetric)
class DashboardMetricAdmin(admin.ModelAdmin):
    list_display = ['name', 'value', 'previous_value', 'change_percentage', 'unit', 'category', 'is_active', 'last_updated']
    list_filter = ['category', 'is_active', 'last_updated']
    search_fields = ['name', 'category']
    readonly_fields = ('last_updated',)
    fieldsets = (
        ('Metric Information', {
            'fields': ('name', 'category', 'unit', 'is_active')
        }),
        ('Values', {
            'fields': ('value', 'previous_value', 'change_percentage')
        }),
        ('System', {
            'fields': ('last_updated',)
        }),
    )