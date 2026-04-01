import requests
from requests.auth import HTTPBasicAuth

ACCOUNT_SID = "webarclight2"
API_KEY = "76f36abf776b33df0902b7c6522e0c2e4c611418ad5b8a3e"
API_TOKEN = "422468c991f4c9bb334eb66bc07679d61fcff46356c29007"

BASE_URL = f"https://api.exotel.com/v1/Accounts/{ACCOUNT_SID}/Messages.json"

def send_whatsapp(to_number, message):
    payload = {
        "From": "917675001232", # Replace with your actual Exotel Virtual Number
        "To": to_number,
        "Body": message
    }

    try:
        response = requests.post(
            BASE_URL,
            data=payload,
            auth=HTTPBasicAuth(API_KEY, API_TOKEN),
            timeout=10
        )
        
        try:
            return response.json()
        except ValueError:
            return {
                "status_code": response.status_code,
                "error": "Non-JSON response from Exotel",
                "raw_response": response.text
            }
    except requests.exceptions.RequestException as e:
        return {
            "error": str(e),
            "details": "Failed to connect to Exotel API"
        }