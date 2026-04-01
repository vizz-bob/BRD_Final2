import requests

API_KEY = "key_live_bc5ed2c4967048c99b78e2f1298c2c18"
API_SECRET = "secret_live_b4ae7a2d51d243e1ae38a025533aa6cb"

BASE_URL = "https://api.sandbox.co.in/mca"


def search_company(company_name):
    try:
        url = f"{BASE_URL}/company/master-data/search"

        headers = {
            "x-api-key": API_KEY,
            "x-api-secret": API_SECRET,
            "Content-Type": "application/json"
        }

        payload = {
            "company_name": company_name
        }

        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}


def search_director(director_name):
    try:
        url = f"{BASE_URL}/director/master-data/search"

        headers = {
            "x-api-key": API_KEY,
            "x-api-secret": API_SECRET,
            "Content-Type": "application/json"
        }

        payload = {
            "director_name": director_name
        }

        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}