from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import sys
import os

@csrf_exempt
@require_http_methods(["POST"])
def sync_user_to_tenant(request):
    """Sync a user from main website to tenant backend"""
    try:
        email = request.POST.get('email')
        password = request.POST.get('password')
        mobile_no = request.POST.get('mobile_no')
        contact_person = request.POST.get('contact_person', '')
        
        if not email or not password:
            return JsonResponse({'error': 'Email and password required'}, status=400)
        
        # Import tenant backend models
        tenant_backend_path = r"c:\Users\Alekhya Buthukuri\OneDrive\Desktop\Tenant_master_merge\BRD-MergedTenantMaster-Backend"
        if tenant_backend_path not in sys.path:
            sys.path.append(tenant_backend_path)
        
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        import django
        django.setup()
        
        from users.models import User as TenantUser
        from tenants.models import Tenant
        
        # Get or create default tenant
        tenant, created = Tenant.objects.get_or_create(
            name="Default Tenant",
            defaults={
                'tenant_id': 'default-tenant',
                'domain': 'localhost',
                'is_active': True
            }
        )
        
        # Check if user already exists
        if TenantUser.objects.filter(email=email).exists():
            return JsonResponse({'message': 'User already exists in tenant backend'}, status=200)
        
        # Create user in tenant backend
        tenant_user = TenantUser.objects.create_user(
            email=email,
            password=password,
            phone=mobile_no,
            first_name=contact_person.split()[0] if contact_person else '',
            last_name=' '.join(contact_person.split()[1:]) if len(contact_person.split()) > 1 else '',
            role="BORROWER",
            tenant=tenant
        )
        
        return JsonResponse({
            'message': 'User synced to tenant backend successfully',
            'user_id': tenant_user.id,
            'tenant': tenant.name
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
