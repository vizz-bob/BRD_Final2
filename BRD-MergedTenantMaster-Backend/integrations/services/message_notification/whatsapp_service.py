import requests
import json

class WhatsAppCloudService:
    ACCESS_TOKEN = "EAAiYIP83ZAXsBQqo4do6RZBsSSZCzZCz0wdhyVZBR9g6XRsTGRlFX8ZAm6Kdaixc1tCmGJnTsiu1heCasZChEKIpku7nYsnGHU9T8RZCaITsCfqTCAlvDH1V7vt16AGvtnzpFzGQWP6v3KmazsyamkQCuqBKSZARp3jFH5lHbk8Pc61bJmLdnOVoJSU4bqeDbzavDghZBFav9qAMamnrWtUxLA8DpC8PjzMqXiOdDTAH1GbdmOZCiQk9juthDIVA4oyjVWMVIgIZBmOWWJhXgZAcHSJZAJ"
    PHONE_NUMBER_ID = "1025830463942088"
    BASE_URL = f"https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages"

    @classmethod
    def send_template_message(cls, to_number, template_name="hello_world", language_code="en_US"):
        """
        Send a WhatsApp template message.
        :param to_number: recipient phone number with country code (e.g., "917009963071")
        :param template_name: template name created in WhatsApp Cloud API
        :param language_code: template language code (default "en_US")
        """
        headers = {
            "Authorization": f"Bearer {cls.ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code}
            }
        }

        response = requests.post(cls.BASE_URL, headers=headers, json=payload)
        if response.status_code in [200, 201]:
            return response.json()
        return {"error": response.text}