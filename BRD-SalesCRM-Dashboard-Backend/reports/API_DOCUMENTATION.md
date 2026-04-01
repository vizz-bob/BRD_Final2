# Reports Backend API Documentation

## Overview
This backend provides comprehensive reporting functionality for the Sales CRM Dashboard. It includes real-time metrics, weekly snapshots, report generation, scheduling, and templates.

## Base URL
```
/api/reports/
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Reports (`/api/reports/`)

#### Standard CRUD Operations
- `GET /api/reports/` - List all reports
- `POST /api/reports/` - Create new report
- `GET /api/reports/{id}/` - Get specific report
- `PUT /api/reports/{id}/` - Update report
- `PATCH /api/reports/{id}/` - Partial update report
- `DELETE /api/reports/{id}/` - Delete report

#### Query Parameters
- `category` - Filter by category (overview, team, conversion, financial, pipeline, productivity)
- `metric_name` - Filter by metric name
- `trend` - Filter by trend (up, down, stable)

#### Custom Actions
- `GET /api/reports/analytics/` - Get comprehensive analytics
- `GET /api/reports/dashboard_metrics/` - Get all dashboard metrics
- `POST /api/reports/generate_report/` - Generate report from template

#### Report Categories
- `overview` - Overview metrics
- `team` - Team Performance
- `conversion` - Conversion Metrics
- `financial` - Financial data
- `pipeline` - Pipeline metrics
- `productivity` - Productivity metrics

### 2. Weekly Snapshots (`/api/reports/weekly/`)

#### Standard CRUD Operations
- `GET /api/reports/weekly/` - List all weekly snapshots
- `POST /api/reports/weekly/` - Create weekly snapshot
- `GET /api/reports/weekly/{id}/` - Get specific snapshot
- `PUT /api/reports/weekly/{id}/` - Update snapshot
- `DELETE /api/reports/weekly/{id}/` - Delete snapshot

#### Custom Actions
- `GET /api/reports/weekly/current_week/` - Get current week snapshot
- `GET /api/reports/weekly/weekly_trends/` - Get last 12 weeks trends

### 3. Report Schedules (`/api/reports/schedules/`)

#### Standard CRUD Operations
- `GET /api/reports/schedules/` - List all schedules
- `POST /api/reports/schedules/` - Create new schedule
- `GET /api/reports/schedules/{id}/` - Get specific schedule
- `PUT /api/reports/schedules/{id}/` - Update schedule
- `DELETE /api/reports/schedules/{id}/` - Delete schedule

#### Custom Actions
- `POST /api/reports/schedules/{id}/toggle_active/` - Toggle schedule active status

### 4. Report Templates (`/api/reports/templates/`)

#### Standard CRUD Operations
- `GET /api/reports/templates/` - List all templates
- `POST /api/reports/templates/` - Create new template
- `GET /api/reports/templates/{id}/` - Get specific template
- `PUT /api/reports/templates/{id}/` - Update template
- `DELETE /api/reports/templates/{id}/` - Delete template

#### Custom Actions
- `POST /api/reports/templates/{id}/duplicate/` - Duplicate template

### 5. Dashboard Metrics (`/api/reports/metrics/`)

#### Standard CRUD Operations
- `GET /api/reports/metrics/` - List all metrics
- `POST /api/reports/metrics/` - Create new metric
- `GET /api/reports/metrics/{id}/` - Get specific metric
- `PUT /api/reports/metrics/{id}/` - Update metric
- `DELETE /api/reports/metrics/{id}/` - Delete metric

#### Custom Actions
- `POST /api/reports/metrics/bulk_update/` - Bulk update multiple metrics
- `GET /api/reports/metrics/by_category/` - Get metrics grouped by category

## Data Models

### Report Model
```json
{
  "id": 1,
  "title": "Monthly Sales Report",
  "metric_name": "conversion_rate",
  "value": "75%",
  "target": "80%",
  "trend": "up",
  "category": "conversion",
  "chart_data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [{
      "label": "Conversion Rate",
      "data": [70, 72, 75]
    }]
  },
  "description": "Monthly conversion rate analysis",
  "created_by": 1,
  "created_by_name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### WeeklySnapshot Model
