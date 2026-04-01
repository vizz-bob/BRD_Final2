import requests

from django.conf import settings

ZOHO_CLIENT_ID = getattr(settings, "ZOHO_CLIENT_ID", "your_client_id")
ZOHO_CLIENT_SECRET = getattr(settings, "ZOHO_CLIENT_SECRET", "your_client_secret")
ZOHO_REDIRECT_URI = getattr(settings, "ZOHO_REDIRECT_URI", "http://127.0.0.1:8000/api/v1/integrations/zoho/callback")

def get_zoho_auth_url():
    return (
        f"https://accounts.zoho.com/oauth/v2/auth?"
        f"scope=AaaServer.profile.Read,ZohoMeeting.meetings.ALL&"
        f"client_id={ZOHO_CLIENT_ID}&"
        f"response_type=code&"
        f"redirect_uri={ZOHO_REDIRECT_URI}&"
        f"access_type=offline"
    )

def get_zoho_token(code):
    url = "https://accounts.zoho.com/oauth/v2/token"
    data = {
        "code": code,
        "client_id": ZOHO_CLIENT_ID,
        "client_secret": ZOHO_CLIENT_SECRET,
        "redirect_uri": ZOHO_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    response = requests.post(url, data=data)
    return response.json()

def create_meeting(token_data):
    access_token = token_data.get("access_token")
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}
    url = "https://meeting.zoho.com/api/v1/meetings"
    payload = {
        "title": "Test Meeting",
        "startTime": "2026-03-04T10:00:00",
        "duration": 30,
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.json()