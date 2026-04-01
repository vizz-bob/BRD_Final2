# integrations/services/mail/mailgun_service.py
import requests
from requests.auth import HTTPBasicAuth

SANDBOX_DOMAIN = "sandboxf100ae0644b448f0b74966a3fbac91db.mailgun.org"
API_KEY = "4d20366f66a7a79f10aec4f33eb19739-1c7f8751-5418c622"

def send_email(to_email, subject, text):
    url = f"https://api.mailgun.net/v3/{SANDBOX_DOMAIN}/messages"
    auth = HTTPBasicAuth("api", API_KEY)
    data = {
        "from": f"Excited User <mailgun@{SANDBOX_DOMAIN}>",
        "to": to_email,
        "subject": subject,
        "text": text
    }
    response = requests.post(url, auth=auth, data=data)
    try:
        return response.json()
    except Exception:
        return {"status_code": response.status_code, "raw_response": response.text}