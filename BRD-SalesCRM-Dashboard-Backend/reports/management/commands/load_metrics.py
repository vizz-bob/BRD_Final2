from django.core.management.base import BaseCommand
from reports.models import DashboardMetric

class Command(BaseCommand):
    help = 'Load sample dashboard metrics'

    def handle(self, *args, **options):
        # Clear existing metrics
        DashboardMetric.objects.all().delete()
        
        # Sample metrics data
        metrics = [
            {
                'name': 'Total Leads',
                'value': 1250.00,
                'previous_value': 1100.00,
                'change_percentage': 13.64,
                'unit': 'count',
                'category': 'overview'
            },
            {
                'name': 'Conversion Rate',
                'value': 75.50,
                'previous_value': 72.00,
                'change_percentage': 4.86,
                'unit': '%',
                'category': 'conversion'
            },
            {
                'name': 'Monthly Revenue',
                'value': 2500000.00,
                'previous_value': 2200000.00,
                'change_percentage': 13.64,
                'unit': '₹',
                'category': 'financial'
            },
            {
                'name': 'Active Team Members',
                'value': 15.00,
                'unit': 'count',
                'category': 'team'
            },
            {
                'name': 'Avg Response Time',
                'value': 2.50,
                'unit': 'hours',
                'category': 'productivity'
            },
            {
                'name': 'Applications Submitted',
                'value': 450.00,
                'previous_value': 410.00,
                'change_percentage': 9.76,
                'unit': 'count',
                'category': 'pipeline'
            },
            {
                'name': 'Disbursed Amount',
                'value': 1850000.00,
                'previous_value': 1650000.00,
                'change_percentage': 12.12,
                'unit': '₹',
                'category': 'financial'
            },
            {
                'name': 'Pipeline Value',
                'value': 8500000.00,
                'previous_value': 7800000.00,
                'change_percentage': 8.97,
                'unit': '₹',
                'category': 'pipeline'
            }
        ]
        
        # Create metrics
        created_metrics = []
        for metric_data in metrics:
            metric = DashboardMetric.objects.create(**metric_data)
            created_metrics.append(metric)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded {len(created_metrics)} metrics:')
        )
        
        for metric in created_metrics:
            self.stdout.write(
                f'  - {metric.name}: {metric.value} {metric.unit} ({metric.category})'
            )
