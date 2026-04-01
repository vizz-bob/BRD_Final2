import requests


class GoogleCalendarAPI:
    """
    Google Calendar API Service (OAuth आधारित)
    """

    def __init__(self):
        self.client_id = "58342369728-sb0s309bcbg7krn6ji9unmrfn4vildlr.apps.googleusercontent.com"
        self.client_secret = "YOUR_CLIENT_SECRET"  # 🔥 Replace this
        self.redirect_uri = "http://127.0.0.1:8000/api/v1/integrations/google/callback/"
        self.base_url = "https://www.googleapis.com/calendar/v3"

    # 🔹 Step 1: Generate Google Login URL
    def get_auth_url(self):
        scope = "https://www.googleapis.com/auth/calendar.readonly"

        auth_url = (
            "https://accounts.google.com/o/oauth2/auth"
            f"?client_id={self.client_id}"
            f"&redirect_uri={self.redirect_uri}"
            "&response_type=code"
            f"&scope={scope}"
            "&access_type=offline"
            "&prompt=consent"
        )

        return auth_url

    # 🔹 Step 2: Exchange code → access token
    def exchange_code_for_token(self, code):
        try:
            url = "https://oauth2.googleapis.com/token"

            data = {
                "code": code,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uri": self.redirect_uri,
                "grant_type": "authorization_code",
            }

            response = requests.post(url, data=data)
            return response.json()

        except Exception as e:
            return {"success": False, "error": str(e)}

    # 🔹 Step 3: Get Calendar List
    def get_calendar_list(self, access_token):
        try:
            url = f"{self.base_url}/users/me/calendarList"

            headers = {
                "Authorization": f"Bearer {access_token}"
            }

            response = requests.get(url, headers=headers)
            return response.json()

        except Exception as e:
            return {"success": False, "error": str(e)}

    # 🔹 Step 4: Create Event (Optional - for Meet links)
    def create_event(self, access_token, summary="Test Meeting"):
        try:
            url = f"{self.base_url}/calendars/primary/events"

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            payload = {
                "summary": summary,
                "start": {
                    "dateTime": "2026-04-01T10:00:00+05:30"
                },
                "end": {
                    "dateTime": "2026-04-01T11:00:00+05:30"
                },
                "conferenceData": {
                    "createRequest": {
                        "requestId": "sample123",
                        "conferenceSolutionKey": {
                            "type": "hangoutsMeet"
                        }
                    }
                }
            }

            params = {
                "conferenceDataVersion": 1
            }

            response = requests.post(url, headers=headers, json=payload, params=params)

            return response.json()

        except Exception as e:
            return {"success": False, "error": str(e)}