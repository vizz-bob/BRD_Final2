class MeonFaceMatchService:
    CLIENT_ID = "67640MQIXGWUK7I2"
    CLIENT_SECRET = "67640xr1uk2LJ6aVOQjTVgSkixQBUvAqv1QrgF462KVEX2"
    BASE_URL = "https://face-finder.meon.co.in/backend"

    @classmethod
    def generate_token(cls):
        import requests
        url = f"{cls.BASE_URL}/generate_token_for_ipv_credentials"
        payload = {
            "client_id": cls.CLIENT_ID,
            "client_secret": cls.CLIENT_SECRET
        }
        response = requests.post(url, json=payload)
        return response.json()

    @classmethod
    def initiate_request(cls, token, data):
        import requests
        url = f"{cls.BASE_URL}/initiate_request"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.post(url, headers=headers, json=data)
        return response.json()

    @classmethod
    def generate_token_for_export(cls, transaction_id):
        import requests
        url = f"{cls.BASE_URL}/generate_token_for_ipv_credentials"
        payload = {
            "client_id": cls.CLIENT_ID,
            "client_secret": cls.CLIENT_SECRET,
            "transaction_id": transaction_id
        }
        response = requests.post(url, json=payload)
        return response.json()

    @classmethod
    def export_data(cls, token, transaction_id):
        import requests
        url = f"{cls.BASE_URL}/export_data"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        payload = {
            "transaction_id": transaction_id
        }
        response = requests.post(url, headers=headers, json=payload)
        return response.json()
