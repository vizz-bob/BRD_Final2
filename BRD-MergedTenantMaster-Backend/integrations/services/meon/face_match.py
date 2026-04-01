import requests

class MeonFaceMatchAPI:
    def __init__(self):
        self.client_id = "67640MQIXGWUK7I2"
        self.client_secret = "67640xr1uk2LJ6aVOQjTVgSkixQBUvAqv1QrgF462KVEX2"
        self.base_url = "https://face-finder.meon.co.in/backend"

    def generate_token(self):
        try:
            url = f"{self.base_url}/generate_token_for_ipv_credentials"
            payload = {
                "client_id": self.client_id,
                "client_secret": self.client_secret
            }

            response = requests.post(url, json=payload)
            return response.json()

        except Exception as e:
            return {"success": False, "error": str(e)}

    def initiate_request(self, token, customer_id="12345"):
        try:
            url = f"{self.base_url}/initiate_request"
            payload = {
                "token": token,
                "customer_id": customer_id
            }

            response = requests.post(url, json=payload)
            return response.json()

        except Exception as e:
            return {"success": False, "error": str(e)}

    def export_data(self, token, transaction_id):
        try:
            url = f"{self.base_url}/export_data"
            payload = {
                "token": token,
                "transaction_id": transaction_id
            }

            response = requests.post(url, json=payload)
            return response.json()

        except Exception as e:
            return {"success": False, "error": str(e)}