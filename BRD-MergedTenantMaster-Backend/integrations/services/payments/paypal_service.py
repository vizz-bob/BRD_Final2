import requests
from requests.auth import HTTPBasicAuth

class PayPalService:
    BASE_URL = "https://api-m.sandbox.paypal.com"  # Sandbox URL
    CLIENT_ID = "AVYB-RB6bZVOoNTQ_Wkxp69riKbC8nypZvk2_brG98kBOojsD2mM5n3WfB_isWS4scg86eORsNhyW_tv"
    CLIENT_SECRET = "EAlODvXkmf1vxXYPiVxcjkQ0ay7hpfLCqXt5SwQ7ciM5El8P5TYBdzvLji5xMibhziKKJ10pqpl_fX3T"

    @staticmethod
    def get_access_token():
        url = f"{PayPalService.BASE_URL}/v1/oauth2/token"
        headers = {"Accept": "application/json", "Accept-Language": "en_US"}
        data = {"grant_type": "client_credentials"}

        try:
            response = requests.post(
                url,
                headers=headers,
                data=data,
                auth=HTTPBasicAuth(PayPalService.CLIENT_ID, PayPalService.CLIENT_SECRET)
            )
            return response.json()
        except Exception:
            return {"error": "Failed to get access token", "status_code": (response.status_code if 'response' in locals() else 500)}

    @staticmethod
    def create_payment(amount, currency="USD", description="Test Payment"):
        token_data = PayPalService.get_access_token()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return {"error": "Authentication failed with PayPal", "details": token_data}

        url = f"{PayPalService.BASE_URL}/v1/payments/payment"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        payload = {
            "intent": "sale",
            "payer": {"payment_method": "paypal"},
            "transactions": [{
                "amount": {"total": str(amount), "currency": currency},
                "description": description
            }],
            "redirect_urls": {
                "return_url": "http://localhost:8000/paypal/success/",
                "cancel_url": "http://localhost:8000/paypal/cancel/"
            }
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            return response.json()
        except Exception:
            return {"error": "Failed to create payment", "status_code": (response.status_code if 'response' in locals() else 500), "raw": response.text if 'response' in locals() else None}