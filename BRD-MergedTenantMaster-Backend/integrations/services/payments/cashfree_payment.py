import requests
import uuid

BASE_URL = "https://sandbox.cashfree.com/pg"

APP_ID = "TEST1098143734ba061d182da4ef046e73418901"
SECRET_KEY = "cfsk_ma_test_713625b136d3a50609d4f399830bf4f1_89b3cb87"


def create_cashfree_order(amount, customer_phone, customer_email):

    url = f"{BASE_URL}/orders"

    order_id = str(uuid.uuid4())

    headers = {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY
    }

    payload = {
        "order_id": order_id,
        "order_amount": amount,
        "order_currency": "INR",
        "customer_details": {
            "customer_id": customer_phone,
            "customer_phone": customer_phone,
            "customer_email": customer_email
        }
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()