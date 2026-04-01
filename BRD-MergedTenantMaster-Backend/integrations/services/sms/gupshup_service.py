import requests

def send_gupshup_sms(api_key, phone, message):

    url = "https://api.gupshup.io/sm/api/v1/msg"

    headers = {
        "apikey": api_key
    }

    payload = {
        "channel": "sms",
        "source": "TEST",
        "destination": phone,
        "message": message
    }

    response = requests.post(url, headers=headers, data=payload)

    return response.json()