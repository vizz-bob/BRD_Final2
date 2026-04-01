from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from django.conf import settings
import requests

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CLIENT_ID = getattr(settings, "GOOGLE_CALENDAR_CLIENT_ID", "")
CLIENT_SECRET = getattr(settings, "GOOGLE_CALENDAR_CLIENT_SECRET", "")
REDIRECT_URI = getattr(settings, "GOOGLE_CALENDAR_REDIRECT_URI", "http://127.0.0.1:8000/api/v1/integrations/google-calendar/callback")
API_KEY = getattr(settings, "GOOGLE_CALENDAR_API_KEY", "")
API_ENDPOINT = getattr(settings, "GOOGLE_CALENDAR_API_ENDPOINT", "https://www.googleapis.com/calendar/v3/users/me/calendarList")

import urllib.parse

def get_google_calendar_auth_url():
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

def get_google_calendar_token(code):
    url = "https://oauth2.googleapis.com/token"
    # Provide the API key if present during token exchange (though client_secret acts as the main credential here)
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }
    resp = requests.post(url, data=data)
    return resp.json()

def get_calendar_list(tokens):
    """Fetch the list of calendars using the endpoint directly or googleapiclient."""
    creds = Credentials.from_authorized_user_info(tokens, SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    
    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Accept": "application/json"
    }
    
    endpoint_url = API_ENDPOINT
    if API_KEY:
        endpoint_url = f"{endpoint_url}?key={API_KEY}"
        
    response = requests.get(endpoint_url, headers=headers)
    return response.json()

def create_event(tokens, join_url=None):
    creds = Credentials.from_authorized_user_info(tokens, SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    service = build("calendar", "v3", credentials=creds)
    event = {
        "summary": "Team Sync",
        "description": f"Join via: {join_url}" if join_url else "",
        "start": {"dateTime": "2026-03-05T10:00:00+05:30", "timeZone": "Asia/Kolkata"},
        "end": {"dateTime": "2026-03-05T11:00:00+05:30", "timeZone": "Asia/Kolkata"}
    }
    return service.events().insert(calendarId="primary", body=event).execute()