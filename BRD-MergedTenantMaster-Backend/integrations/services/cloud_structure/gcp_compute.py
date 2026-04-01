import requests

CLIENT_ID = "578958413284-fpr1q4iidaqit8ed82v8qeit9iuj6qte.apps.googleusercontent.com"
CLIENT_SECRET = "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"

BASE_URL = "https://www.googleapis.com"


def get_access_token(refresh_token):
    """
    Generate OAuth access token using refresh token
    """
    url = "https://oauth2.googleapis.com/token"

    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }

    response = requests.post(url, data=data)
    return response.json().get("access_token")


def create_instance(project_id, zone, instance_name, machine_type, source_image, refresh_token):
    """
    Create GCP VM instance
    """
    try:
        access_token = get_access_token(refresh_token)

        url = f"{BASE_URL}/compute/v1/projects/{project_id}/zones/{zone}/instances"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "name": instance_name,
            "machineType": f"zones/{zone}/machineTypes/{machine_type}",
            "disks": [
                {
                    "boot": True,
                    "autoDelete": True,
                    "initializeParams": {
                        "sourceImage": source_image
                    }
                }
            ],
            "networkInterfaces": [
                {
                    "network": "global/networks/default",
                    "accessConfigs": [
                        {"type": "ONE_TO_ONE_NAT", "name": "External NAT"}
                    ]
                }
            ]
        }

        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    except Exception as e:
        return {"error": str(e)}