import jwt
import datetime
from django.conf import settings
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import redirect
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from signup.models import User
from .serializers import (
    LoginSerializer, RegisterSerializer,
    UserSerializer, TokenPayloadSerializer
)

REDIRECT_MAP = {
    'master_admin':    'https://admin.brd.com',
    'tenant_admin':    'https://tenant.brd.com',
    'dashboard_admin': 'https://dash.brd.com',
    'borrower':        'https://app.brd.com',
}

DEV_REDIRECT_MAP = {
    'master_admin':    'http://localhost:3000',
    'tenant_admin':    'http://localhost:3000',
    'dashboard_admin': 'http://localhost:3000',
    'borrower':        'http://localhost:3000',
}


def sign_jwt(user: User) -> str:
    payload = {
        'sub':     str(user.id),
        'email':   user.email,
        'iat':     datetime.datetime.utcnow(),
        'exp':     datetime.datetime.utcnow() + datetime.timedelta(hours=8),
    }
    # Add role fields if they exist (for access.models.User)
    if hasattr(user, 'role'):
        payload['role'] = user.role
        payload['role_id'] = getattr(user, 'role_id', None)
    
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])


def _get_token(request):
    return (
        request.COOKIES.get('brd_token') or
        request.headers.get('Authorization', '').replace('Bearer ', '') or
        None
    )


