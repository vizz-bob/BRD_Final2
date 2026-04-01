from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, UploadDocumentsViewSet, search_documents, search_uploads

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'uploads', UploadDocumentsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search-documents/', search_documents, name='search-documents'),
    path('search-uploads/', search_uploads, name='search-uploads'),
]