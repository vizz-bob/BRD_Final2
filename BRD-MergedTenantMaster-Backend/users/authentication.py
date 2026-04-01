from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _
from rest_framework import authentication
from django.contrib.auth import get_user_model
import jwt
from django.conf import settings
from rest_framework_simplejwt.settings import api_settings

User = get_user_model()

class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()
        token = None

        if not auth_header or auth_header[0].lower() != b'bearer':
            # Fallback: check for token in cookies (useful for SSO and HttpOnly cookies)
            token = request.COOKIES.get('access_token')
            if not token:
                return None
        else:
            if len(auth_header) == 1:
                msg = _('Invalid Authorization header. No credentials provided.')
                raise AuthenticationFailed(msg)
            elif len(auth_header) > 2:
                msg = _('Invalid Authorization header. Token string should not contain spaces.')
                raise AuthenticationFailed(msg)
                
            try:
                token = auth_header[1].decode('utf-8')
            except UnicodeError:
                msg = _('Invalid token header. Token string should not contain invalid characters.')
                raise AuthenticationFailed(msg)
        
        if not token:
            return None
            
        # Validate token
        try:
            # Try to decode with SimpleJWT settings first
            payload = api_settings.JWT_DECODE_HANDLER(token, api_settings.JWT_ALGORITHM)
        except:
            try:
                # Fallback to SSO secret key
                payload = jwt.decode(token, settings.SIMPLE_JWT['SIGNING_KEY'], algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                raise AuthenticationFailed(_("Token has expired"))
            except jwt.InvalidTokenError:
                raise AuthenticationFailed(_("Invalid token"))
        
        if payload:
            # Try to get user by ID (SSO format) or user_id (SimpleJWT format)
            user_id = payload.get('sub') or payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed(_("Token payload invalid"))
                
            try:
                user = User.objects.get(id=user_id)
                return (user, token)  # Return (user, token) tuple as required by DRF
            except User.DoesNotExist:
                raise AuthenticationFailed(_("User not found"))
        
        return None

    def get_user(self, validated_token):
        try:
            user_id = validated_token.get('sub') or validated_token.get('user_id')
            if user_id:
                return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed(_("User not found or invalid token format"), code="user_not_found")