```json
{
  "id": 1,
  "week_number": 3,
  "year": 2024,
  "total_leads": 150,
  "applications": 45,
  "disbursed_amount": "2500000.00",
  "created_at": "2024-01-21T00:00:00Z"
}
```

### DashboardMetric Model
```json
{
  "id": 1,
  "name": "Total Leads",
  "value": "1250.00",
  "previous_value": "1100.00",
  "change_percentage": "13.64",
  "unit": "count",
  "category": "overview",
  "last_updated": "2024-01-15T15:30:00Z",
  "is_active": true
}
```

### ReportTemplate Model
```json
{
  "id": 1,
  "name": "Weekly Performance Template",
  "description": "Template for weekly performance reports",
  "template_config": {
    "metric_name": "weekly_performance",
    "value": "auto_calculate",
    "category": "team",
    "chart_data": {
      "type": "line",
      "data_source": "weekly_snapshots"
    }
  },
  "is_default": false,
  "created_by": 1,
  "created_by_name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### ReportSchedule Model
```json
{
  "id": 1,
  "name": "Weekly Sales Report",
  "report_type": "weekly",
  "recipients": [1, 2, 3],
  "is_active": true,
  "next_run": "2024-01-22T09:00:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Example API Calls

### Get Report Analytics
```bash
GET /api/reports/analytics/
Authorization: Bearer <token>
```

Response:
```json
{
  "total_reports": 25,
  "reports_by_category": [
    {"category": "overview", "count": 8},
    {"category": "team", "count": 6},
    {"category": "conversion", "count": 5},
    {"category": "financial", "count": 4},
    {"category": "pipeline", "count": 2}
  ],
  "recent_reports": [...],
  "top_metrics": [...],
  "weekly_trends": [...]
}
```

### Generate Report from Template
```bash
POST /api/reports/generate_report/
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_id": 1
}
```

### Bulk Update Metrics
```bash
POST /api/reports/metrics/bulk_update/
Authorization: Bearer <token>
Content-Type: application/json

{
  "metrics": [
    {
      "id": 1,
      "value": "1300.00",
      "change_percentage": "15.50"
    },
    {
      "id": 2,
      "value": "85.00",
      "change_percentage": "5.20"
    }
  ]
}
```

## Integration Notes

### Frontend Integration
The frontend can consume these endpoints through the existing API service pattern:

```javascript
// Example service calls
export const reportsService = {
  getReports: (params) => apiClient.get('/reports/', { params }),
  getAnalytics: () => apiClient.get('/reports/analytics/'),
  getDashboardMetrics: () => apiClient.get('/reports/dashboard_metrics/'),
  getWeeklyTrends: () => apiClient.get('/reports/weekly/weekly_trends/'),
  generateReport: (templateId) => apiClient.post('/reports/generate_report/', { template_id: templateId }),
  bulkUpdateMetrics: (metrics) => apiClient.post('/reports/metrics/bulk_update/', { metrics }),
}
```

### Database Tables
- `reports_report` - Main reports table
- `reports_weeklysnapshot` - Weekly performance snapshots
- `reports_reportschedule` - Automated report schedules
- `reports_reporttemplate` - Report templates
- `reports_dashboardmetric` - Real-time dashboard metrics

### Features Implemented
- ✅ Full CRUD operations for all models
- ✅ Advanced filtering and querying
- ✅ Analytics and reporting endpoints
- ✅ Bulk operations for metrics
- ✅ Template-based report generation
- ✅ Automated scheduling capabilities
- ✅ Real-time dashboard metrics
- ✅ Weekly trend analysis
- ✅ User authentication and authorization
- ✅ Comprehensive error handling

### Security Considerations
- All endpoints require JWT authentication
- User-based permissions for create/update operations
- Input validation through serializers
- SQL injection protection through Django ORM

This backend provides a solid foundation for comprehensive reporting functionality without requiring any frontend changes.
