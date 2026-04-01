from django.shortcuts import redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import AnonymousUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings

class SSOLoginView(APIView):
    """
    🔥 CRITICAL: SSO Login endpoint that receives user data from Project A
    Creates user if not exists, logs them in, and creates session
    """
    def get(self, request):
        token = request.GET.get("token")

        if not token:
            return HttpResponse("Token missing", status=400)

        try:
            # Decode SSO token from Project A
            payload = jwt.decode(token, settings.SSO_SECRET_KEY, algorithms=["HS256"])

            user_id = payload.get("user_id")
            email = payload.get("email")
            username = payload.get("username")
            first_name = payload.get("first_name")
            last_name = payload.get("last_name", "")
            mobile_no = payload.get("mobile_no", "")

            if not email or not username:
                return HttpResponse("Invalid token payload: missing email or username", status=400)

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
            
            # 🔥 IMPORTANT: Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
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
            login(request, user)

            # 🔥 Generate JWT tokens for API access
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
                return Response({
                    "success": True,
                    "message": "SSO login successful",
                    "access_token": access_token,
                    "refresh_token": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "role": user.role,
                        "tenant_id": user.tenant.id if user.tenant else None,
                    }
                }, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return HttpResponse("Token expired", status=401)

        except jwt.InvalidTokenError:
            return HttpResponse("Invalid token", status=401)

        except Exception as e:
            return HttpResponse(f"SSO login error: {str(e)}", status=500)
