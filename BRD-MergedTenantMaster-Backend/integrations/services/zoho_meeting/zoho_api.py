import requests

CLIENT_ID = "1000.BR28P9MUBIMCEE7IN2ACHULRL2J0LM"
CLIENT_SECRET = "91c0caf32b94b9039bc036d63c2e780744dd5684ed"

BASE_URL = "https://sandbox.zohoapis.in/meeting/api/v2"


def get_access_token(refresh_token):
    """
    Generate Zoho OAuth access token
    """
    try:
        url = "https://accounts.zoho.in/oauth/v2/token"

        params = {
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "refresh_token"
        }

        response = requests.post(url, params=params)
        return response.json().get("access_token")

    except Exception as e:
        return None


def create_meeting(topic, start_time, duration, refresh_token):
    """
    Create Zoho Meeting
    """
    try:
        access_token = get_access_token(refresh_token)

        if not access_token:
            return {"error": "Failed to get access token"}

        url = f"{BASE_URL}/sessions.json"

        headers = {
            "Authorization": f"Zoho-oauthtoken {access_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "topic": topic,
            "start_time": start_time,
            "duration": duration
        }

        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}