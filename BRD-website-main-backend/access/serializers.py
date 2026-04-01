from rest_framework import serializers
from signup.models import User
from .models import Role


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = User
        fields = ('email', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id', 'email', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class TokenPayloadSerializer(serializers.Serializer):
    valid   = serializers.BooleanField()
    sub     = serializers.CharField()
    email   = serializers.EmailField()
    role    = serializers.CharField(required=False, allow_null=True)
    role_id = serializers.CharField(required=False, allow_null=True)