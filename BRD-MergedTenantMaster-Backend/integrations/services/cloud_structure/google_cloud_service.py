import requests
from google_auth_oauthlib.flow import InstalledAppFlow

CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
PROJECT_ID = "your-project-id"
ZONE = "us-central1-a"

SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]


def authenticate():

    flow = InstalledAppFlow.from_client_config(
        {
            "installed": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost"]
            }
        },
        scopes=SCOPES
    )

    creds = flow.run_local_server(port=8080)
    return creds.token


def create_instance(token):

    url = f"https://compute.googleapis.com/compute/v1/projects/{PROJECT_ID}/zones/{ZONE}/instances"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": "demo-instance",
        "machineType": f"zones/{ZONE}/machineTypes/n1-standard-1",
        "disks": [
            {
                "boot": True,
                "autoDelete": True,
                "initializeParams": {
                    "sourceImage": "projects/debian-cloud/global/images/family/debian-11"
                }
            }
        ],
        "networkInterfaces": [
            {"network": "global/networks/default"}
        ]
    }

    response = requests.post(url, headers=headers, json=payload)
    return response.json()