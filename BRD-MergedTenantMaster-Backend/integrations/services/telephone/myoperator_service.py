import requests
from django.conf import settings


class MyOperatorService:
    BASE_URL = getattr(settings, "MYOPERATOR_BASE_URL", "https://in.app.myoperator.com/integration/public_api")
    API_TOKEN = getattr(settings, "MYOPERATOR_API_TOKEN", "")
    SECRET_KEY = getattr(settings, "MYOPERATOR_SECRET_KEY", "")
    X_API_KEY = getattr(settings, "MYOPERATOR_X_API_KEY", "")
    COMPANY_ID = getattr(settings, "MYOPERATOR_COMPANY_ID", "")

    @classmethod
    def click_to_call(cls, customer_number: str, agent_number: str) -> dict:
        """
        Initiates a click-to-call via MyOperator API.
        """
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
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return {
                "status_code": response.status_code,
                "response": response.json()
            }
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}