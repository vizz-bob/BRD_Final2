import requests
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from django.conf import settings

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CLIENT_ID = getattr(settings, "GOOGLE_MEET_CLIENT_ID", "")
CLIENT_SECRET = getattr(settings, "GOOGLE_MEET_CLIENT_SECRET", "")
REDIRECT_URI = getattr(settings, "GOOGLE_MEET_REDIRECT_URI", "http://127.0.0.1:8000/api/v1/integrations/google-meet/callback")
API_KEY = getattr(settings, "GOOGLE_MEET_API_KEY", "")
API_ENDPOINT = getattr(settings, "GOOGLE_MEET_API_ENDPOINT", "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1")

import urllib.parse

def get_google_meet_auth_url():
    auth_base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent"
    }
    return f"{auth_base_url}?{urllib.parse.urlencode(params)}"

def get_google_meet_token(code):
    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }
    resp = requests.post(url, data=data)
    return resp.json()

def get_meet_calendar_list(tokens):
    """Fetch the user's calendar list using stored OAuth tokens."""
    creds = Credentials.from_authorized_user_info(tokens, SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Accept": "application/json"
    }
    url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"
    if API_KEY:
        url = f"{url}?key={API_KEY}"

    response = requests.get(url, headers=headers)
    return response.json()

def create_google_meet_event(access_token):
    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    data = {
        "summary": "Meeting with Google Meet",
        "start": {
            "dateTime": "2026-03-20T10:00:00",
            "timeZone": "Asia/Kolkata",
        },
        "end": {
            "dateTime": "2026-03-20T11:00:00",
            "timeZone": "Asia/Kolkata",
        },
        "conferenceData": {
            "createRequest": {
                "requestId": "meet123",
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }

    response = requests.post(
        url,
        headers=headers,
        json=data,
        params={"conferenceDataVersion": 1},
    )

    return response.json()