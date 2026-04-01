from django.contrib import admin
from .models import LoanApplication,Loan,EMI,LoanAgreement,SanctionLetter,KeyFactStatement

admin.site.register(Loan)
admin.site.register(LoanApplication)
admin.site.register(EMI)
admin.site.register(LoanAgreement)
admin.site.register(SanctionLetter)
admin.site.register(KeyFactStatement)