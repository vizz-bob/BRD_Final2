import base64
import requests
from django.conf import settings


# Virtual Meeting Zoom credentials (separate from Video Collaboration Zoom)
ACCOUNT_ID = getattr(settings, "ZOOM_MEETING_ACCOUNT_ID", "8RPrc2XaRommrN0X7ABb-Q")
CLIENT_ID = getattr(settings, "ZOOM_MEETING_CLIENT_ID", "WGv0leNwSr2Q4nknr2jj9w")
CLIENT_SECRET = getattr(settings, "ZOOM_MEETING_CLIENT_SECRET", "L5Q8z3f1vbBYQZsSlT7tIoTsVWfl3YV5")
SECRET_TOKEN = getattr(settings, "ZOOM_MEETING_SECRET_TOKEN", "I64gB_OPRniZVupgTmq1TQ")
API_ENDPOINT = getattr(settings, "ZOOM_MEETING_API_ENDPOINT", "https://api.zoom.us/v2/users/me/meetings")
TOKEN_ENDPOINT = getattr(settings, "ZOOM_MEETING_TOKEN_ENDPOINT", "https://zoom.us/oauth/token")

ZOOM_BASE_URL = "https://api.zoom.us/v2"


def get_access_token() -> str:
    """Get Zoom OAuth access token using Server-to-Server OAuth"""
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    response = requests.post(
        TOKEN_ENDPOINT,
        params={"grant_type": "account_credentials", "account_id": ACCOUNT_ID},
        headers={"Authorization": f"Basic {auth_header}"}
    )
    data = response.json()
    return data.get("access_token", "")


def create_meeting(access_token=None, topic="Virtual Meeting"):
    """Create a Zoom virtual meeting"""
    token = access_token or get_access_token()
    url = API_ENDPOINT
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "topic": topic,
        "type": 2,  # Scheduled
        "start_time": "2026-03-10T19:00:00",
        "duration": 30,
        "settings": {
            "host_video": True,
            "participant_video": True,
            "join_before_host": False,
        }
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.json()