import requests
from requests.auth import HTTPBasicAuth
from django.conf import settings


ACCOUNT_SID = getattr(settings, "EXOTEL_SMS_ACCOUNT_SID", "webarclight2")
API_KEY = getattr(settings, "EXOTEL_SMS_API_KEY", "")
API_TOKEN = getattr(settings, "EXOTEL_SMS_API_TOKEN", "")


def send_exotel_sms(phone: str, message: str, account_sid=None, api_key=None, api_token=None) -> dict:
    """Send SMS via Exotel SMS API"""
    sid = account_sid or ACCOUNT_SID
    key = api_key or API_KEY
    token = api_token or API_TOKEN

    url = f"https://api.exotel.com/v1/Accounts/{sid}/Sms/send"

    payload = {
        "From": "EXOTEL",
        "To": phone,
        "Body": message
    }

    try:
        response = requests.post(url, data=payload, auth=HTTPBasicAuth(key, token), timeout=10)
        return {"status_code": response.status_code, "response": response.json()}
    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": str(e)}