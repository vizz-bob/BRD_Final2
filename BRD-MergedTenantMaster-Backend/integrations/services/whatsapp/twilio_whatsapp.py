import requests
from requests.auth import HTTPBasicAuth

class TwilioWhatsAppService:
    ACCOUNT_SID = "AC8a754fd470e563b06cdbb9ee454fc3c9"
    AUTH_TOKEN = "76e0994bb456a15b94d2ac59c125e7ae"
    FROM_NUMBER = "whatsapp:+14155238886"  # Twilio sandbox WhatsApp number

    @classmethod
    def send_message(cls, to_number, message):
        """
        Send WhatsApp message using Twilio API
        :param to_number: Recipient number in format +91XXXXXXXXXX
        :param message: Message text
        """
        url = f"https://api.twilio.com/2010-04-01/Accounts/{cls.ACCOUNT_SID}/Messages.json"

        data = {
            "From": cls.FROM_NUMBER,
            "To": f"whatsapp:{to_number}",
            "Body": message
        }

        response = requests.post(url, data=data, auth=HTTPBasicAuth(cls.ACCOUNT_SID, cls.AUTH_TOKEN))
        if response.status_code in [200, 201]:
            return response.json()
        return {"error": response.text}