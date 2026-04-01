import requests


class MyOperatorService:

    # 🔹 Direct Credentials (Not recommended for production)
    BASE_URL = "https://in.app.myoperator.com/integration/public_api"
    API_TOKEN = "a395d1b40eea30a85ce2e2a73f4ebc86"
    SECRET_KEY = "044c1ad0f54bd9e4e587d71989a9017e5f6a1b1f7c8d37d15c2a3c4dd68c16d4"
    X_API_KEY = "oomfKA3I2K6TCJYistHyb7sDf0l0F6c8AZro5DJh"
    COMPANY_ID = "69a1b40b9929b841"

    @classmethod
    def click_to_call(cls, customer_number, agent_number):

        url = f"{cls.BASE_URL}/click2call"

        headers = {
            "Content-Type": "application/json",
            "x-api-key": cls.X_API_KEY,
            "Authorization": f"Bearer {cls.API_TOKEN}"
        }

        payload = {
            "company_id": cls.COMPANY_ID,
            "customer_number": customer_number,
            "agent_number": agent_number
        }

        try:
            response = requests.post(url, json=payload, headers=headers)

            return {
                "status_code": response.status_code,
                "response": response.json()
            }

        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }