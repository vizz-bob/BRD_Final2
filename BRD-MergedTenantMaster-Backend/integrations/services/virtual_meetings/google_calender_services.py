from googleapiclient.discovery import build

def create_event(creds, summary="Project Meeting", zoom_link=None):
    service = build("calendar", "v3", credentials=creds)

    event = {
        "summary": summary,
        "start": {"dateTime": "2026-03-03T19:00:00+05:30"},
        "end": {"dateTime": "2026-03-03T19:30:00+05:30"},
        "conferenceData": {
            "createRequest": {"requestId": "sample123"}
        }
    }

    if zoom_link:
        event["description"] = f"Zoom link: {zoom_link}"

    created_event = service.events().insert(
        calendarId="primary",
        body=event,
        conferenceDataVersion=1
    ).execute()

    return created_event