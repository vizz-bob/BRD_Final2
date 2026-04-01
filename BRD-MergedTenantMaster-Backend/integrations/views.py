import json
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from tenants.permissions import IsApiActivated

from .models import APIIntegration, WebhookLog, GlobalApiCategory
from .serializers import APIIntegrationSerializer, WebhookLogSerializer, GlobalApiCategorySerializer

class GlobalApiCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GlobalApiCategory.objects.all().prefetch_related('providers')
    serializer_class = GlobalApiCategorySerializer
    permission_classes = [permissions.AllowAny]

# Service Imports
from integrations.services.whatsapp.twilio_whatsapp import TwilioWhatsAppService

from .services.sms.twilio_sms import send_sms as twilio_send_sms
from .services.payments.cashfree_payment import create_cashfree_order
from .services.whatsapp.exotel_whatsapp import send_whatsapp as exotel_send_whatsapp
from .services.whatsapp.slack_whatsapp import send_whatsapp as slack_send_whatsapp
from .services.database_storage_api.neon_db import run_sql
from .services.chatbot.openai_service import get_chat_response
from .services.voice_to_text.openai_voice_service import transcribe_audio
from .services.bulk_mailgun.mailgun_service import send_email
from .services.esign_estamp.leegality_service import create_document, get_document_status
from .services.esign_estamp.docusign_service import DocuSignService
from .services.virtual_meeting.zoho import get_auth_url, generate_tokens, get_leads
from integrations.services.account_aggregator.cams import CamsService
from integrations.services.payments.pine_payment import PinePaymentService
from integrations.services.social_platform.youtube_service import YouTubeService
from integrations.services.telephony.exotel_service import ExotelService
from integrations.services.telephony.myoperator_service import MyOperatorService
from integrations.services.block_chain.gochain_service import GoChainService
from integrations.services.bulk_mailgun.brevo_service import BrevoService
from integrations.services.message_notification.whatsapp_service import WhatsAppCloudService
from integrations.services.payments.paypal_service import PayPalService
from integrations.services.aggregator.setu_service import SetuService
from integrations.services.block_chain.polygon_service import PolygonService
from integrations.services.government_compliance.tds_service import TDSService
from integrations.services.whatsapp.vonage_whatsapp_service import VonageWhatsAppService
from integrations.services.google_maps.geocoding import GoogleGeocodingAPI
from integrations.services.meon.face_match import MeonFaceMatchAPI
from integrations.services.video_collaboration.google_calendar import GoogleCalendarAPI
from integrations.services.vehicle_valuation.cardekho import CarDekhoAPI
from integrations.services.psychometric.humantic import HumanticAPI

class APIIntegrationViewSet(viewsets.ModelViewSet):
    serializer_class = APIIntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = getattr(self.request, "tenant", None)
        if tenant:
            return APIIntegration.objects.filter(tenant=tenant)
        return APIIntegration.objects.none()

    def perform_create(self, serializer):
        serializer.save(tenant=getattr(self.request, "tenant", None))

class WebhookLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WebhookLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = getattr(self.request, "tenant", None)
        if tenant:
            return WebhookLog.objects.filter(tenant=tenant)
        return WebhookLog.objects.none()

