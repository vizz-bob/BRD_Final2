# from django.contrib.auth import authenticate
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework_simplejwt.tokens import RefreshToken
# from .serializers import LoginSerializer


# class LoginView(APIView):
#     authentication_classes = []
#     permission_classes = []

#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         email = serializer.validated_data["email"]
#         password = serializer.validated_data["password"]

#         user = authenticate(
#             request=request,      # 🔴 REQUIRED BY AXES
#             username=email,       # 🔴 MUST BE username
#             password=password
#         )

#         if not user or not user.is_master_admin:
#             return Response(
#                 {"error": "Invalid master admin credentials"},
#                 status=401
#             )

#         refresh = RefreshToken.for_user(user)

#         return Response({
#             "access": str(refresh.access_token),
#             "refresh": str(refresh),
#             "role": "MASTER_ADMIN"
#         })
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer


from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from brd_platform.permissions import IsAdminOrMaster


from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import LoginSerializer
from adminpanel.access_control.models import UserRole


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # IMPORTANT: Use standard Django authentication for tenant master users
        user = authenticate(
            request=request,   # required for django-axes
            username=email,
            password=password
        )

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # RBAC AUTHORIZATION (replace is_staff)
        has_active_role = UserRole.objects.filter(
            user=user,
            role__is_active=True
        ).exists()

        if not has_active_role:
            return Response(
                {"error": "Unauthorized. No active role assigned."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        # Get user role from the user model
        roles = [user.role] if user.role else []
        permissions = []  # Can be implemented later if needed

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "roles": roles,
            "permissions": permissions
        }, status=status.HTTP_200_OK)


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import MeSerializer
import jwt
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.http import HttpResponse

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)


import jwt
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.http import HttpResponse

User = get_user_model()

def sso_login(request):
    """
    🔥 CRITICAL: SSO Login endpoint that receives user data from Project A
    Creates user if not exists, logs them in, and creates session
    """
    token = request.GET.get("token")

    if not token:
        return HttpResponse("Token missing", status=400)

    try:
        # Decode SSO token from Project A
        payload = jwt.decode(token, settings.SSO_SECRET_KEY, algorithms=["HS256"])

        user_id = payload.get("user_id")
        email = payload.get("email")
        first_name = payload.get("first_name")
        last_name = payload.get("last_name", "")
        mobile_no = payload.get("mobile_no", "")

        if not email:
            return HttpResponse("Invalid token payload: missing email", status=400)

        # 🔥 IMPORTANT: Create or get user in tenant backend
        from users.models import User
        from tenants.models import Tenant
        
        # Get or create default tenant
        tenant, created = Tenant.objects.get_or_create(
            name="Default Tenant",
            defaults={
                'tenant_type': 'BANK',
                'email': 'admin@brd.com',
                'phone': '+919876543210',
                'is_active': True
            }
        )
        
        # 🔥 IMPORTANT: Create or get user with correct fields (no username field)
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "phone": mobile_no,
                "role": "BORROWER",
                "tenant": tenant,
                "is_active": True,
                "is_staff": False,
                "is_superuser": False,
            }
        )

        # 🔥 OPTIONAL: Update user details every login
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.phone = mobile_no
            user.save()

        # 🔥 LOGIN USER (creates Django session)
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(request, user)

        # 🔥 Generate JWT tokens for API access
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Check if this is an API request or browser request
        accept = request.headers.get('Accept', '')
        is_browser = 'text/html' in accept

        if is_browser:
            # Browser request - redirect to frontend with token
            frontend_url = "http://localhost:3000"
            response = redirect(f"{frontend_url}/dashboard?token={access_token}")
            
            # Set JWT token in cookie
            response.set_cookie(
                'access_token',
                access_token,
                max_age=8 * 60 * 60,  # 8 hours
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
            )
            
            return response
        else:
            # API request - return JSON response
            import json
            from django.http import JsonResponse
            
            response_data = {
                "success": True,
                "message": "SSO login successful",
                "access_token": access_token,
                "refresh_token": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "tenant_id": user.tenant.id if user.tenant else None,
                }
            }
            
            return JsonResponse(response_data, status=200)

    except jwt.ExpiredSignatureError:
        return HttpResponse("Token expired", status=401)

    except jwt.InvalidTokenError:
        return HttpResponse("Invalid token", status=401)

    except Exception as e:
        return HttpResponse(f"SSO login error: {str(e)}", status=500)