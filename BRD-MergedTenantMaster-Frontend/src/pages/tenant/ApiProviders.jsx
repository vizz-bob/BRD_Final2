import { useEffect, useState, useMemo } from "react";
import integrationService from "../../services/integrationService";
import { flushSync } from "react-dom";

// =============================================================================
// SECTION 1: ICONS
// =============================================================================

const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Cloud: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  XMark: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  Cog: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Lightning: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
};

// =============================================================================
// SECTION 2: API DATA FROM EXCEL SHEET
// =============================================================================

const API_CATEGORIES = [
  {
    id: 1,
    name: "SMS",
    description: "SMS messaging and notification services",
    providers: [
      { id: 103, name: "MSG91", status: "inactive", baseUrl: "https://api.msg91.com", authType: "API Key", testKey: "msg91_otp", disabled: false },
      { id: 104, name: "twilio", status: "inactive", baseUrl: "https://www.twilio.com/en-us", authType: "API Key", testKey: "twilio_sms", disabled: false },
    ]
  },
  {
    id: 2,
    name: "Payment",
    description: "Online payment processing and gateways",
    providers: [
      { id: 201, name: "Cashfree", status: "inactive", baseUrl: "https://www.cashfree.com/", authType: "Client Secret", testKey: "cashfree_payment", disabled: false },
      { id: 203, name: "Razorpay", status: "inactive", baseUrl: "https://api.razorpay.com/v1", authType: "Basic Auth", disabled: true },
      { id: 204, name: "Pinelabs", status: "inactive", baseUrl: "https://www.pinelabs.com/", authType: "API Key", testKey: "pine_payment", disabled: false },
      { id: 207, name: "PayPal", status: "inactive", baseUrl: "https://api-m.sandbox.paypal.com", authType: "Client Secret", testKey: "paypal_payment" },
    ]
  },
  {
    id: 3,
    name: "WhatsApp",
    description: "WhatsApp Business API integration",
    providers: [
      { id: 302, name: "Exotel", status: "inactive", baseUrl: "https://api.exotel.com/", authType: "API Key", testKey: "exotel_whatsapp", disabled: false },
      { id: 303, name: "Twilio", status: "inactive", baseUrl: "https://www.twilio.com/en-us/messaging/channels/whatsapp", authType: "API Key", testKey: "twilio_whatsapp", disabled: false },
      { id: 304, name: "Slack Integration", status: "inactive", baseUrl: "https://slack.dev/wp-login.php", authType: "OAuth 2.0", testKey: "slack_whatsapp", disabled: false },
      { id: 305, name: "Vonage", status: "inactive", baseUrl: "https://messages-sandbox.nexmo.com", authType: "API Key", testKey: "vonage_whatsapp", disabled: false },
    ]
  },
  {
    id: 4,
    name: "PAN Verification",
    description: "PAN card validation and verification",
    providers: [
      { id: 401, name: "Perfios", status: "inactive", baseUrl: "https://api.perfios.com", authType: "API Key", testKey: "perfios_test", disabled: false },
      { id: 402, name: "nsdl", status: "inactive", baseUrl: "https://api.nsdl.com", authType: "Certificate", disabled: true },
      { id: 403, name: "karza", status: "inactive", baseUrl: "https://api.karza.in/pan", authType: "API Key", disabled: true },
      { id: 404, name: "signzy", status: "inactive", baseUrl: "https://api.signzy.com/pan", authType: "Bearer Token", disabled: true },
      { id: 405, name: "UIDAI( Aadhar ekyc)", status: "inactive", baseUrl: "https://resident.uidai.gov.in/api", authType: "Certificate", disabled: true },
      { id: 406, name: "NSDL", status: "inactive", baseUrl: "https://api.nsdl.com", authType: "Certificate", disabled: true },
      { id: 407, name: "CKYC", status: "inactive", baseUrl: "https://api.ckyc.in", authType: "API Key", disabled: true },
      { id: 408, name: "signzy", status: "inactive", baseUrl: "https://api.signzy.com", authType: "Bearer Token", disabled: true },
    ]
  },
  {
    id: 5,
    name: "GST Verification",
    description: "GST validation and compliance",
    providers: [
      { id: 501, name: "cleartax", status: "inactive", baseUrl: "https://api.cleartax.in", authType: "API Key", disabled: true },
      { id: 502, name: "karza", status: "inactive", baseUrl: "https://api.karza.in/gst", authType: "API Key", disabled: true },
      { id: 503, name: "signzy", status: "inactive", baseUrl: "https://api.signzy.com/gst", authType: "Bearer Token", disabled: true },
      { id: 504, name: "GST returns", status: "inactive", baseUrl: "https://gst-return-status.p.rapidapi.com", authType: "API Key", testKey: "gst_return_status", disabled: false },
      { id: 505, name: "Perfios", status: "inactive", baseUrl: "https://api.perfios.com", authType: "API Key", testKey: "perfios_test", disabled: false },
    ]
  },
  {
    id: 6,
    name: "Aadhaar eKYC",
    description: "Aadhaar authentication and eKYC",
    providers: [
      { id: 601, name: "Perfios", status: "inactive", baseUrl: "https://api.perfios.com", authType: "API Key", testKey: "perfios_test", disabled: false },
      { id: 602, name: "nsdl", status: "inactive", baseUrl: "https://api.nsdl.com", authType: "Certificate", disabled: true },
      { id: 603, name: "karza", status: "inactive", baseUrl: "https://api.karza.in/aadhaar", authType: "API Key", disabled: true },
      { id: 604, name: "signzy", status: "inactive", baseUrl: "https://api.signzy.com/aadhaar", authType: "Bearer Token", disabled: true },
      { id: 605, name: "UIDAI", status: "inactive", baseUrl: "https://resident.uidai.gov.in/api", authType: "Certificate", disabled: true },
    ]
  },
  {
    id: 7,
    name: "Account Aggregator",
    description: "Financial data aggregation (RBI licensed)",
    providers: [
      { id: 701, name: "CAMS Finserv", status: "inactive", baseUrl: "https://www.camsfinserv.com/", authType: "Certificate", testKey: "cams_statement" },
    ]
  },
  {
    id: 8,
    name: "E-Sign/E-Stamp",
    description: "Digital signature and e-stamping services",
    providers: [
      { id: 801, name: "DocuSign", status: "inactive", baseUrl: "https://www.docusign.com/", authType: "OAuth 2.0" },
      { id: 802, name: "Leegality", status: "inactive", baseUrl: "https://dashboard.leegality.com/sign-in", authType: "Bearer Token", testKey: "leegality_doc" },
    ]
  },
  {
    id: 9,
    name: "Face Match",
    description: "Facial recognition and verification",
    providers: [
      { id: 901, name: "hyperverge", status: "inactive", baseUrl: "https://api.hyperverge.co", authType: "API Key" },
      { id: 902, name: "signzy", status: "inactive", baseUrl: "https://api.signzy.com/face", authType: "Bearer Token" },
      { id: 903, name: "karza", status: "inactive", baseUrl: "https://api.karza.in/face", authType: "API Key" },
      { id: 904, name: "Meon", status: "inactive", baseUrl: "https://api.meon.com", authType: "API Key", testKey: "meon_face_match", disabled: false },
    ]
  },
  {
    id: 10,
    name: "Address/Geo Location",
    description: "Location and mapping services",
    providers: [
      { id: 1001, name: "google maps", status: "inactive", baseUrl: "https://maps.googleapis.com/maps/api", authType: "API Key", testKey: "google_geocode", disabled: false },
    ]
  },
  {
    id: 11,
    name: "Telephony/Dialers",
    description: "Cloud telephony and dialer systems",
    providers: [
      { id: 1101, name: "Exotel Call", status: "inactive", baseUrl: "https://api.exotel.com/v1/Accounts/", authType: "API Key", testKey: "exotel_call" },
      { id: 1103, name: "MyOperator", status: "inactive", baseUrl: "https://api.myoperator.comhttps://in.app.myoperator.com/users/login", authType: "Basic Auth", testKey: "myoperator_call" },
    ]
  },

  {
    id: 12,
    name: "Messaging and Notification",
    description: "Multi-channel messaging and notifications",
    providers: [
      { id: 1201, name: "Whatsapp Business api", status: "inactive", baseUrl: "https://api.whatsapp.com", authType: "Bearer Token", testKey: "whatsapp_sandbox", disabled: false },
      { id: 306, name: "WhatsApp Cloud API", status: "inactive", baseUrl: "https://graph.facebook.com", authType: "Bearer Token", testKey: "cloud_whatsapp" },
      { id: 1203, name: "slack webhooks", status: "inactive", baseUrl: "https://hooks.slack.com", authType: "Webhook" },
    ]
  },
  {
    id: 13,
    name: "Video & Collaboration",
    description: "Video conferencing and collaboration tools",
    providers: [
      { id: 1301, name: "google meet", status: "inactive", baseUrl: "https://meet.googleapis.com", authType: "OAuth 2.0", testKey: "google_meet_test", disabled: false },
      { id: 1302, name: "zoom", status: "inactive", baseUrl: "https://api.zoom.us/v2", authType: "OAuth 2.0", testKey: "zoom_test", disabled: false },
      { id: 1303, name: "microsoft teams", status: "inactive", baseUrl: "https://graph.microsoft.com", authType: "OAuth 2.0", testKey: "microsoft_teams_test", disabled: false },
      { id: 1304, name: "google calendar", status: "inactive", baseUrl: "https://www.googleapis.com/calendar/v3", authType: "OAuth 2.0", testKey: "google_calendar_test", disabled: false },
      { id: 1305, name: "google drive", status: "inactive", baseUrl: "https://www.googleapis.com/drive/v3", authType: "OAuth 2.0", testKey: "google_drive_test", disabled: false },
      { id: 1306, name: "zoho meeting", status: "inactive", baseUrl: "https://meeting.zoho.com/api", authType: "OAuth 2.0", testKey: "zoho_meeting_test", disabled: false },
    ]
  },
  {
    id: 14,
    name: "Virtual Meeting",
    description: "Virtual meeting platforms and credit bureaus",
    providers: [
      { id: 1401, name: "google meet", status: "inactive", baseUrl: "https://meet.googleapis.com", authType: "OAuth 2.0", testKey: "google_meet_test", disabled: false },
      { id: 1402, name: "zoom", status: "inactive", baseUrl: "https://api.zoom.us/v2", authType: "OAuth 2.0", testKey: "zoom_test", disabled: false },
      { id: 1403, name: "microsoft", status: "inactive", baseUrl: "https://graph.microsoft.com", authType: "OAuth 2.0", testKey: "microsoft_teams_test", disabled: false },
      { id: 1404, name: "zoho meeting", status: "inactive", baseUrl: "https://meeting.zoho.com/api", authType: "OAuth 2.0", testKey: "zoho_meeting_test", disabled: false },
      { id: 1405, name: "experian", status: "inactive", baseUrl: "https://api.experian.in", authType: "OAuth 2.0" },
      { id: 1406, name: "equifax", status: "inactive", baseUrl: "https://api.equifax.co.in", authType: "Certificate" },
      { id: 1407, name: "CRIF High Mark", status: "inactive", baseUrl: "https://api.crifhighmark.com", authType: "API Key" },
      { id: 1408, name: "TransUnion", status: "inactive", baseUrl: "https://api.cibil.com", authType: "Certificate + API Key" },
      { id: 1409, name: "BillDesk", status: "inactive", baseUrl: "https://api.billdesk.com", authType: "HMAC" },
      { id: 1410, name: "Razorpay", status: "inactive", baseUrl: "https://api.razorpay.com/v1", authType: "Basic Auth" },
      { id: 1411, name: "Cashfree Payments", status: "inactive", baseUrl: "https://api.cashfree.com", authType: "Client Secret" },
      { id: 1412, name: "Razorpay", status: "inactive", baseUrl: "https://api.razorpay.com/v1", authType: "Basic Auth" },
      { id: 1413, name: "Cashfree Payments", status: "inactive", baseUrl: "https://api.cashfree.com", authType: "Client Secret" },
      { id: 1414, name: "Perfios.", status: "inactive", baseUrl: "https://api.perfios.com", authType: "API Key", testKey: "perfios_test", disabled: false },
      { id: 1415, name: "Karza Technologies", status: "inactive", baseUrl: "https://api.karza.in", authType: "API Key" },
      { id: 1416, name: "Signzy Technologies", status: "inactive", baseUrl: "https://api.signzy.com", authType: "Bearer Token" },
    ]
  },
  {
    id: 15,
    name: "Social Platforms",
    description: "Social media integration APIs",
    providers: [
      { id: 1505, name: "Youtube", status: "inactive", baseUrl: "https://www.googleapis.com/youtube/v3", authType: "OAuth 2.0", testKey: "youtube_details", disabled: false },
    ]
  },
  {
    id: 16,
    name: "Aggregator API",
    description: "Business and data aggregation services",
    providers: [
      { id: 1604, name: "Setu", status: "inactive", baseUrl: "https://setu.com", authType: "Bearer Token", testKey: "setu_merchants" },
    ]
  },
  {
    id: 17,
    name: "Cloud Structure API",
    description: "Cloud infrastructure and services",
    providers: [
      { id: 1701, name: "Aws", status: "inactive", baseUrl: "https://aws.amazon.com", authType: "AWS Signature" },
      { id: 1702, name: "Google cloud platform(GCP)", status: "inactive", baseUrl: "https://cloud.google.com", authType: "OAuth 2.0", testKey: "cloud_structure", disabled: false },
      { id: 1703, name: "microsoft azure", status: "inactive", baseUrl: "https://management.azure.com", authType: "OAuth 2.0" },
    ]
  },
  {
    id: 18,
    name: "Blockchain/DLT API",
    description: "Blockchain and distributed ledger technology",
    providers: [
      { id: 1802, name: "Polygon", status: "inactive", baseUrl: "https://api.polygon.io", authType: "API Key", testKey: "polygon_block" },
      { id: 1804, name: "GoChain", status: "inactive", baseUrl: "https://gochain.io/", authType: "API Key", testKey: "gochain_block" },
    ]
  },
  {
    id: 19,
    name: "Database & Storage API",
    description: "Database and storage solutions",
    providers: [
      { id: 1902, name: "Neon (PostgreSQL)", status: "inactive", baseUrl: "https://neon.tech", authType: "API Key", testKey: "neon_query" },
    ]
  },
  {
    id: 20,
    name: "Government Compliance API",
    description: "Government regulatory and compliance APIs",
    providers: [
      { id: 2002, name: "TDS Status", status: "inactive", baseUrl: "https://sandbox.tdsapi.com", authType: "Certificate", testKey: "tds_status" },
    ]
  },
  {
    id: 21,
    name: "Speech-to-Text",
    description: "Voice to text conversion services",
    providers: [
      { id: 2102, name: "OpenAI Whisper (Voice)", status: "inactive", baseUrl: "https://openai.com", authType: "API Key", testKey: "openai_voice", disabled: false },
    ]
  },
  {
    id: 22,
    name: "Text-to-Speech",
    description: "Text to speech conversion services",
    providers: [
      { id: 2201, name: "OpenAI TTS", status: "inactive", baseUrl: "https://openai.com", authType: "API Key", testKey: "openai_tts", disabled: false },
    ]
  },
  {
    id: 23,
    name: "AI & Chatbot",
    description: "AI-powered chatbot and voice services",
    providers: [
      { id: 2302, name: "OpenAI GPT (Chat)", status: "inactive", baseUrl: "https://openai.com", authType: "API Key", testKey: "openai_chat", disabled: false },

    ]
  },
  {
    id: 24,
    name: "Mandate",
    description: "eNACH and UPI mandate services",
    providers: [
      { id: 2401, name: "eNACH", status: "inactive", baseUrl: "https://api.npci.org.in/enach", authType: "Certificate" },
      { id: 2402, name: "UPI Mandate", status: "inactive", baseUrl: "https://api.npci.org.in/upi", authType: "Certificate" },
    ]
  },
  {
    id: 25,
    name: "Payout",
    description: "Vendor payment and payout services",
    providers: [
      { id: 2501, name: "Vendor Payment", status: "inactive", baseUrl: "https://api.payout.com", authType: "API Key", testKey: "vendor_payout", disabled: false },
    ]
  },
  {
    id: 26,
    name: "MCA Filing",
    description: "MCA and ROC compliance filing",
    providers: [
      { id: 2601, name: "ROC", status: "inactive", baseUrl: "https://www.mca.gov.in", authType: "Digital Signature", testKey: "mca_company_search", disabled: false },
      { id: 2602, name: "MCA Returns", status: "inactive", baseUrl: "https://www.mca.gov.in", authType: "Digital Signature" },
    ]
  },
  {
    id: 27,
    name: "Bulk Mailing",
    description: "Email marketing and transactional email services",
    providers: [
      { id: 2701, name: "Mailgun", status: "inactive", baseUrl: "https://www.mailgun.com/", authType: "API Key", testKey: "mailgun_test" },
      { id: 2702, name: "Brevo", status: "inactive", baseUrl: "https://www.brevo.com/", authType: "API Key", testKey: "brevo_campaign" },
    ]
  },
  {
    id: 28,
    name: "Alternate Date",
    description: "Alternative date and calendar services",
    providers: [
      { id: 2801, name: "evahan", status: "inactive", baseUrl: "https://api.evahan.com", authType: "API Key", testKey: "instagram_profile", disabled: false },
    ]
  },
  {
    id: 29,
    name: "Behaviour and Psychometric Test",
    description: "Psychological and behavioral assessment",
    providers: [
      { id: 79, name: "traitify", status: "inactive", baseUrl: "https://api.traitify.com", authType: "API Key", testKey: "traitify_test" },
      { id: 94, name: "humantic", status: "inactive", baseUrl: "https://humantic.ai", authType: "API Key", testKey: "humantic_psychometric", disabled: false },
    ]
  },
  {
    id: 30,
    name: "Vehicle Registration",
    description: "Vehicle registration verification",
    providers: [
      { id: 3001, name: "Evahan", status: "inactive", baseUrl: "https://api.evahan.com", authType: "API Key" },
    ]
  },
  {
    id: 31,
    name: "Vehicle Valuation",
    description: "Vehicle valuation and pricing",
    providers: [
      { id: 81, name: "carwale, cardekho", status: "inactive", baseUrl: "https://api.carwale.com", authType: "API Key", testKey: "vehicle_valuation", disabled: false },
    ]
  },
  {
    id: 32,
    name: "Gold Value",
    description: "Gold price and valuation services",
    providers: [
      { id: 3201, name: "money control", status: "inactive", baseUrl: "https://api.moneycontrol.com", authType: "API Key", testKey: "gold_price", disabled: false },
    ]
  },
  {
    id: 33,
    name: "Security",
    description: "Security and market data services",
    providers: [
      { id: 3301, name: "money control", status: "inactive", baseUrl: "https://api.moneycontrol.com", authType: "API Key" },
    ]
  },
  {
    id: 34,
    name: "GST Returns and Challans",
    description: "GST returns filing and challan services",
    providers: [
      { id: 3401, name: "GSP", status: "inactive", baseUrl: "https://api.gsp.gov.in", authType: "OAuth 2.0", testKey: "gst_return_status", disabled: false },
    ]
  },
  {
    id: 35,
    name: "TDS",
    description: "TDS filing and compliance services",
    providers: [
      { id: 3501, name: "NSGL", status: "inactive", baseUrl: "https://www.tin-nsdl.com", authType: "Certificate" },
    ]
  },
  {
    id: 36,
    name: "Property Title Check",
    description: "Property verification and title search",
    providers: [
      { id: 3601, name: "Squareyard,Magicbrick,99 acres", status: "inactive", baseUrl: "https://api.squareyards.com", authType: "API Key", testKey: "magicbricks_properties", disabled: false },
    ]
  },
  {
    id: 37,
    name: "Passport and Utility Bills",
    description: "Passport and utility bill verification",
    providers: [
      { id: 3701, name: "idcentral , eko india", status: "inactive", baseUrl: "https://api.idcentral.io", authType: "API Key", testKey: "passport_and_utility", disabled: false },
    ]
  },
  {
    id: 38,
    name: "CIBIL, Equifax, Experian, CRIF",
    description: "Credit bureau and scoring services",
    providers: [
      { id: 3801, name: "verifyal , surepass", status: "inactive", baseUrl: "https://api.verifyal.com", authType: "API Key", testKey: "cibil_report", disabled: false },
    ]
  },
  {
    id: 39,
    name: "Meeting",
    description: "Virtual meeting and collaboration",
    providers: [
      { id: 3901, name: "Zoho Meeting", status: "inactive", baseUrl: "https://meeting.zoho.com", authType: "OAuth 2.0", testKey: "zoho_test", disabled: false },
    ]
  }
];

