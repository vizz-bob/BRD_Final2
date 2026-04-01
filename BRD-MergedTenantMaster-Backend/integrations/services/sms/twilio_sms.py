import requests
from requests.auth import HTTPBasicAuth

ACCOUNT_SID = "AC8a754fd470e563b06cdbb9ee454fc3c9"
AUTH_TOKEN = "76e0994bb456a15b94d2ac59c125e7ae"

TWILIO_SMS_NUMBER = "+14155238886"  # 🔥 Your Twilio SMS number (not WhatsApp number)


def send_sms(phone, message):

    url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json"

    data = {
        "From": TWILIO_SMS_NUMBER,
        "To": phone,
        "Body": message
    }

    response = requests.post(
        url,
        data=data,
        auth=HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN)
    )

    return response.json()