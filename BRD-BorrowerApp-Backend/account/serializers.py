from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    kyc_status = serializers.SerializerMethodField()
    credit_score = serializers.IntegerField(source='user.kyc.credit_score', read_only=True)
    class Meta:
        model = UserProfile
        fields = "__all__"
        read_only_fields = ['account_number']  
    def get_kyc_status(self, obj):
        kyc = getattr(obj.user, 'kyc', None)
        if not kyc:
            return 'Not Submitted'
        if kyc.kyc_completed():
            return 'Verified'
        return 'Pending'