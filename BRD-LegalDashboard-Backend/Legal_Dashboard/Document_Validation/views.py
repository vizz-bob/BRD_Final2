from rest_framework import viewsets, filters
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Document, UploadDocuments
from .Serializers import DocumentSerializer, UploadDocumentsSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['id', 'client_name', 'status', 'document_type']
    search_fields = ['id', 'name', 'client_name', 'document_type', 'status']

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if query:
            # Try to convert to integer for ID search
            try:
                doc_id = int(query)
                documents = Document.objects.filter(id=doc_id)
            except ValueError:
                # Search by text fields
                documents = Document.objects.filter(
                    name__icontains=query
                ) | Document.objects.filter(
                    client_name__icontains=query
                ) | Document.objects.filter(
                    document_type__icontains=query
                )
        else:
            documents = Document.objects.all()
        
        serializer = self.get_serializer(documents, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        })

class UploadDocumentsViewSet(viewsets.ModelViewSet):
    queryset = UploadDocuments.objects.all()
    serializer_class = UploadDocumentsSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['id', 'document', 'client_name', 'document_type']
    search_fields = ['id', 'document_type', 'client_name', 'document__name', 'document__client_name']

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if query:
            try:
                upload_id = int(query)
                uploads = UploadDocuments.objects.filter(id=upload_id)
            except ValueError:
                uploads = UploadDocuments.objects.filter(
                    document_type__icontains=query
                ) | UploadDocuments.objects.filter(
                    client_name__icontains=query
                ) | UploadDocuments.objects.filter(
                    document__name__icontains=query
                ) | UploadDocuments.objects.filter(
                    document__client_name__icontains=query
                )
        else:
            uploads = UploadDocuments.objects.all()
        
        serializer = self.get_serializer(uploads, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        })

@api_view(['GET'])
def search_documents(request):
    """Simple search endpoint for documents"""
    query = request.GET.get('q', '')
    if not query:
        return Response({'error': 'Search query parameter "q" is required'}, status=400)
    
    try:
        doc_id = int(query)
        documents = Document.objects.filter(id=doc_id)
    except ValueError:
        documents = Document.objects.filter(
            name__icontains=query
        ) | Document.objects.filter(
            client_name__icontains=query
        ) | Document.objects.filter(
            document_type__icontains=query
        )
    
    serializer = DocumentSerializer(documents, many=True)
    return Response({
        'count': len(serializer.data),
        'results': serializer.data
    })

@api_view(['GET'])
def search_uploads(request):
    """Simple search endpoint for uploads"""
    query = request.GET.get('q', '')
    if not query:
        return Response({'error': 'Search query parameter "q" is required'}, status=400)
    
    try:
        upload_id = int(query)
        uploads = UploadDocuments.objects.filter(id=upload_id)
    except ValueError:
        uploads = UploadDocuments.objects.filter(
            document_type__icontains=query
        ) | UploadDocuments.objects.filter(
            client_name__icontains=query
        ) | UploadDocuments.objects.filter(
            document__name__icontains=query
        )
    
    serializer = UploadDocumentsSerializer(uploads, many=True)
    return Response({
        'count': len(serializer.data),
        'results': serializer.data
    })