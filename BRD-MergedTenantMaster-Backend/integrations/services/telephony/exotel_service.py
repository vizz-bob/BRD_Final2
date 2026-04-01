import requests
from requests.auth import HTTPBasicAuth


class ExotelService:

    BASE_URL = "https://api.exotel.com/v1/Accounts/webarclight2/Calls/connect.json"
    API_KEY = "76f36abf776b33df0902b7c6522e0c2e4c611418ad5b8a3e"
    API_TOKEN = "422468c991f4c9bb334eb66bc07679d61fcff46356c29007"

    @classmethod
    def make_call(cls, from_number, to_number):

        payload = {
            "From": from_number,
            "To": to_number,
            "CallerId": from_number
        }

        response = requests.post(
            cls.BASE_URL,
            data=payload,
            auth=HTTPBasicAuth(cls.API_KEY, cls.API_TOKEN)
        )

        return response.json()