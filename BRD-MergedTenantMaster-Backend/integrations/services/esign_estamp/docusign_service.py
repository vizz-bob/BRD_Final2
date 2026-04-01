import requests

class DocuSignService:
    CLIENT_ID = "1769783572561"
    CLIENT_SECRET = "0e0bd4878f2d03415d6e15cfd5ac94f898925fcd8aca5174e935d4e32a5e5d09"
    REDIRECT_URI = "http://localhost:8000/api/v1/integrations/docusign/callback/"
    AUTH_URL = "https://account-d.docusign.com/oauth/token" # Demo environment

    @classmethod
    def exchange_code_for_token(cls, code):
        """
        Exchange authorization code for access token
        """
        data = {
            "grant_type": "authorization_code",
            "code": code,
        }
        
        response = requests.post(
            cls.AUTH_URL, 
            data=data, 
            auth=(cls.CLIENT_ID, cls.CLIENT_SECRET)
        )
        
        try:
            return response.json()
        except Exception:
            return {"error": response.text, "status_code": response.status_code}