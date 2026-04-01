import base64, requests
from django.conf import settings

ZOOM_CLIENT_ID = getattr(settings, "ZOOM_CLIENT_ID", "your_client_id")
ZOOM_CLIENT_SECRET = getattr(settings, "ZOOM_CLIENT_SECRET", "your_client_secret")
ZOOM_REDIRECT_URI = getattr(settings, "ZOOM_REDIRECT_URI", "http://127.0.0.1:8000/api/v1/integrations/zoom/callback")

def get_zoom_auth_url():
    return f"https://zoom.us/oauth/authorize?response_type=code&client_id={ZOOM_CLIENT_ID}&redirect_uri={ZOOM_REDIRECT_URI}"

def exchange_code_for_token(code):
    auth_header = base64.b64encode(f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}".encode()).decode()
    response = requests.post(
        "https://zoom.us/oauth/token",
        data={
            "grant_type": "authorization_code", 
            "code": code, 
            "redirect_uri": ZOOM_REDIRECT_URI,
            "account_id": getattr(settings, "ZOOM_ACCOUNT_ID", "")
        },
        headers={"Authorization": f"Basic {auth_header}"}
    )
    return response.json()

def create_meeting(access_token):
    response = requests.post(
        "https://api.zoom.us/v2/users/me/meetings",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"topic": "Project Sync", "type": 2, "start_time": "2026-03-05T10:00:00", "duration": 60}
    )
    return response.json()