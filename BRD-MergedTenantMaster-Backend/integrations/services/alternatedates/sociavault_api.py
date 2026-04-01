import requests

API_KEY = "sk_live_a0a591e46e78fa60a1cd8c45dde62935"
BASE_URL = "https://api.sociavault.com"


def get_instagram_profile(username):
    """
    Fetch Instagram profile data using SocioVault API
    """
    try:
        url = f"{BASE_URL}/v1/scrape/instagram/profile"

        headers = {
            "Authorization": f"Bearer {API_KEY}"
        }

        params = {
            "username": username
        }

        response = requests.get(url, headers=headers, params=params)
        return response.json()

    except Exception as e:
        return {"error": str(e)}
        