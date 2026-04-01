from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
import random
from .serializers import UserProfileSerializer


@api_view(["POST"])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    user = authenticate(request, username=user_obj.username, password=password)

    if not user:
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
    )


@api_view(["POST"])
def signup_view(request):
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not all([first_name, last_name, email, password]):
        return Response(
            {"detail": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"detail": "User already exists"}, status=status.HTTP_400_BAD_REQUEST
        )

    username = first_name[:3] + last_name[:2] + str(random.randint(100, 999))

    user = User.objects.create_user(username=username, email=email, password=password)

    user.first_name = first_name
    user.last_name = last_name
    user.save()

    refresh = RefreshToken.for_user(user)

    return Response({"refresh": str(refresh), "access": str(refresh.access_token)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(
        {
            "is_authenticated": True,
            "id": request.user.id,
            "email": request.user.email,
            "username": request.user.username,
        }
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"message": "Logged out successfully"})

    except TokenError:
        return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    profile = request.user.profile

    if request.method == "GET":
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    partial = request.method == "PATCH"
    serializer = UserProfileSerializer(profile, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)