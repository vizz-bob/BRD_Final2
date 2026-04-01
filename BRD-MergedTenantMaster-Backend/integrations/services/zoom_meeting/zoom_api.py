import requests
import base64

ACCOUNT_ID = "8RPrc2XaRommrN0X7ABb-Q"
CLIENT_ID = "WGv0leNwSr2Q4nknr2jj9w"
CLIENT_SECRET = "L5Q8z3f1vbBYQZsSlT7tIoTsVWfl3YV5"

BASE_URL = "https://api.zoom.us/v2"


def get_access_token():
    """
    Get Zoom OAuth access token (Server-to-Server OAuth)
    """
    try:
        url = "https://zoom.us/oauth/token"

        credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        params = {
            "grant_type": "account_credentials",
            "account_id": ACCOUNT_ID
        }

        response = requests.post(url, headers=headers, params=params)
        return response.json().get("access_token")

    except Exception as e:
        return None


def create_meeting(topic, start_time, duration=30):
    """
    Create Zoom meeting
    """
    try:
        access_token = get_access_token()

        if not access_token:
            return {"error": "Failed to get access token"}

        url = f"{BASE_URL}/users/me/meetings"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "topic": topic,
            "type": 2,  # scheduled meeting
            "start_time": start_time,
            "duration": duration,
            "timezone": "Asia/Kolkata",
            "settings": {
                "join_before_host": True,
                "approval_type": 0
            }
        }

        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}