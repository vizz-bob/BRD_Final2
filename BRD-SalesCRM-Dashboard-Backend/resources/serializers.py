from rest_framework import serializers
from .models import Resource, ResourceCategory


class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = "__all__"


class ResourceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    file_url = serializers.SerializerMethodField()
    has_file = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = "__all__"

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_has_file(self, obj):
        return bool(obj.file)