// =============================================================================
// SECTION 3: UI COMPONENTS
// =============================================================================

const FormLabel = ({ children, required }) => (
  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-0.5 select-none">
    {children}
    {required && <span className="text-rose-500 ml-1" title="Required">*</span>}
  </label>
);

const Button = ({ children, variant = "primary", onClick, disabled, className, icon }) => {
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200 border border-transparent",
    secondary: "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 border border-transparent",
    danger: "bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-sm",
    ghost: "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-widest transition-all duration-200 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 text-xs ${variants[variant]} ${className}`}
    >
      {icon} {children}
    </button>
  );
};

// =============================================================================
// SECTION 4: MAIN COMPONENT
// =============================================================================

export default function ApiProviders() {
  const [apiCategories, setApiCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated by looking for tokens and persistent storage
  const hasValidTokens = !!sessionStorage.getItem("access") || !!localStorage.getItem("access");
  const persistentLoggedIn = localStorage.getItem("is_api_logged_in") === "true";
  const wasPreviouslyLoggedIn = localStorage.getItem("was_previously_logged_in") === "true";
  const wasPreviouslyActivated = localStorage.getItem("is_api_activated") === "true";

  // CRITICAL FIX: Use localStorage for persistent login state
  // This ensures login state survives browser session end and logout
  const immediateIsLoggedIn = hasValidTokens || persistentLoggedIn || wasPreviouslyLoggedIn;

  const [isActivated, setIsActivated] = useState(localStorage.getItem("is_api_activated") === "true");
  const [isLoggedIn, setIsLoggedIn] = useState(immediateIsLoggedIn);
  const [activationStatus, setActivationStatus] = useState(localStorage.getItem("api_status") || "Inactive");
  const [orgId, setOrgId] = useState(localStorage.getItem("organization_id") || "");
  const [apiKey, setApiKey] = useState(localStorage.getItem("api_key") || "");
  const [tenantData, setTenantData] = useState(null);
  const [rawCategories, setRawCategories] = useState(API_CATEGORIES);

  // IMMEDIATE FIX: Ensure localStorage has correct login state on component mount
  useEffect(() => {
    if (immediateIsLoggedIn) {
      console.log("[IMMEDIATE] Setting logged in state immediately to localStorage");
      localStorage.setItem("is_api_logged_in", "true");
      localStorage.setItem("was_previously_logged_in", "true");
    }
  }, []);

  // Fetch tenant status on mount to sync logged-in states
  useEffect(() => {
    const fetchTenantStatus = async () => {
      // Debug: Check what's in localStorage before fetch
      console.log("[INIT] localStorage before fetch:", {
        is_api_logged_in: localStorage.getItem("is_api_logged_in"),
        is_api_activated: localStorage.getItem("is_api_activated"),
        was_previously_logged_in: localStorage.getItem("was_previously_logged_in"),
        provider_configurations: sessionStorage.getItem("provider_configurations")
      });

      // If no tokens, don't attempt to fetch tenant status
      if (!hasValidTokens) {
        console.log("[INIT] No valid tokens found, skipping tenant status fetch");
        // If user was previously logged in, restore that knowledge
        if (wasPreviouslyLoggedIn) {
          console.log("[INIT] User was previously logged in, setting logged in state");
          setIsLoggedIn(true);
          sessionStorage.setItem("is_api_logged_in", "true");
        }
        return;
      }

      try {
        console.log("[INIT] Fetching tenant status on component mount...");
        const res = await integrationService.getTenantStatus();
        if (!res.data) {
          console.log("[INIT] No tenant data received, keeping session storage values");
          return;
        }

        setTenantData(res.data);
        console.log("[INIT] Tenant data received:", res.data);

        // Also fetch provider configurations specifically
        try {
          console.log("[INIT] Fetching provider configurations from database...");
          const providerRes = await integrationService.getProviderConfigurations();
          console.log("[INIT] Provider configurations raw response:", providerRes);

          if (providerRes.data) {
            console.log("[INIT] Provider configurations fetched successfully:", providerRes.data);
            setProviderConfigs(providerRes.data);
            sessionStorage.setItem("provider_configurations", JSON.stringify(providerRes.data));
          } else {
            console.log("[INIT] No provider configurations data received, using tenant data fallback");
          }
        } catch (providerErr) {
          console.log("[INIT] Failed to fetch provider configurations, using tenant data fallback:", providerErr);
          console.log("[INIT] Error details:", {
            message: providerErr.message,
            response: providerErr.response?.data,
            status: providerErr.response?.status
          });

          // Fallback to tenant data provider configurations
          if (res.data.provider_configurations) {
            const backendConfigs = res.data.provider_configurations;
            console.log("[INIT] Using tenant data provider configurations:", backendConfigs);
            setProviderConfigs(backendConfigs);
            sessionStorage.setItem("provider_configurations", JSON.stringify(backendConfigs));
          } else {
            console.log("[INIT] No provider configurations found anywhere, using empty object");
            setProviderConfigs({});
            sessionStorage.setItem("provider_configurations", JSON.stringify({}));
          }
        }

        // Sync global states - CRITICAL: Use localStorage for persistent login state
        const backendIsLoggedIn = res.data.is_api_logged_in !== false; // Default to true if not specified
        const backendIsActivated = res.data.is_api_activated || false;

        // CRITICAL FIX: Ensure user is marked as logged in if they have valid tokens
        // This prevents showing "Login" button when user is already authenticated
        const finalIsLoggedIn = hasValidTokens || backendIsLoggedIn || wasPreviouslyLoggedIn;

        setIsLoggedIn(finalIsLoggedIn);
        setIsActivated(backendIsActivated);
        setOrgId(res.data.organization_id || "");
        setApiKey(res.data.api_key || "");

        // Save to localStorage for persistence across sessions
        localStorage.setItem("is_api_logged_in", String(finalIsLoggedIn));
        localStorage.setItem("is_api_activated", String(backendIsActivated));
        localStorage.setItem("organization_id", res.data.organization_id || "");
        localStorage.setItem("api_key", res.data.api_key || "");

        // Mark that user was previously logged in for future sessions
        localStorage.setItem("was_previously_logged_in", "true");

        console.log("[SYNC] Global states synced:", {
          hasValidTokens: hasValidTokens,
          wasPreviouslyLoggedIn: wasPreviouslyLoggedIn,
          backendIsLoggedIn: backendIsLoggedIn,
          finalIsLoggedIn: finalIsLoggedIn,
          isActivated: backendIsActivated,
          orgId: res.data.organization_id,
          providerConfigsCount: Object.keys(providerConfigs).length
        });

        // Debug: Check final state after sync
        console.log("[INIT] Final state after sync:", {
          finalIsLoggedIn: finalIsLoggedIn,
          isActivated: backendIsActivated,
          providerConfigs: providerConfigs,
          localStorage_after: {
            is_api_logged_in: localStorage.getItem("is_api_logged_in"),
            is_api_activated: localStorage.getItem("is_api_activated"),
            was_previously_logged_in: localStorage.getItem("was_previously_logged_in"),
            provider_configurations: sessionStorage.getItem("provider_configurations")
          }
        });
      } catch (err) {
        console.error("[INIT] Failed to sync tenant status:", err);
        // If we have tokens but the fetch fails, assume we're logged in
        if (hasValidTokens) {
          console.log("[INIT] Token exists but fetch failed, assuming logged in status");
          setIsLoggedIn(true);
          localStorage.setItem("is_api_logged_in", "true");
          localStorage.setItem("was_previously_logged_in", "true");
        }
      }
    };

    const fetchCategories = async () => {
      try {
        console.log("[INIT] Fetching API categories...");
        const res = await integrationService.getApiCategories();
        if (res.data && res.data.length > 0) {
          setRawCategories(res.data);
          console.log("[INIT] API categories fetched:", res.data.length, "categories");
        } else {
          console.log("[INIT] Backend returned empty/no categories, using hardcoded fallback.");
          setRawCategories(API_CATEGORIES);
        }
      } catch (err) {
        console.error("[INIT] Failed to fetch API categories:", err);
        console.log("[INIT] Using hardcoded API_CATEGORIES fallback due to error.");
        setRawCategories(API_CATEGORIES);
      }
    };

    // Execute both fetches in parallel
    Promise.all([fetchTenantStatus(), fetchCategories()]);
  }, []);

  // Provider-specific configs
  const [providerConfigs, setProviderConfigs] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("provider_configurations") || "{}");
    } catch {
      return {};
    }
  });

  // Function to manually refresh tenant status (useful for debugging)
  const refreshTenantStatus = async () => {
    try {
      console.log("[REFRESH] Manually refreshing tenant status...");
      const res = await integrationService.getTenantStatus();
      if (!res.data) return;

      setTenantData(res.data);

      // Sync provider configurations if backend has them
      if (res.data.provider_configurations) {
        const backendConfigs = res.data.provider_configurations;
        setProviderConfigs(backendConfigs);
        sessionStorage.setItem("provider_configurations", JSON.stringify(backendConfigs));
        console.log("[REFRESH] Provider configurations refreshed:", backendConfigs);
      }

      // Sync global states
      setIsLoggedIn(res.data.is_api_logged_in);
      setIsActivated(res.data.is_api_activated);
      setOrgId(res.data.organization_id || "");
      setApiKey(res.data.api_key || "");

      sessionStorage.setItem("is_api_logged_in", String(res.data.is_api_logged_in));
      sessionStorage.setItem("is_api_activated", String(res.data.is_api_activated));

      console.log("[REFRESH] Global states refreshed:", {
        isLoggedIn: res.data.is_api_logged_in,
        isActivated: res.data.is_api_activated,
        orgId: res.data.organization_id
      });
    } catch (err) {
      console.error("[REFRESH] Failed to refresh tenant status:", err);
    }
  };

  // Activation Flow State
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activeProviderSelection, setActiveProviderSelection] = useState(null); // { id, categoryId, name }
  const [activationStep, setActivationStep] = useState("sandbox_login"); // 'sandbox_login' | 'details_form'
  const [sandboxCredentials, setSandboxCredentials] = useState({ email: "", password: "" });
  const [activationForm, setActivationForm] = useState({
    cin: "",
    pan: "",
    gstin: "",
    companyName: "",
    usersCount: ""
  });

  // Initialize with data from backend and overlay provider configs
  useEffect(() => {
    if (rawCategories.length === 0) return;

    const updated = rawCategories.map(cat => ({
      ...cat,
      providers: (cat.providers || []).map(p => {
        const config = providerConfigs[String(p.id)];
        const isLoggedIn = config ? !!config.is_logged_in : false;
        const isActivated = config !== undefined ? !!config.is_activated : p.status === "active";

        const testKey = p.test_key || p.testKey;
        const isDisabled = p.disabled || !integrationService.isApiImplemented(testKey);

        return {
          ...p,
          // Map backend field names to frontend expectations
          baseUrl: p.base_url || p.baseUrl,
          authType: p.auth_type || p.authType,
          testKey,
          isLoggedIn,
          isActivated,
          disabled: isDisabled,
          status: isActivated ? "active" : "inactive"
        };
      })
    }));
    setApiCategories(updated);
  }, [rawCategories, providerConfigs]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!search) return apiCategories;
    const s = search.toLowerCase();
    return apiCategories.filter(cat =>
      cat.name.toLowerCase().includes(s) ||
      cat.description.toLowerCase().includes(s) ||
      cat.providers.some(p => p.name.toLowerCase().includes(s))
    );
  }, [apiCategories, search]);

  // Handle provider test
  const handleTestProvider = async (testKey, silent = false) => {
    if (!testKey) {
      alert("Test connection not implemented for this provider yet.");
      return;
    }
    setLoading(true);
    try {
      let result;
      switch (testKey) {
        case "msg91_otp":
          result = await integrationService.sendMsg91Otp("917009963071");
          break;
        case "twilio_sms":
          result = await integrationService.sendTwilioSms("917009963071", "Hello from Frontend!");
          break;
        case "cashfree_payment":
          result = await integrationService.createCashfreeOrder({ amount: 10, phone: "917009963071", email: "test@example.com" });
          break;
        case "pine_payment":
          result = await integrationService.testPinePayment("TEST_ORDER_123");
          break;
        case "paypal_payment":
          result = await integrationService.createPayPalPayment({ amount: "10.00" });
          if (result.links) {
            const approval = result.links.find(l => l.rel === "approval_url");
            if (approval) window.open(approval.href, '_blank');
          }
          break;
        case "exotel_whatsapp":
          result = await integrationService.sendExotelWhatsApp({ to: "917009963071", message: "Hello from Exotel!" });
          break;
        case "twilio_whatsapp":
          result = await integrationService.sendTwilioWhatsApp();
          break;
        case "slack_whatsapp":
          result = await integrationService.slackToWhatsApp({ to: "917009963071", text: "Hello from Slack!" });
          break;
        case "vonage_whatsapp":
          result = await integrationService.sendWhatsAppSandbox({ to: "917009963071", message: "Hello from Vonage!" });
          break;
        case "cloud_whatsapp":
          result = await integrationService.sendWhatsAppTest();
          break;
        case "openai_chat":
          result = await integrationService.chatWithOpenAI("Hello, who are you?");
          break;
        case "openai_voice":
          alert("Please use Postman to test file uploads for now.");
          setLoading(false);
          return;
        case "neon_query":
          result = await integrationService.neonQuery("SELECT NOW();");
          break;
        case "cams_statement":
          result = await integrationService.camsStatement();
          break;
        case "setu_merchants":
          result = await integrationService.getSetuMerchants();
          break;
        case "polygon_block":
          result = await integrationService.getPolygonBlock();
          break;
        case "gochain_block":
          result = await integrationService.getGochainBlock();
          break;
        case "tds_status":
          result = await integrationService.testTdsStatus();
          break;
        case "gst_return_status":
          result = await integrationService.getGstReturnStatus("27AAJCM9929L1ZM", "2023-24");
          break;
        case "mailgun_test":
          result = await integrationService.sendTestEmail();
          break;
        case "brevo_campaign":
          result = await integrationService.sendBrevoCampaign();
          break;
        case "youtube_details":
          result = await integrationService.getYoutubeChannel("UC_x5XG1OV2P6uYZ5gzMCY6A");
          break;
        case "exotel_call":
          result = await integrationService.testExotelCall("917675001232", "919550817534");
          break;
        case "myoperator_call":
          result = await integrationService.testMyOperatorCall("917675001232", "919550817534");
          break;
        case "zoho_test":
          integrationService.zohoLogin();
          setLoading(false);
          return;
        case "leegality_doc":
          result = await integrationService.createLeegalityDoc({
            template_id: "test",
            signers: [],
            fields: {}
          });
          break;
        case "gold_price":
          result = await integrationService.getGoldPrice();
          break;
        case "magicbricks_properties":
          result = await integrationService.getMagicbricksProperties();
          break;
        case "instagram_profile":
          result = await integrationService.getInstagramProfile();
          break;
        case "mca_company_search":
          result = await integrationService.searchCompany("Reliance");
          break;
        case "vendor_payout":
          result = await integrationService.createPayout({ email: "test@example.com", amount: 10 });
          break;
        case "cloud_structure":
          result = await integrationService.createGcpInstance({
            project_id: "test-project",
            zone: "us-central1-a",
            instance_name: "test-instance",
            machine_type: "n1-standard-1",
            source_image: "projects/debian-cloud/global/images/family/debian-11",
            refresh_token: "test_token"
          });
          break;
        case "perfios_test":
          result = await integrationService.testPerfios();
          break;
        case "passport_and_utility":
          result = await integrationService.passportUtilityTest();
          break;
        case "cibil_report":
          result = await integrationService.fetchCibilReport({
            name: "John Doe",
            mobile: "9876543210",
            pan: "ABCDE1234F",
            dob: "1990-01-01"
          });
          break;
        case "cibil_report":
          result = await integrationService.fetchCibilReport({
            name: "John Doe",
            mobile: "9876543210",
            pan: "ABCDE1234F",
            dob: "1990-01-01"
          });
          break;
        case "zoom_test":
          result = await integrationService.createZoomMeeting({
            topic: "Test Virtual Meeting",
            start_time: new Date(Date.now() + 3600000).toISOString(),
            duration: 30
          });
          break;
        case "zoho_meeting_test":
        case "zoho_test":
          result = await integrationService.createZohoMeeting({
            topic: "Test Zoho Meeting",
            start_time: "2024-05-01T10:00:00+05:30", // Example format, Zoho requires something specific? Let's use ISO.
            duration: 30,
            refresh_token: "dummy_refresh_token_test",
            module: "testing"
          });
          break;
        case "google_meet_test":
        case "google_calendar_test":
          integrationService.googleCalendarLogin();
          setLoading(false);
          return;
        default:
          alert("Unknown test key: " + testKey);
          setLoading(false);
          return;
      }

      console.log(`[TEST: ${testKey}] Result:`, result);
      if (!silent) alert(`Test Success for ${testKey}!\nCheck the browser console for more details.`);
      return result; // Return result for unified messaging if needed
    } catch (error) {
      console.error(`[TEST: ${testKey}] Error:`, error);
      alert(`Test Failed for ${testKey}: ` + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle provider activation (local state only if needed, but we now sync with configs)
  const handleActivateProvider = (categoryId, providerId) => {
    // This is now largely handled by the activation flow and providerConfigs
  };

  // Handle provider deactivation
  const handleDeactivateProvider = async (categoryId, providerId) => {
    if (!window.confirm("Are you sure you want to deactivate this provider?")) return;

    setLoading(true);
    try {
      const res = await integrationService.deactivateProvider({ providerId });

      // Update local providerConfigs state
      const newConfigs = { ...providerConfigs };
      newConfigs[String(providerId)] = {
        ...(newConfigs[String(providerId)] || {}),
        is_activated: false,
        is_logged_in: true, // Keep logged in so button shows "Activate" not "Login"
        api_status: "Inactive"
      };
      setProviderConfigs(newConfigs);
      sessionStorage.setItem("provider_configurations", JSON.stringify(newConfigs));

      // Save to database
      try {
        await integrationService.saveProviderConfigurations(newConfigs);
        console.log("[DB] Provider configurations saved to database after deactivation");
      } catch (dbErr) {
        console.error("[DB] Failed to save provider configurations after deactivation:", dbErr);
      }

      // Force immediate UI update by triggering a re-render
      // This ensures the provider button updates immediately
      setRawCategories(prev => [...prev]);

      alert(res.data?.message || "Provider deactivated successfully");
    } catch (error) {
      console.error("Deactivation failed:", error);
      alert("Deactivation failed: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle direct provider activation (when already logged in)
  const handleDirectProviderActivation = async (providerId) => {
    setLoading(true);
    try {
      const payload = {
        providerId: providerId,
        isLoginStep: false,
        // No additional form data needed for direct activation
      };

      const res = await integrationService.activateOrganization(payload);

      // Update per-provider config
      const newConfigs = { ...providerConfigs };
      newConfigs[String(providerId)] = {
        is_logged_in: res.data.is_logged_in,
        is_activated: res.data.is_activated,
        api_status: res.data.api_status
      };
      setProviderConfigs(newConfigs);
      sessionStorage.setItem("provider_configurations", JSON.stringify(newConfigs));

      // Save to database
      try {
        await integrationService.saveProviderConfigurations(newConfigs);
        console.log("[DB] Provider configurations saved to database");
      } catch (dbErr) {
        console.error("[DB] Failed to save provider configurations:", dbErr);
      }

      // Find the provider to check if it has a test key for auto-test
      const provider = apiCategories.flatMap(cat => cat.providers).find(p => String(p.id) === String(providerId));

      // Show activation alert ONLY if we are NOT about to run an auto-test
      if (!provider?.testKey || !res.data.is_activated) {
        alert(res.data.message || "Provider activated successfully");
      }

      // ✅ Handle final state - automatically trigger Test Connection if successful
      if (res.data.is_activated && provider?.testKey) {
        console.log(`[AUTO-TEST] Running connection test for ${provider.testKey}...`);
        try {
          // Run test non-silently so it shows the FINAL success message
          await handleTestProvider(provider.testKey, false);
        } catch (testErr) {
          console.error("Auto-test failed:", testErr);
        }
      }
    } catch (error) {
      console.error("Direct activation failed:", error);
      alert("Activation failed: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Start Activation Flow
  const handleStartActivation = async (provider = null, categoryId = null) => {
    // Check if system login should be checked or provider specific login
    const targetIsLoggedIn = provider ? providerConfigs[String(provider.id)]?.is_logged_in : isLoggedIn;
    const targetIsActivated = provider ? providerConfigs[String(provider.id)]?.is_activated : isActivated;

    // Always set the active provider selection when a provider is passed
    if (provider) {
      setActiveProviderSelection({ ...provider, categoryId });
    }

    if (targetIsLoggedIn && !targetIsActivated) {
      // ✅ Step 2: Already Logged In -> Skip form and activate directly
      if (provider) {
        // For provider-specific activation, call the activation API directly
        await handleDirectProviderActivation(provider.id);
      } else {
        // For global activation, use the existing flow
        handleProviderActivationStep(null, false);
      }
      return;
    }

    // Step 1: Redirect to Sandbox Login
    setLoading(true);
    try {
      if (provider && provider.baseUrl) {
        window.open(provider.baseUrl, '_blank');
      }

      // Open the login modal to proceed
      setShowActivationModal(true);
      setActivationStep("sandbox_login");
    } catch (error) {
      console.error("Failed to initiate sandbox login:", error);
      alert("Failed to initiate sandbox login: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = (e) => {
    e.preventDefault();
    if (!sandboxCredentials.email || !sandboxCredentials.password) {
      alert("Please enter Sandbox credentials");
      return;
    }
    handleProviderActivationStep(e);
  };

  // Handle provider or global organization activation
  const handleProviderActivationStep = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const isLoginStep = activationStep === "sandbox_login";
      const payload = {
        providerId: activeProviderSelection?.id,
        isLoginStep: isLoginStep,
        ...(isLoginStep ? {
          sandbox_email: sandboxCredentials.email,
          password: sandboxCredentials.password
        } : activationForm)
      };

      const res = await integrationService.activateOrganization(payload);

      if (activeProviderSelection) {
        // Update per-provider config
        const newConfigs = { ...providerConfigs };
        newConfigs[String(activeProviderSelection.id)] = {
          is_logged_in: res.data.is_logged_in,
          is_activated: res.data.is_activated,
          api_status: res.data.api_status
        };
        setProviderConfigs(newConfigs);
        sessionStorage.setItem("provider_configurations", JSON.stringify(newConfigs));

        // Save to database
        try {
          await integrationService.saveProviderConfigurations(newConfigs);
          console.log("[DB] Provider configurations saved to database after activation");
        } catch (dbErr) {
          console.error("[DB] Failed to save provider configurations after activation:", dbErr);
        }
      } else {
        // Update global config
        const { is_api_activated, is_api_logged_in, api_status, organization_id, api_key } = res.data;
        setIsActivated(is_api_activated);
        setIsLoggedIn(is_api_logged_in);
        setActivationStatus(api_status);
        setOrgId(organization_id);
        setApiKey(api_key);

        sessionStorage.setItem("is_api_activated", String(is_api_activated));
        sessionStorage.setItem("is_api_logged_in", String(is_api_logged_in));
        sessionStorage.setItem("api_status", api_status);
        sessionStorage.setItem("organization_id", organization_id || "");
        sessionStorage.setItem("api_key", api_key || "");

        // Save provider configurations to database if they exist
        if (Object.keys(providerConfigs).length > 0) {
          try {
            await integrationService.saveProviderConfigurations(providerConfigs);
            console.log("[DB] Provider configurations saved to database after global activation");
          } catch (dbErr) {
            console.error("[DB] Failed to save provider configurations after global activation:", dbErr);
          }
        }
      }

      // Log credentials if available for debugging
      if (res.data.organization_id || res.data.api_key) {
        console.log("[ACTIVATION] Generated Credentials:", {
          orgId: res.data.organization_id,
          apiKey: res.data.api_key ? "****" : "N/A"
        });
      }

      // Show activation alert ONLY if we are NOT about to run an auto-test
      if (!activeProviderSelection?.testKey || !res.data.is_activated) {
        alert(res.data.message || "Operation successful");
      }

      // ✅ Handle final state
      if (res.data.is_activated) {
        // ✅ NEW: Automatically trigger Test Connection if successful
        if (activeProviderSelection?.testKey) {
          console.log(`[AUTO-TEST] Running connection test for ${activeProviderSelection.testKey}...`);
          try {
            // Run test non-silently so it shows the FINAL success message
            await handleTestProvider(activeProviderSelection.testKey, false);
          } catch (testErr) {
            console.error("Auto-test failed:", testErr);
          }
        }
        setShowActivationModal(false);
      }
    } catch (error) {
      console.error("Activation failed:", error);
      alert("Activation failed: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1800px] mx-auto min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2">API Providers</h1>
          <p className="text-slate-500 text-base md:text-lg font-medium">Configure and manage third-party API integrations for your system</p>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && !isActivated && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Connected
            </div>
          )}
          {isActivated ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-sm">
                <Icons.Check /> API Activated
              </div>
              {orgId && (
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: {orgId}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={handleStartActivation}
                disabled={loading}
                icon={<Icons.Lightning />}
              >
                {(() => {
                  console.log("[BUTTON] Debug button state:", {
                    loading: loading,
                    isLoggedIn: isLoggedIn,
                    hasValidTokens: hasValidTokens,
                    persistentLoggedIn: persistentLoggedIn,
                    wasPreviouslyLoggedIn: wasPreviouslyLoggedIn,
                    immediateIsLoggedIn: immediateIsLoggedIn,
                    buttonText: loading ? "Processing..." : (isLoggedIn ? "Activate" : "Login"),
                    localStorage: {
                      is_api_logged_in: localStorage.getItem("is_api_logged_in"),
                      is_api_activated: localStorage.getItem("is_api_activated"),
                      was_previously_logged_in: localStorage.getItem("was_previously_logged_in")
                    }
                  });
                  return loading ? "Processing..." : (isLoggedIn ? "Activate" : "Login");
                })()}
              </Button>
              <Button
                variant="ghost"
                onClick={refreshTenantStatus}
                disabled={loading}
                title="Refresh status from server"
                className="!px-3 !py-3"
              >
                <Icons.Search />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeProviderSelection ? `${activeProviderSelection.name}: ` : ""}
                  {activationStep === "sandbox_login" ? "Login" : "Activate API"}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  {activationStep === "sandbox_login" ? "Authenticate with your sandbox account" : "Complete your organization profile"}
                </p>
              </div>
              <button
                onClick={() => setShowActivationModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <Icons.XMark />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSandboxLogin} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase mb-4">
                    <Icons.Cloud /> Direct Activation Mode
                  </div>
                  <FormLabel required>Email</FormLabel>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="email@provider.com"
                    value={sandboxCredentials.email}
                    onChange={e => setSandboxCredentials({ ...sandboxCredentials, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel required>Password</FormLabel>
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={sandboxCredentials.password}
                    onChange={e => setSandboxCredentials({ ...sandboxCredentials, password: e.target.value })}
                  />
                </div>
                <div className="pt-4">
                  <Button variant="primary" className="w-full shadow-blue-200" icon={<Icons.Lightning />}>
                    {loading ? "Activating..." : "Activate & Connect"}
                  </Button>
                  <p className="mt-4 text-[10px] text-slate-400 text-center font-medium">
                    This will automatically verify your credentials and activate the API.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden mb-6 md:mb-8">
        <div className="p-4 md:p-8 border-b border-slate-100 bg-white">
          <div className="relative w-full max-w-lg">
            <span className="absolute left-5 top-4 text-slate-400"><Icons.Search /></span>
            <input
              className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="Search API categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* API Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredCategories.map((category) => {
          const activeProvider = category.providers.find(p => p.status === "active");
          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Card Header */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 md:p-6 border-b border-slate-200">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                    <Icons.Cloud />
                  </div>
                  {activeProvider && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      <Icons.Check /> Active
                    </span>
                  )}
                  {category.providers.some(p => providerConfigs[p.id]?.is_logged_in && !providerConfigs[p.id]?.is_activated) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">
                      <Icons.Cloud /> Connected
                    </span>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-2">{category.name}</h3>
                <p className="text-sm text-slate-600 font-medium">{category.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-5 md:p-6 space-y-4">
                {activeProvider && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Currently Active</span>
                      <Icons.Lightning />
                    </div>
                    <div className="text-sm font-bold text-emerald-800 mb-1">{activeProvider.name}</div>
                    <div className="text-xs text-emerald-600 font-medium break-all">{activeProvider.baseUrl}</div>
                    <div className="text-xs text-emerald-600 font-medium mt-1">Auth: {activeProvider.authType}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <FormLabel>Available Providers ({category.providers.length})</FormLabel>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {category.providers.map((provider) => (
                      <div
                        key={provider.id}
                        className={`flex items-center justify-between gap-2 p-3 rounded-lg border transition-all ${provider.disabled
                            ? "bg-gray-100 border-gray-300"
                            : provider.status === "active"
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-slate-50 border-slate-200 hover:border-blue-300"
                          }`}
                        style={{
                          opacity: provider.disabled ? 0.4 : 1,
                          filter: provider.disabled ? "grayscale(1)" : "none",
                          pointerEvents: provider.disabled ? "none" : "auto",
                          cursor: provider.disabled ? "not-allowed" : "pointer"
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{provider.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {provider.disabled
                              ? "Backend not integrated"
                              : provider.authType
                            }
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {provider.disabled ? (
                            <div className="flex items-center gap-1">
                              <span className="px-3 py-2 text-[10px] font-bold text-gray-600 bg-gray-200 rounded-lg border border-gray-300 uppercase tracking-wider">
                                Not Available
                              </span>
                              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center" title="Backend not integrated">
                                <Icons.XMark className="h-4 w-4 text-gray-600" />
                              </div>
                            </div>
                          ) : provider.status === "active" ? (
                            <div className="flex gap-1">
                              <span className="px-3 py-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-lg border border-emerald-200 uppercase tracking-wider">
                                Active
                              </span>
                              <Button
                                variant="danger"
                                onClick={() => handleDeactivateProvider(category.id, provider.id)}
                                disabled={loading || provider.disabled}
                                className="!px-2 !py-2 !text-[10px] shrink-0"
                                title="Deactivate"
                              >
                                <Icons.XMark />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="success"
                              onClick={() => handleStartActivation(provider, category.id)}
                              disabled={loading || provider.disabled}
                              className="!px-3 !py-2 !text-[10px] shrink-0"
                              icon={provider.isLoggedIn && provider.isActivated ? <Icons.Check /> : <Icons.Lightning />}
                            >
                              {!provider.isLoggedIn ? "Login" : "Activate"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.Search /></div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No APIs Found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}