class ActivateOrganizationView(APIView):
    """
    Activate organization and provider configurations in backend integrations app
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            provider_id = request.data.get('provider_id') or request.data.get('providerId')
            config_data = request.data.get('activation_form', {})
            is_global = request.data.get('is_global', False)
            
            # For now, store in session since we don't have tenant context
            request.session['provider_activations'] = request.session.get('provider_activations', {})
            request.session['provider_activations'][str(provider_id)] = {
                'is_logged_in': True,
                'is_activated': True,
                'api_status': 'active',
                'config_data': config_data,
                'is_global': is_global
            }
            request.session.save()

            return Response({
                "status": "success",
                "message": "Activation stored successfully",
                "is_activated": True,
                "is_logged_in": True,
                "api_status": "active",
                "organization_id": "ORG-DEMO123",
                "api_key": "********************",
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView

class DeactivateProviderView(APIView):
    """
    Deactivate a specific provider
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            provider_id = request.data.get('provider_id')
            tenant = getattr(request.user, 'tenant', None)
            
            if tenant and provider_id:
                # Find the APIIntegration for this global_provider_id
                from integrations.models import APIIntegration, GlobalApiProvider
                try:
                    global_provider = GlobalApiProvider.objects.get(id=provider_id)
                    integration = APIIntegration.objects.get(tenant=tenant, global_provider=global_provider)
                    integration.is_active = False
                    integration.save()
                except (GlobalApiProvider.DoesNotExist, APIIntegration.DoesNotExist):
                    pass
            
            return Response({
                "status": "success",
                "message": f"Provider {provider_id} deactivated successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class GetSandboxLoginUrlView(APIView):
    """
    Get sandbox login URL
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            return Response({
                "status": "success",
                "login_url": "https://sandbox.example.com/login"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ProviderConfigurationsView(APIView):
    """
    Get or save provider configurations securely in database
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            tenant = getattr(request.user, 'tenant', None)
            
            configurations = {}
            if tenant:
                from integrations.models import APIIntegration
                integrations = APIIntegration.objects.filter(tenant=tenant).exclude(global_provider__isnull=True)
                for integration in integrations:
                    configurations[str(integration.global_provider.id)] = {
                        "is_logged_in": True,
                        "is_activated": integration.is_active,
                        "api_status": "Active" if integration.is_active else "Inactive"
                    }
                    
            return Response(configurations, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        try:
            configurations = request.data
            tenant = getattr(request.user, 'tenant', None)
            
            if tenant:
                from integrations.models import APIIntegration, GlobalApiProvider
                for provider_id_str, config in configurations.items():
                    if provider_id_str.isdigit():
                        try:
                            global_provider = GlobalApiProvider.objects.get(id=provider_id_str)
                            is_activated = config.get("is_activated", True)
                            # Create or update APIIntegration
                            APIIntegration.objects.update_or_create(
                                tenant=tenant,
                                global_provider=global_provider,
                                defaults={
                                    "name": global_provider.name,
                                    "is_active": is_activated,
                                    "config": config
                                }
                            )
                        except GlobalApiProvider.DoesNotExist:
                            continue
            
            return Response({
                "status": "success",
                "message": "Provider configurations saved successfully database",
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_twilio_whatsapp(request):
    to_number = "+917009963071"
    message = "Hello from Django via Twilio WhatsApp!"
    result = TwilioWhatsAppService.send_message(to_number, message)
    return Response(result)



@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_twilio_sms(request):
    phone = request.data.get("phone")
    message = request.data.get("message")
    result = twilio_send_sms(phone, message)
    return Response(result)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def create_payment_order(request):
    amount = request.data.get("amount")
    phone = request.data.get("phone")
    email = request.data.get("email")
    result = create_cashfree_order(amount, phone, email)
    return Response(result)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_exotel_whatsapp(request):
    try:
        data = request.data
        to = data.get("to")
        message = data.get("message")
        
        if not to or not message:
            return Response({"error": "Both 'to' and 'message' are required"}, status=400)
            
        response = exotel_send_whatsapp(to, message)
        return Response(response)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def slack_to_whatsapp(request):
    try:
        data = request.data
        slack_message = data.get("text", "No message found")
        to_number = data.get("to")
        if not to_number:
            return Response({"error": "Phone number ('to') is required"}, status=400)
        response = slack_send_whatsapp(to_number, slack_message)
        return Response({"success": True, "whatsapp_response": response})
    except Exception as e:
        import traceback
        print(f"Error in slack_to_whatsapp: {str(e)}")
        return Response({
            "error": str(e),
            "traceback": traceback.format_exc()
        }, status=500)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def neon_query(request):
    try:
        data = request.data
        sql_query = data.get("query")
        if not sql_query:
            return Response({"error": "query field is required"}, status=400)
        result = run_sql(sql_query)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def chat_with_openai(request):
    try:
        data = request.data
        prompt = data.get("prompt", "")
        if not prompt:
            return Response({"status": "error", "error": "prompt field required"}, status=400)
        result = get_chat_response(prompt)
        return Response(result)
    except Exception as e:
        return Response({"status": "error", "error": str(e)}, status=500)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def voice_to_text(request):
    if "file" not in request.FILES:
        return Response({"status": "error", "error": "Audio file missing"}, status=400)
    audio_file = request.FILES["file"]
    with tempfile.NamedTemporaryFile(delete=True) as tmp_file:
        for chunk in audio_file.chunks():
            tmp_file.write(chunk)
        tmp_file.flush()
        result = transcribe_audio(tmp_file.name)
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def send_test_email(request):
    result = send_email("mayank@webarclight.com", "Test Email", "Hello from Django!")
    return Response(result)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def create_leegality_doc(request):
    try:
        data = request.data
        template_id = data.get("template_id")
        signers = data.get("signers")
        fields = data.get("fields")
        result = create_document(template_id, signers, fields)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def document_status(request, document_id):
    result = get_document_status(document_id)
    return Response(result)

def zoho_login(request):
    return redirect(get_auth_url())

def zoho_callback(request):
    code = request.GET.get("code")
    token_data = generate_tokens(code)
    return JsonResponse(token_data)

def zoho_leads(request):
    access_token = request.GET.get("token")
    leads = get_leads(access_token)
    return JsonResponse(leads)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def cams_statement(request):
    result = CamsService.get_account_statement(
        pan="AAAAA1234A",
        from_date="01-01-2023",
        to_date="31-12-2023",
        email="test@example.com",
        mobile="9999999999"
    )
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def test_payment(request):
    order_id = request.query_params.get("order_id")
    if not order_id:
        return Response({"error": "order_id is required"}, status=400)
    result = PinePaymentService.make_card_payment(order_id)
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def youtube_channel(request):
    channel_id = request.query_params.get("channel_id")
    if not channel_id:
        return Response({"error": "channel_id required"}, status=400)
    result = YouTubeService.get_channel_details(channel_id)
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def test_exotel_call(request):
    from_number = request.query_params.get("from")
    to_number = request.query_params.get("to")
    if not from_number or not to_number:
        return Response({"error": "from and to required"}, status=400)
    result = ExotelService.make_call(from_number, to_number)
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def test_myoperator_call(request):
    customer = request.query_params.get("customer")
    agent = request.query_params.get("agent")
    if not customer or not agent:
        return Response({"error": "customer and agent required"}, status=400)
    result = MyOperatorService.click_to_call(customer, agent)
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def get_block(request):
    result = GoChainService.get_block_number()
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def get_wallet_balance(request):
    wallet = request.query_params.get("wallet")
    if not wallet:
        return Response({"error": "wallet parameter required"}, status=400)
    result = GoChainService.get_balance(wallet)
    return Response(result)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_test_campaign(request):
    campaign_name = "Test Campaign"
    subject = "Hello from Brevo"
    sender = {"name": "Test Sender", "email": "sender@example.com"}
    recipients = [{"email": "recipient@example.com"}]
    html_content = "<h1>This is a test email</h1><p>Sent via Brevo API</p>"
    result = BrevoService.send_campaign(campaign_name, subject, sender, recipients, html_content)
    return Response(result)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_whatsapp_test(request):
    to_number = "917009963071"
    result = WhatsAppCloudService.send_template_message(to_number)
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def docusign_callback(request):
    code = request.query_params.get("code")
    if not code:
        return Response({"error": "No code provided"}, status=400)
    result = DocuSignService.exchange_code_for_token(code)
    return Response(result)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def paypal_create_payment(request):
    amount = request.query_params.get("amount", "10.00")  # Default $10
    currency = request.query_params.get("currency", "USD")
    description = request.query_params.get("description", "Test Payment")

    result = PayPalService.create_payment(amount, currency, description)
    return Response(result)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def get_setu_merchants(request):
    """
    Endpoint to fetch merchants from Setu Aggregator
    """
    result = SetuService.get_merchants()
    return Response(result)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def get_latest_polygon_block(request):
    """
    Endpoint to fetch latest block number from Polygon
    """
    result = PolygonService.get_block_number()
    return Response(result)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def test_tds_connection(request):
    """
    Endpoint to test TDS API connectivity
    """
    result = TDSService.check_status()
    return Response(result)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_whatsapp_sandbox(request):
    """
    Send WhatsApp message via Vonage Sandbox
    """
    data = request.data
    to_number = data.get("to")
    message_text = data.get("message")

    if not to_number or not message_text:
        return Response({"error": "Missing 'to' or 'message'"}, status=400)

    result = VonageWhatsAppService.send_message(to_number, message_text)
    return Response(result)


from integrations.services.gst_verification.gst_return import GSTReturnService

gst_service = GSTReturnService()


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def gst_return_status_view(request):
    """
    POST /api/v1/integrations/gst-return-status/
    """
    gstin = request.data.get("gstin")
    financial_year = request.data.get("financial_year")

    if not gstin:
        return Response({"error": "gstin is required"}, status=status.HTTP_400_BAD_REQUEST)

    result = gst_service.get_gst_return_status(gstin, financial_year)

    if result["success"]:
        return Response(result, status=status.HTTP_200_OK)

    return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def gst_status_view(request, gstin):
    """
    GET /api/gst/<gstin>/
    """
    result = gst_service.get_gst_return_status(gstin)

    if result["success"]:
        return Response(result, status=status.HTTP_200_OK)

    return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def gst_filing_status_view(request, gstin):
    """
    GET /api/gst/<gstin>/filing/?financial_year=2023-24
    """
    financial_year = request.GET.get("financial_year")

    result = gst_service.get_gst_return_status(gstin, financial_year)

    if result["success"]:
        return Response(result, status=status.HTTP_200_OK)

    return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def geocode_address(request):
    address = request.GET.get("address")

    if not address:
        return Response({"error": "Address is required"}, status=400)

    api = GoogleGeocodingAPI()
    result = api.get_coordinates(address)

    return Response(result)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def meon_generate_token(request):
    api = MeonFaceMatchAPI()
    result = api.generate_token()
    return Response(result)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def meon_initiate(request):
    token = request.data.get("token")

    if not token:
        return Response({"error": "Token required"}, status=400)

    api = MeonFaceMatchAPI()
    result = api.initiate_request(token)

    return Response(result)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def meon_export(request):
    token = request.data.get("token")
    transaction_id = request.data.get("transaction_id")

    if not token or not transaction_id:
        return Response({"error": "Token & transaction_id required"}, status=400)

    api = MeonFaceMatchAPI()
    result = api.export_data(token, transaction_id)

    return Response(result)

    return Response(result)

# 🔹 Step 1: Redirect to Google Login
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def google_login(request):
    api = GoogleCalendarAPI()
    auth_url = api.get_auth_url()
    return redirect(auth_url)


# 🔹 Step 2: Callback (Google redirects here)
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def google_callback(request):
    code = request.GET.get("code")

    if not code:
        return Response({"error": "Authorization code not found"}, status=400)

    api = GoogleCalendarAPI()
    token_data = api.exchange_code_for_token(code)

    return Response({
        "message": "Google login successful",
        "data": token_data
    })


# 🔹 Step 3: Get Calendar List
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def google_calendar_list(request):
    access_token = request.GET.get("access_token")

    if not access_token:
        return Response({"error": "access_token required"}, status=400)

    api = GoogleCalendarAPI()
    result = api.get_calendar_list(access_token)

    return Response(result)


# 🔹 Step 4: Create Event (Google Meet Link)
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def google_create_event(request):
    access_token = request.data.get("access_token")

    if not access_token:
        return Response({"error": "access_token required"}, status=400)

    summary = request.data.get("summary", "Test Meeting")

    api = GoogleCalendarAPI()
    result = api.create_event(access_token, summary)

    return Response(result)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def vehicle_valuation_view(request):
    """
    Fetch vehicle valuation data from CarDekho
    """
    url = request.data.get("url")

    if not url:
        return Response({"error": "URL is required"}, status=400)

    api = CarDekhoAPI()
    result = api.fetch_vehicle_data(url)

    return Response(result)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def create_psychometric_profile(request):
    email = request.data.get("email")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    api = HumanticAPI()
    result = api.create_profile(email, first_name, last_name)

    return Response(result)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def get_psychometric_profile(request):
    email = request.GET.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    api = HumanticAPI()
    result = api.get_profile(email)

    return Response(result)

from rest_framework.decorators import api_view
from rest_framework.response import Response

# Import your service function
from integrations.services.gold_value.gold_price import get_gold_price


@api_view(['GET'])
def gold_price_view(request):
    """
    API to get gold price
    """
    try:
        data = get_gold_price()

        if "error" in data:
            return Response({
                "status": "error",
                "message": data["error"]
            }, status=400)

        return Response({
            "status": "success",
            "data": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.property.magicbricks_api import fetch_magicbricks_properties


@api_view(['GET'])
def magicbricks_properties_view(request):
    """
    API to trigger MagicBricks scraping
    """
    try:
        data = fetch_magicbricks_properties()

        if "error" in data:
            return Response({
                "status": "error",
                "message": data["error"]
            }, status=400)

        return Response({
            "status": "success",
            "apify_response": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.alternatedates.sociavault_api import get_instagram_profile


@api_view(['GET'])
def instagram_profile_view(request):
    """
    API: /api/instagram-profile/?username=virat.kohli
    """
    try:
        username = request.GET.get("username")

        if not username:
            return Response({
                "status": "error",
                "message": "username is required"
            }, status=400)

        data = get_instagram_profile(username)

        if "error" in data:
            return Response({
                "status": "error",
                "message": data["error"]
            }, status=400)

        return Response({
            "status": "success",
            "data": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.mca_filing.mca_api import (
    search_company,
    search_director
)


@api_view(['GET'])
def company_search_view(request):
    name = request.GET.get("name")

    if not name:
        return Response({
            "status": "error",
            "message": "company name is required"
        }, status=400)

    data = search_company(name)

    return Response({
        "status": "success",
        "data": data
    })


@api_view(['GET'])
def director_search_view(request):
    name = request.GET.get("name")

    if not name:
        return Response({
            "status": "error",
            "message": "director name is required"
        }, status=400)

    data = search_director(name)

    return Response({
        "status": "success",
        "data": data
    })

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.payout.paypal_payout import create_payout


@api_view(['POST'])
def payout_view(request):
    """
    API: /api/payout/
    Body:
    {
        "email": "test@example.com",
        "amount": 10
    }
    """
    try:
        email = request.data.get("email")
        amount = request.data.get("amount")

        if not email or not amount:
            return Response({
                "status": "error",
                "message": "email and amount are required"
            }, status=400)

        data = create_payout(email, amount)

        return Response({
            "status": "success",
            "data": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.cloud_structure.gcp_compute import create_instance


@api_view(['POST'])
def create_gcp_instance_view(request):
    """
    API to create GCP VM instance
    """
    try:
        project_id = request.data.get("project_id")
        zone = request.data.get("zone")
        instance_name = request.data.get("instance_name")
        machine_type = request.data.get("machine_type")
        source_image = request.data.get("source_image")
        refresh_token = request.data.get("refresh_token")

        if not all([project_id, zone, instance_name, machine_type, source_image, refresh_token]):
            return Response({
                "status": "error",
                "message": "All fields are required"
            }, status=400)

        data = create_instance(
            project_id,
            zone,
            instance_name,
            machine_type,
            source_image,
            refresh_token
        )

        return Response({
            "status": "success",
            "data": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.kyc_verification.perfios_api import (
    verify_gst,
    aadhaar_consent,
    verify_aadhaar
)


@api_view(['POST'])
def gst_verification_view(request):
    gstin = request.data.get("gstin")

    if not gstin:
        return Response({
            "status": "error",
            "message": "GSTIN is required"
        }, status=400)

    data = verify_gst(gstin)

    return Response({
        "status": "success",
        "data": data
    })


@api_view(['POST'])
def aadhaar_consent_view(request):
    aadhaar = request.data.get("aadhaar")

    if not aadhaar:
        return Response({
            "status": "error",
            "message": "Aadhaar number is required"
        }, status=400)

    data = aadhaar_consent(aadhaar)

    return Response({
        "status": "success",
        "data": data
    })


@api_view(['POST'])
def aadhaar_verification_view(request):
    aadhaar = request.data.get("aadhaar")
    otp = request.data.get("otp")

    if not aadhaar or not otp:
        return Response({
            "status": "error",
            "message": "Aadhaar and OTP are required"
        }, status=400)

    data = verify_aadhaar(aadhaar, otp)

    return Response({
        "status": "success",
        "data": data
    })

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.Passport_and_Utility_Bills.mindee_api import (
    parse_passport,
    parse_utility_bill
)


@api_view(['POST'])
def passport_kyc_view(request):
    file = request.FILES.get("file")

    if not file:
        return Response({
            "status": "error",
            "message": "file is required"
        }, status=400)

    file_path = f"/tmp/{file.name}"
    with open(file_path, "wb+") as f:
        for chunk in file.chunks():
            f.write(chunk)

    data = parse_passport(file_path)

    return Response({
        "status": "success",
        "data": data
    })


@api_view(['POST'])
def utility_bill_kyc_view(request):
    file = request.FILES.get("file")

    if not file:
        return Response({
            "status": "error",
            "message": "file is required"
        }, status=400)

    file_path = f"/tmp/{file.name}"
    with open(file_path, "wb+") as f:
        for chunk in file.chunks():
            f.write(chunk)

    data = parse_utility_bill(file_path)

    return Response({
        "status": "success",
        "data": data
    })

    from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.cibil.surepass_cibil import fetch_cibil_report


@api_view(['POST'])
def cibil_report_view(request):
    """
    API: /api/cibil-report/
    """
    try:
        payload = request.data

        required_fields = ["name", "mobile", "pan", "dob"]

        for field in required_fields:
            if field not in payload:
                return Response({
                    "status": "error",
                    "message": f"{field} is required"
                }, status=400)

        data = fetch_cibil_report(payload)

        if "error" in data:
            return Response({
                "status": "error",
                "message": data["error"]
            }, status=400)

        return Response({
            "status": "success",
            "data": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from integrations.services.zoom_meeting.zoom_api import create_meeting


@api_view(['POST'])
@permission_classes([AllowAny])
def create_zoom_meeting_view(request):
    """
    API: /api/create-meeting/
    """
    try:
        topic = request.data.get("topic")
        start_time = request.data.get("start_time")  # ISO format
        duration = request.data.get("duration", 30)

        if not topic or not start_time:
            return Response({
                "status": "error",
                "message": "topic and start_time are required"
            }, status=400)

        data = create_meeting(topic, start_time, duration)

        if "error" in data:
            return Response({
                "status": "error",
                "message": data["error"]
            }, status=400)

        return Response({
            "status": "success",
            "data": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.services.zoho_meeting.zoho_api import create_meeting


@api_view(['POST'])
def zoho_meeting_view(request):
    """
    Common API for:
    - Video & Collaboration
    - Virtual Meeting
    """

    try:
        topic = request.data.get("topic")
        start_time = request.data.get("start_time")
        duration = request.data.get("duration", 30)
        refresh_token = request.data.get("refresh_token")
        module = request.data.get("module")  # optional

        if not topic or not start_time or not refresh_token:
            return Response({
                "status": "error",
                "message": "topic, start_time, refresh_token required"
            }, status=400)

        data = create_meeting(topic, start_time, duration, refresh_token)

        return Response({
            "module": module if module else "common",
            "status": "success",
            "data": data
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)