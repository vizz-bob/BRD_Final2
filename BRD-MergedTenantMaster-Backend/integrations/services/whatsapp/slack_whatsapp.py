from .vonage_whatsapp_service import VonageWhatsAppService

def send_whatsapp(to_number, message):
    """
    Send WhatsApp message using Vonage sandbox as a fallback for the unresolvable sandbox URL
    """
    return VonageWhatsAppService.send_message(to_number, message)
