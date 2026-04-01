import requests

class BrevoService:
    BASE_URL = "https://api.brevo.com/v3"
    API_KEY = "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"

    @classmethod
    def send_campaign(cls, campaign_name, subject, sender, recipients, html_content):
        """
        Send an email campaign.
        :param campaign_name: Name of the campaign
        :param subject: Email subject
        :param sender: dict {"name": "Sender Name", "email": "sender@example.com"}
        :param recipients: list of dicts [{"email": "recipient@example.com"}]
        :param html_content: HTML content of email
        """
        url = f"{cls.BASE_URL}/emailCampaigns"
        headers = {
            "accept": "application/json",
            "api-key": cls.API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "name": campaign_name,
            "subject": subject,
            "sender": sender,
            "type": "classic",
            "htmlContent": html_content,
            "recipients": {"listIds": [], "emails": [r['email'] for r in recipients]}
        }

        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            return response.json()
        return {"error": response.text}