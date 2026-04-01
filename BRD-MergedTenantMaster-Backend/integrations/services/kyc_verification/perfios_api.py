import requests

BASE_URL = "https://testapi.karza.in"

# 🔐 Replace with your actual credentials
API_KEY = "your_api_key"
API_SECRET = "your_api_secret"


def get_headers():
    return {
        "Content-Type": "application/json",
        "x-karza-key": API_KEY,
        "x-karza-secret": API_SECRET
    }


# 🔹 GST Verification
def verify_gst(gstin):
    try:
        url = f"{BASE_URL}/gst/uat/v2/gstdetailed"

        payload = {
            "gstin": gstin
        }

        response = requests.post(url, headers=get_headers(), json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}


# 🔹 Aadhaar Consent
def aadhaar_consent(aadhaar_number):
    try:
        url = f"{BASE_URL}/v3/aadhaar-consent"

        payload = {
            "aadhaar": aadhaar_number,
            "consent": "Y"
        }

        response = requests.post(url, headers=get_headers(), json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}


# 🔹 Aadhaar Verification (OTP based)
def verify_aadhaar(aadhaar_number, otp):
    try:
        url = f"{BASE_URL}/v2/aadhaar-verification"

        payload = {
            "aadhaar": aadhaar_number,
            "otp": otp
        }

        response = requests.post(url, headers=get_headers(), json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}