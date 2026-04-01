from rest_framework import serializers
from .models import Document, UploadDocuments


class DocumentSerializer(serializers.ModelSerializer):
    document_id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'document_id', 'name', 'document_type', 'client_name', 'upload_date', 'status', 'issues']


class UploadDocumentsSerializer(serializers.ModelSerializer):
    document_id = serializers.IntegerField(source='document.id', read_only=True)
    document_name = serializers.CharField(source='document.name', read_only=True)

    class Meta:
        model = UploadDocuments
        fields = ['id', 'document_id', 'document_name', 'document_type', 'client_name', 'document_file', 'uploaded_at', 'document']