
import requests

def send_twilio_sms(account_sid, auth_token, phone, message):

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"

    payload = {
        "To": phone,
        "From": "+1234567890",
        "Body": message
    }

    response = requests.post(url, data=payload, auth=(account_sid, auth_token))

    return response.json()