import requests
from requests.auth import HTTPBasicAuth


class PinePaymentService:

    BASE_URL = "https://pluraluat.v2.pinepg.in/api/pay/v1"
    CLIENT_ID = "98301078-f521-40f5-be7f-179cff807fc3"
    CLIENT_SECRET = "a3245c0b44a64798bccbedfd4da8eb7e"
    MID = "119542"

    @classmethod
    def make_card_payment(cls, order_id):
        url = f"{cls.BASE_URL}/orders/{order_id}/payment"

        headers = {
            "Content-Type": "application/json",
            "MID": cls.MID
        }

        payload = {
            "payment_method": {
                "type": "CARD",
                "card": {
                    "number": "4111111111111111",
                    "expiry_month": "12",
                    "expiry_year": "2026",
                    "cvv": "123",
                    "holder_name": "Test User"
                }
            }
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            auth=HTTPBasicAuth(cls.CLIENT_ID, cls.CLIENT_SECRET)
        )

        return {
            "status_code": response.status_code,
            "response": response.text
        }