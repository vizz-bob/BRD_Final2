from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload
from django.conf import settings
import requests

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
CLIENT_ID = getattr(settings, "GOOGLE_DRIVE_CLIENT_ID", "")
CLIENT_SECRET = getattr(settings, "GOOGLE_DRIVE_CLIENT_SECRET", "")
REDIRECT_URI = getattr(settings, "GOOGLE_DRIVE_REDIRECT_URI", "http://127.0.0.1:8000/api/v1/integrations/google-drive/callback")

import urllib.parse

def get_google_drive_auth_url():
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

def get_google_drive_token(code):
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

def upload_file(tokens, filename="agenda.txt", content="Meeting agenda content"):
    creds = Credentials.from_authorized_user_info(tokens, SCOPES)
    service = build("drive", "v3", credentials=creds)
    file_metadata = {"name": filename}
    media = MediaInMemoryUpload(content.encode() if isinstance(content, str) else content, mimetype="text/plain")
    file = service.files().create(body=file_metadata, media_body=media, fields="id").execute()
    return file