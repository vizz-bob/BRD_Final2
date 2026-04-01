import requests

# 🔐 Replace with your Surepass API key
API_KEY = "your_surepass_api_key"
BASE_URL = "https://api.surepass.io"   # confirm from your mail


def fetch_cibil_report(payload):
    """
    Fetch CIBIL credit report PDF
    """
    try:
        url = f"{BASE_URL}/credit-report-cibil/fetch-report-pdf"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }

        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}