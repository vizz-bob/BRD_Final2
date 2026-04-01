import requests
from django.conf import settings


def send_sms(phone, message):

    url = "https://api.gupshup.io/sm/api/v1/msg"

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": settings.GUPSHUP_API_KEY
    }

    payload = {
        "channel": "sms",
        "destination": phone,
        "message": message
    }

    response = requests.post(url, headers=headers, data=payload)

    return response.json()