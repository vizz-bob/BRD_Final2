import requests

CLIENT_ID = "1000.3YY53XKU4FQZ0HTQIHJEREHWR6Z8LX"
CLIENT_SECRET = "dd47e33732f0d9314d192d08e16f40a00f8f7a8ba8"
REDIRECT_URI = "http://localhost:8000/api/v1/integrations/zoho/callback/"


def get_auth_url():
    return (
        "https://accounts.zoho.in/oauth/v2/auth?"
        "scope=ZohoCRM.modules.ALL"
        f"&client_id={CLIENT_ID}"
        "&response_type=code"
        "&access_type=offline"
        f"&redirect_uri={REDIRECT_URI}"
    )


def generate_tokens(code):
    url = "https://accounts.zoho.in/oauth/v2/token"

    data = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "code": code
    }

    response = requests.post(url, data=data)
    return response.json()


def get_leads(access_token):
    headers = {
        "Authorization": f"Zoho-oauthtoken {access_token}"
    }

    response = requests.get(
        "https://www.zohoapis.in/crm/v2/Leads",
        headers=headers
    )

    return response.json()