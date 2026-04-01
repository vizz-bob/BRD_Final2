import requests

API_KEY = "md_kDsI7Qb-8oxhROUbYGBhWO2TdpNC13so3GqipL1jo5w"
BASE_URL = "https://api.mindee.net"


def parse_passport(file_path):
    try:
        url = f"{BASE_URL}/v1/products/mindee/passport/v1/predict"

        headers = {
            "Authorization": f"Token {API_KEY}"
        }

        with open(file_path, "rb") as f:
            files = {"document": f}
            response = requests.post(url, headers=headers, files=files)

        return response.json()

    except Exception as e:
        return {"error": str(e)}


def parse_utility_bill(file_path):
    try:
        url = f"{BASE_URL}/v1/products/mindee/utility_bill/v1/predict"

        headers = {
            "Authorization": f"Token {API_KEY}"
        }

        with open(file_path, "rb") as f:
            files = {"document": f}
            response = requests.post(url, headers=headers, files=files)

        return response.json()

    except Exception as e:
        return {"error": str(e)}