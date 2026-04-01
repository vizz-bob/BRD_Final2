import requests

class VonageWhatsAppService:

    BASE_URL = "https://messages-sandbox.nexmo.com/v1/messages"
    API_KEY = "7791c82a"
    APP_ID = "62c7cbec-cda5-4e62-a3dc-9c84883a52f7"
    FROM_NUMBER = "14157386102"  # Sandbox WhatsApp number

    @staticmethod
    def send_message(to_number, message_text):
        """
        Send WhatsApp message via Vonage sandbox
        :param to_number: Recipient WhatsApp number in E.164 format (without +)
        :param message_text: Text message content
        """
        payload = {
            "from": {"type": "whatsapp", "number": VonageWhatsAppService.FROM_NUMBER},
            "to": {"type": "whatsapp", "number": to_number},
            "message": {"content": {"type": "text", "text": message_text}}
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {VonageWhatsAppService.API_KEY}"
        }

        response = requests.post(
            VonageWhatsAppService.BASE_URL,
            headers=headers,
            json=payload
        )

        return {
            "status_code": response.status_code,
            "response": response.json() if response.status_code in [200,201] else response.text
        }