def _set_token_cookie(response, token: str):
    response.set_cookie(
        key      = 'brd_token',
        value    = token,
        max_age  = 8 * 60 * 60,
        httponly = True,
        secure   = not settings.DEBUG,
        samesite = 'Lax',
        domain   = None if settings.DEBUG else '.brd.com',
    )


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email    = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        token = sign_jwt(user)
        
        # 🔥 IMPORTANT: Redirect to tenant backend with SSO token
        # Generate SSO payload for tenant backend
        sso_payload = {
            "user_id": str(user.id),
            "email": user.email,
            "username": user.email.split('@')[0],  # Use email prefix as username
            "first_name": user.contact_person.split()[0] if user.contact_person else '',
            "last_name": ' '.join(user.contact_person.split()[1:]) if len(user.contact_person.split()) > 1 else '',
            "mobile_no": user.mobile_no,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        }
        
        # Generate SSO token for tenant backend
        sso_token = jwt.encode(sso_payload, settings.SSO_SECRET_KEY, algorithm='HS256')
        
        # Redirect to tenant backend SSO endpoint
        destination = f'http://localhost:8000/api/v1/auth/sso-login/?token={sso_token}'

        accept     = request.headers.get('Accept', '')
        is_browser = 'text/html' in accept

        if is_browser:
            response = HttpResponseRedirect(destination)
            _set_token_cookie(response, token)
            return response
        else:
            response = Response({
                'token':        token,
                'sso_token':    sso_token,
                'redirect_url': destination,
                'user':         UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
            _set_token_cookie(response, token)
            return response


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user  = serializer.save()
        token = sign_jwt(user)

        response = Response({
            'token': token,
            'user':  UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
        _set_token_cookie(response, token)
        return response


class VerifyTokenView(APIView):
    def get(self, request):
        token = _get_token(request)

        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = decode_jwt(token)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        # Build response data with optional role fields
        response_data = {
            'valid':   True,
            'sub':     payload['sub'],
            'email':   payload['email'],
        }
        
        # Add role fields if they exist in payload
        if 'role' in payload:
            response_data['role'] = payload['role']
        if 'role_id' in payload:
            response_data['role_id'] = payload['role_id']

        serializer = TokenPayloadSerializer(data=response_data)
        serializer.is_valid()
        return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    def post(self, request):
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie(
            'brd_token',
            domain=None if settings.DEBUG else '.brd.com'
        )
        return response


class SSOLoginView(APIView):
    def get(self, request):
        token = request.GET.get('token')
        
        if not token:
            return HttpResponse("No token provided", status=400)
        
        try:
            payload = jwt.decode(token, settings.SSO_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return HttpResponse("Token expired", status=401)
        except jwt.InvalidTokenError:
            return HttpResponse("Invalid token", status=401)
        
        user_id = payload.get('user_id')
        email = payload.get('email')
        
        if not user_id or not email:
            return HttpResponse("Invalid token payload", status=400)
        
        try:
            user = User.objects.get(id=user_id, email=email)
        except User.DoesNotExist:
            return HttpResponse("User not found", status=404)
        
        # Create complete SSO payload for Project B
        sso_payload = {
            "user_id": str(user.id),
            "email": user.email,
            "username": user.email.split('@')[0],  # Use email prefix as username
            "first_name": user.contact_person.split()[0] if user.contact_person else '',
            "last_name": ' '.join(user.contact_person.split()[1:]) if len(user.contact_person.split()) > 1 else '',
            "mobile_no": user.mobile_no,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        }
        
        # Generate SSO token for Project B
        sso_token = jwt.encode(sso_payload, settings.SSO_SECRET_KEY, algorithm='HS256')
        
        # For now, redirect all users to tenant portal with SSO token
        destination = f'http://localhost:8000/api/v1/auth/sso-login/?token={sso_token}'
        
        response = HttpResponseRedirect(destination)
        _set_token_cookie(response, sso_token)
        return response


class SignupView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Import Business model
            from signup.models import Business
            
            # Create user first with correct manager method signature
            user = User.objects.create_user(
                email=data.get('email'),
                mobile_no=data.get('mobile_no'),
                password=data.get('password'),
                contact_person=data.get('contact_person'),
            )
            
            # Create business record
            business = Business.objects.create(
                user=user,
                business_name=data.get('business_name'),
                business_type=data.get('business_type'),
                business_pan=data.get('business_pan'),
                owner_pan=data.get('owner_pan'),
                gst_number=data.get('gst_number'),
                address_line1=data.get('address_line1'),
                address_line2=data.get('address_line2'),
                city=data.get('city'),
                state=data.get('state'),
                pincode=data.get('pincode'),
                country=data.get('country'),
                loan_product=data.get('loan_product', []),
                status=data.get('status', 'Active'),
                business_description=f"Business created for {data.get('business_name')}",
                subscription_type='Trial',
            )
            
            # Sync user to tenant backend for admin access
            try:
                # Direct database sync approach
                import sqlite3
                import hashlib
                from django.contrib.auth.hashers import make_password
                
                tenant_db_path = r"c:\Users\Alekhya Buthukuri\OneDrive\Desktop\Tenant_master_merge\BRD-MergedTenantMaster-Backend\db.sqlite3"
                
                if not os.path.exists(tenant_db_path):
                    print(f"⚠️ Tenant database not found: {tenant_db_path}")
                else:
                    conn = sqlite3.connect(tenant_db_path)
                    cursor = conn.cursor()
                    
                    # Check if user already exists
                    cursor.execute("SELECT id FROM master_users WHERE email = ?", (data.get('email'),))
                    existing_user = cursor.fetchone()
                    
                    if existing_user:
                        print(f"ℹ️ User already exists in tenant backend: {data.get('email')}")
                    else:
                        # Get tenant ID
                        cursor.execute("SELECT id FROM tenants WHERE name = 'Default Tenant'")
                        tenant_result = cursor.fetchone()
                        
                        if tenant_result:
                            tenant_id = tenant_result[0]
                            
                            # Hash password
                            hashed_password = make_password(data.get('password'))
                            
                            # Insert user
                            cursor.execute("""
                                INSERT INTO master_users (
                                    email, password, phone, first_name, last_name, 
                                    role, is_active, is_staff, is_superuser, is_2fa_enabled, two_fa_secret,
                                    employee_id, created_at, updated_at, tenant_id
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
                            """, (
                                data.get('email'),
                                hashed_password,
                                data.get('mobile_no'),
                                data.get('contact_person', '').split()[0] if data.get('contact_person') else '',
                                ' '.join(data.get('contact_person', '').split()[1:]) if len(data.get('contact_person', '').split()) > 1 else '',
                                'BORROWER',
                                1,  # is_active
                                0,  # is_staff
                                0,  # is_superuser
                                0,  # is_2fa_enabled
                                '',  # two_fa_secret
                                'EMP' + str(hash(data.get('email')) % 10000),  # employee_id
                                tenant_id
                            ))
                            
                            conn.commit()
                            print(f"✅ User synced to tenant backend: {data.get('email')}")
                        else:
                            print("❌ Default Tenant not found in tenant backend")
                    
                    conn.close()
                
            except Exception as sync_error:
                print(f"⚠️ Warning: Failed to sync user to tenant backend: {sync_error}")
                # Continue even if sync fails
            
            return Response({
                'message': 'User and business created successfully',
                'user_id': user.id,
                'business_id': business.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)