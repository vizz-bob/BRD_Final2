from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Business
from .serializers import BusinessSerializer


class BusinessCreateView(generics.CreateAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing


class BusinessListView(generics.ListAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
