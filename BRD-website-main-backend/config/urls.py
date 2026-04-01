from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("signup.urls")),
    path("api/auth/", include("access.urls")),
    path('admin/', admin.site.urls),
]
