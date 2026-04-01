import requests
from requests.auth import HTTPBasicAuth
from django.conf import settings


class ExotelService:
    """Exotel Telephony/Dialer API - for making calls"""
    ACCOUNT_SID = getattr(settings, "EXOTEL_ACCOUNT_SID", "webarclight2")
    API_KEY = getattr(settings, "EXOTEL_CALL_API_KEY", "")
    API_TOKEN = getattr(settings, "EXOTEL_CALL_API_TOKEN", "")
    SUBDOMAIN = getattr(settings, "EXOTEL_SUBDOMAIN", "api.exotel.com")
    BASE_URL = f"https://{SUBDOMAIN}/v1/Accounts/{ACCOUNT_SID}/Calls/connect.json"

    @classmethod
    def make_call(cls, from_number: str, to_number: str) -> dict:
        payload = {
            "From": from_number,
            "To": to_number,
            "CallerId": from_number
        }

        try:
            response = requests.post(
                cls.BASE_URL,
                data=payload,
                auth=HTTPBasicAuth(cls.API_KEY, cls.API_TOKEN),
                timeout=10
            )
            response.raise_for_status()
            return {
                "status_code": response.status_code,
                "response": response.json()
            }
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}