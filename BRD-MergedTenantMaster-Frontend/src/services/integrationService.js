import axiosInstance from "../utils/axiosInstance";

const integrationService = {
    // Master Data
    getApiCategories: () => axiosInstance.get("integrations/global-api-categories/"),

    // WhatsApp
    sendTwilioWhatsApp: () => axiosInstance.post("integrations/whatsapp/send-twilio/"),
    sendExotelWhatsApp: (data) => axiosInstance.post("integrations/whatsapp/exotel/", data),
    sendWhatsAppTest: () => axiosInstance.post("integrations/whatsapp/send-test/"),
    sendWhatsAppSandbox: (data) => axiosInstance.post("integrations/whatsapp/send-sandbox/", data),
    slackToWhatsApp: (data) => axiosInstance.post("integrations/slack-to-whatsapp/", data),

    // SMS
    sendMsg91Otp: (phone) => axiosInstance.post("integrations/sms/send-otp/", { phone }),
    verifyMsg91Otp: (phone, otp) => axiosInstance.post("integrations/sms/verify-otp/", { phone, otp }),
    sendTwilioSms: (phone, message) => axiosInstance.post("integrations/sms/twilio/", { phone, message }),

    // Payments
    createCashfreeOrder: (data) => axiosInstance.post("integrations/payments/create-order/", data),
    testPinePayment: (orderId) => axiosInstance.get(`integrations/pine/test-payment/?order_id=${orderId}`),
    createPayPalPayment: (params) => axiosInstance.get("integrations/paypal/create-payment/", { params }),

    // AI & Chatbot
    chatWithOpenAI: (prompt) => axiosInstance.post("integrations/openai/chat/", { prompt }),
    voiceToText: (formData) => axiosInstance.post("integrations/openai/voice-to-text/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),

    // Email
    sendTestEmail: () => axiosInstance.get("integrations/mail/send-test/"),
    sendBrevoCampaign: () => axiosInstance.post("integrations/brevo/send-campaign/"),

    // Legal & Documents
    createLeegalityDoc: (data) => axiosInstance.post("integrations/leegality/create/", data),
    getLeegalityStatus: (documentId) => axiosInstance.get(`integrations/leegality/status/${documentId}/`),

    // Zoho
    zohoLogin: () => window.open(`${import.meta.env.VITE_API_BASE_URL}/api/v1/integrations/zoho/login/`, '_blank'),
    getZohoLeads: (token) => axiosInstance.get(`integrations/zoho/leads/?token=${token}`),

    // Others
    neonQuery: (query) => axiosInstance.post("integrations/neon/query/", { query }),
    camsStatement: () => axiosInstance.post("integrations/cams/statement/"),
    getYoutubeChannel: (channelId) => axiosInstance.get(`integrations/youtube-channel/?channel_id=${channelId}`),
    testExotelCall: (from, to) => axiosInstance.get(`integrations/exotel-call/?from=${from}&to=${to}`),
    testMyOperatorCall: (customer, agent) => axiosInstance.get(`integrations/myoperator-call/?customer=${customer}&agent=${agent}`),
    getGochainBlock: () => axiosInstance.get("integrations/gochain/block/"),
    getGochainBalance: (wallet) => axiosInstance.get(`integrations/gochain/balance/?wallet=${wallet}`),

    // New ones from last additions
    getSetuMerchants: () => axiosInstance.get("integrations/setu/merchants/"),
    getPolygonBlock: () => axiosInstance.get("integrations/polygon/block/"),
    testTdsStatus: () => axiosInstance.get("integrations/tds/status/"),
    
    // GST Verification - working like MSG91
    getGstReturnStatus: (gstin, financialYear) => axiosInstance.post("integrations/gst-return-status/", { gstin, financial_year: financialYear }),

    // Google Maps
    getGeocode: (address) =>axiosInstance.get("integrations/google/geocode/", {params: { address }}),
    
    // Meon Face Match
    meonGenerateToken: () => axiosInstance.get("integrations/meon/token/"),
    meonInitiate: (token) => axiosInstance.post("integrations/meon/initiate/", { token }),
    meonExport: (token, transactionId) => axiosInstance.post("integrations/meon/export/", { token, transaction_id: transactionId }),

    // Google Calendar
    googleCalendarLogin: () => window.open(`${import.meta.env.VITE_API_BASE_URL}/api/v1/integrations/google/login/`, '_blank'),
    getGoogleCalendarList: (accessToken) => axiosInstance.get(`integrations/google/calendar/?access_token=${accessToken}`),
    createGoogleCalendarEvent: (accessToken, summary) => axiosInstance.post("integrations/google/create-event/", { access_token: accessToken, summary }),
    
    // Vehicle Valuation
    getVehicleValuation: (url) => axiosInstance.post("integrations/vehicle-valuation/", { url }),

    // Psychometric (Humantic AI)
    createPsychometricProfile: (data) => axiosInstance.post("integrations/psychometric/create/", data),
    getPsychometricProfile: (email) => axiosInstance.get(`integrations/psychometric/profile/?email=${email}`),

    // Commodities/Gold Price
    getGoldPrice: () => axiosInstance.get("integrations/gold-price/"),

    // Property Title Check
    getMagicbricksProperties: () => axiosInstance.get("integrations/magicbricks-properties/"),

    // Alternate Data (Instagram via SociaVault)
    getInstagramProfile: () => axiosInstance.get("integrations/instagram-profile/"),

    testPerfios: () => axiosInstance.post("integrations/gst-verify/", { gstin: "27AAPFU0939F1ZV" }),

    // Cloud Structure API
    createGcpInstance: (data) => axiosInstance.post("integrations/create-instance/", data),

    // Payout
    createPayout: (data) => axiosInstance.post("integrations/payout/", data),

    // Passport and Utility Bills
    passportUtilityTest: () => {
        const formData = new FormData();
        const dummyFile = new Blob(["dummy content"], { type: "text/plain" });
        formData.append("file", dummyFile, "test.txt");
        return axiosInstance.post("integrations/passport-kyc/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // CIBIL Report
    fetchCibilReport: (data) => axiosInstance.post("integrations/cibil-report/", data),

    // Zoom Meeting
    createZoomMeeting: (data) => axiosInstance.post("integrations/create-meeting/", data),

    // Zoho Meeting
    createZohoMeeting: (data) => axiosInstance.post("integrations/zoho-meeting/", data),

    // MCA Filing
    searchCompany: (name = "Reliance") => axiosInstance.get(`integrations/company-search/?name=${encodeURIComponent(name)}`),

    // Organization
    getTenantStatus: () => axiosInstance.get("tenant/tenant/").then(res => ({
        data: Array.isArray(res.data) ? res.data[0] : res.data
    })),
    activateOrganization: (data) => axiosInstance.post("integrations/activate-organization/", data),
    deactivateProvider: (data) => axiosInstance.post("integrations/deactivate-provider/", data),
    getSandboxLoginUrl: (params) => axiosInstance.get("integrations/sandbox-login-url/", { params }),
    
    // Provider Configurations
    getProviderConfigurations: () => axiosInstance.get("integrations/provider-configurations/"),
    saveProviderConfigurations: (data) => axiosInstance.post("integrations/provider-configurations/", data),
    
    // Check if API is implemented in backend
    isApiImplemented: (testKey) => {
        // Map of test keys to their corresponding service functions
        const implementedApis = {
            'msg91_otp': 'sendMsg91Otp',
            'twilio_sms': 'sendTwilioSms',
            'cashfree_payment': 'createCashfreeOrder',
            'pine_payment': 'testPinePayment',
            'openai_chat': 'chatWithOpenAI',
            'voice_to_text': 'voiceToText',
            'mailgun_test': 'sendTestEmail',
            'brevo_campaign': 'sendBrevoCampaign',
            'leegality_doc': 'createLeegalityDoc',
            'zoho_leads': 'getZohoLeads',
            'neon_query': 'neonQuery',
            'cams_statement': 'camsStatement',
            'youtube_channel': 'getYoutubeChannel',
            'youtube_details': 'getYoutubeChannel',
            'exotel_call': 'testExotelCall',
            'myoperator_call': 'testMyOperatorCall',
            'gochain_block': 'getGochainBlock',
            'gochain_balance': 'getGochainBalance',
            'setu_merchants': 'getSetuMerchants',
            'polygon_block': 'getPolygonBlock',
            'tds_status': 'testTdsStatus',
            'gst_return_status': 'getGstReturnStatus',
            'gst_returns': 'getGstReturnStatus',
            'gst_return': 'getGstReturnStatus',
            'whatsapp_twilio': 'sendTwilioWhatsApp',
            'twilio_whatsapp': 'sendTwilioWhatsApp',
            'whatsapp_exotel': 'sendExotelWhatsApp',
            'exotel_whatsapp': 'sendExotelWhatsApp',
            'whatsapp_test': 'sendWhatsAppTest',
            'whatsapp_sandbox': 'sendWhatsAppSandbox',
            'slack_to_whatsapp': 'slackToWhatsApp',
            'slack_whatsapp': 'slackToWhatsApp',
            'vonage_whatsapp': 'whatsapp_sandbox', // Map to sandbox as fallback
            'cloud_whatsapp': 'whatsapp_sandbox',
            'paypal_payment': 'createPayPalPayment',
            // Add missing APIs that are referenced in API_CATEGORIES
            'perfios_test': 'testPerfios', // Now implemented
            'karza_test': null, // Not implemented
            'signzy_test': null, // Not implemented
            'transunion_test': null, // Not implemented
            'crif_test': null, // Not implemented
            'equifax_test': null, // Not implemented
            'experian_test': null, // Not implemented
            'billdesk_test': null, // Not implemented
            'razorpay_test': null, // Not implemented
            'cashfree_test': null, // Not implemented
            'zoho_meeting_test': 'createZohoMeeting',
            'zoho_test': 'createZohoMeeting',
            'google_meet_test': 'googleCalendarLogin',
            'zoom_test': 'createZoomMeeting',
            'microsoft_teams_test': 'chatWithOpenAI',

            'google_calendar_test': 'googleCalendarLogin',
            'google_drive_test': 'chatWithOpenAI',
            'openai_voice': 'voiceToText',
            'openai_tts': 'voiceToText',
            'openai_chat': 'chatWithOpenAI',
            'google_geocode': 'getGeocode',
            'meon_face_match': 'meonInitiate',
            'vehicle_valuation': 'getVehicleValuation',
            'humantic_psychometric': 'createPsychometricProfile',
            'gold_price': 'getGoldPrice',
            'magicbricks_properties': 'getMagicbricksProperties',
            'instagram_profile': 'getInstagramProfile',
            'mca_company_search': 'searchCompany',
            'vendor_payout': 'createPayout',
            'cloud_structure': 'createGcpInstance',
            'passport_and_utility': 'passportUtilityTest',
            'cibil_report': 'fetchCibilReport',
        };
        
        return implementedApis.hasOwnProperty(testKey) && implementedApis[testKey] !== null;
    },
};

export default integrationService;
