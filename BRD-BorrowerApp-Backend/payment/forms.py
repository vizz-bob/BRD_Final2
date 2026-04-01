from django import forms
from .models import SetupAutoPay


class SetupAutoPayForm(forms.ModelForm):
    class Meta:
        model = SetupAutoPay
        fields = "__all__"
