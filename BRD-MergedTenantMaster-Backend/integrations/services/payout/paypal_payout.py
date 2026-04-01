import requests
import uuid

CLIENT_ID = "AaGaawC1BVwS-ORJ3f7qo7dQn08WIDtZiK-MQgYYJh0iUWzwuavjQqkWn1x3wTVbanWXJToiMYyF7NLK"
CLIENT_SECRET = "EIKq1d5RCa4KkuL4ZQo1JmpEDlpveaKfgNFXNnNZ4vWWFXkiKlk1EXtpSMo1AqldY5dKWqChfZophiHv"

# IMPORTANT: use API base, not paypal.com UI
BASE_URL = "https://api-m.sandbox.paypal.com"


def get_access_token():
    """
    Generate PayPal OAuth token
    """
    url = f"{BASE_URL}/v1/oauth2/token"

    response = requests.post(
        url,
        auth=(CLIENT_ID, CLIENT_SECRET),
        headers={"Accept": "application/json"},
        data={"grant_type": "client_credentials"}
    )

    return response.json().get("access_token")


def create_payout(receiver_email, amount):
    """
    Send payout to email
    """
    try:
        access_token = get_access_token()

        url = f"{BASE_URL}/v1/payments/payouts"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        payload = {
            "sender_batch_header": {
                "sender_batch_id": str(uuid.uuid4()),
                "email_subject": "You have a payout!"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": str(amount),
                        "currency": "USD"
                    },
                    "receiver": receiver_email,
                    "note": "Payment from system",
                    "sender_item_id": str(uuid.uuid4())
                }
            ]
        }

        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}