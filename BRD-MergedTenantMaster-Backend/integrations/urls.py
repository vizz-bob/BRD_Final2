from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    APIIntegrationViewSet, 
    WebhookLogViewSet,
    GlobalApiCategoryViewSet,
    send_twilio_whatsapp,

    send_twilio_sms,
    create_payment_order,
    send_exotel_whatsapp,
    slack_to_whatsapp,
    neon_query,
    chat_with_openai,
    voice_to_text,
    send_test_email,
    create_leegality_doc,
    document_status,
    zoho_login,
    zoho_callback,
    zoho_leads,
    cams_statement,
    test_payment,
    youtube_channel,
    test_exotel_call,
    test_myoperator_call,
    get_block,
    get_wallet_balance,
    send_test_campaign,
    send_whatsapp_test,
    docusign_callback,
    paypal_create_payment,
    get_setu_merchants,
    get_latest_polygon_block,
    test_tds_connection,
    send_whatsapp_sandbox,
    gst_return_status_view,
    gst_status_view,
    gst_filing_status_view,
    geocode_address,
    meon_generate_token,
    meon_initiate,
    meon_export,
    google_login,
    google_callback,
    google_calendar_list,
    google_create_event,
    vehicle_valuation_view,
    create_psychometric_profile,
    get_psychometric_profile,
    ActivateOrganizationView,
    DeactivateProviderView,
    GetSandboxLoginUrlView,
    ProviderConfigurationsView,
    gold_price_view,
    magicbricks_properties_view,
    instagram_profile_view,
    company_search_view, 
    director_search_view,
    payout_view,
    create_gcp_instance_view,
    gst_verification_view,
    aadhaar_consent_view,
    aadhaar_verification_view,
    passport_kyc_view, 
    utility_bill_kyc_view,
    cibil_report_view,
    create_zoom_meeting_view,
    zoho_meeting_view,
)

router = DefaultRouter()
router.register(r'global-api-categories', GlobalApiCategoryViewSet, basename='global-api-categories')
router.register(r'webhook-logs', WebhookLogViewSet, basename='webhooklogs')
router.register(r'', APIIntegrationViewSet, basename='integrations')

urlpatterns = [
    # Organization Provider endpoints
    path("activate-organization/", ActivateOrganizationView.as_view(), name="activate-organization"),
    path("deactivate-provider/", DeactivateProviderView.as_view(), name="deactivate-provider"),
    path("sandbox-login-url/", GetSandboxLoginUrlView.as_view(), name="sandbox-login-url"),
    path("provider-configurations/", ProviderConfigurationsView.as_view(), name="provider-configurations"),
    
    # WhatsApp Integrations
    path("whatsapp/send-twilio/", send_twilio_whatsapp, name="send_twilio_whatsapp"),
    path("whatsapp/exotel/", send_exotel_whatsapp, name="send_exotel_whatsapp"),
    path("whatsapp/send-test/", send_whatsapp_test, name="send_whatsapp_test"),
    path("whatsapp/send-sandbox/", send_whatsapp_sandbox, name="send_whatsapp_sandbox"),
    
    # SMS Integrations

    path("sms/twilio/", send_twilio_sms, name="send_twilio_sms"),
    
    # Payment Integrations
    path("payments/create-order/", create_payment_order, name="create_payment_order"),
    path("pine/test-payment/", test_payment, name="pine_test_payment"),
    path("paypal/create-payment/", paypal_create_payment, name="paypal_create_payment"),
    
    # OpenAI Integrations
    path("openai/chat/", chat_with_openai, name="openai-chat"),
    path("openai/voice-to-text/", voice_to_text, name="voice-to-text"),
    
    # Email & Communications
    path("mail/send-test/", send_test_email, name="send_test_email"),
    path("brevo/send-campaign/", send_test_campaign, name="send_test_campaign"),
    path("slack-to-whatsapp/", slack_to_whatsapp, name="slack-to-whatsapp"),
    
    # Legal & Documents
    path("leegality/create/", create_leegality_doc, name="create_leegality_doc"),
    path("leegality/status/<str:document_id>/", document_status, name="leegality_document_status"),
    path("docusign/callback/", docusign_callback, name="docusign_callback"),
    
    # Zoho CRM
    path("zoho/login/", zoho_login, name="zoho_login"),
    path("zoho/callback/", zoho_callback, name="zoho_callback"),
    path("zoho/leads/", zoho_leads, name="zoho_leads"),
    
    # Other External Services
    path("neon/query/", neon_query, name="neon-query"),
    path("cams/statement/", cams_statement, name="cams_statement"),
    path("youtube-channel/", youtube_channel, name="youtube_channel"),
    path("exotel-call/", test_exotel_call, name="exotel_call"),
    path("myoperator-call/", test_myoperator_call, name="myoperator_call"),
    
    # Blockchain
    path("gochain/block/", get_block, name="gochain_block"),
    path("gochain/balance/", get_wallet_balance, name="gochain_balance"),

    # Router URLs (keep at the bottom)
    path("", include(router.urls)),

    # Setu Aggregator
    path("setu/merchants/", get_setu_merchants, name="setu_merchants"),
    path("polygon/block/", get_latest_polygon_block, name="get_latest_polygon_block"),
    path("tds/status/", test_tds_connection, name="test_tds_connection"),

    # GST Verification
    path("gst-return-status/", gst_return_status_view, name="gst-return-status"),
    path('gst/<str:gstin>/', gst_status_view, name='gst-status'),
    path('gst/<str:gstin>/filing/', gst_filing_status_view, name='gst-filing-status'),

    path("google/geocode/", geocode_address, name="google-geocode"),

    path("meon/token/", meon_generate_token, name="meon_generate_token"),
    path("meon/initiate/", meon_initiate, name="meon_initiate"),
    path("meon/export/", meon_export, name="meon_export"),

    # 🔥 Google Calendar / Meet
    path("google/login/", google_login, name="google_login"),
    path("google/callback/", google_callback, name="google_callback"),
    path("google/calendar/", google_calendar_list, name="google_calendar_list"),
    path("google/create-event/", google_create_event, name="google_create_event"),

    # 🚗 Vehicle Valuation
    path("vehicle-valuation/", vehicle_valuation_view, name="vehicle_valuation"),

    # 🧠 Psychometric (Humantic AI)
    path("psychometric/create/", create_psychometric_profile, name="psychometric_create"),
    path("psychometric/profile/", get_psychometric_profile, name="psychometric_profile"),

    path('gold-price/', gold_price_view, name='gold-price'),

    path('magicbricks-properties/', magicbricks_properties_view, name='magicbricks-properties'),

    path('instagram-profile/', instagram_profile_view, name='instagram-profile'),

    path('company-search/', company_search_view),
    path('director-search/', director_search_view),

    path('payout/', payout_view, name='paypal-payout'),

    path('create-instance/', create_gcp_instance_view, name='create-gcp-instance'),

    path('gst-verify/', gst_verification_view),
    path('aadhaar-consent/', aadhaar_consent_view),
    path('aadhaar-verify/', aadhaar_verification_view),

    path('passport-kyc/', passport_kyc_view),
    path('utility-bill-kyc/', utility_bill_kyc_view),

    path('cibil-report/', cibil_report_view, name='cibil-report'),

    path('create-meeting/', create_zoom_meeting_view, name='create-zoom-meeting'),

    path('zoho-meeting/', zoho_meeting_view),

]
