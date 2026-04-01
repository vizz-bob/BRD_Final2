from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from integrations.models import APIIntegration

def get_provider_credentials(tenant, provider):
    """
    Fetch stored credentials for a provider and refresh if expired.
    """
    integration = APIIntegration.objects.filter(tenant=tenant, provider=provider).first()
    if not integration:
        raise Exception(f"No credentials found for {provider}")

    creds_data = integration.config

    # Google services (Calendar, Drive, Meet)
    if provider in ["google_calendar", "google_drive", "google_meet"]:
        creds = Credentials.from_authorized_user_info(creds_data)
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            integration.config = creds.to_json()
            integration.save()
        return creds

    # Zoom
    if provider == "zoom":
        if "access_token" in creds_data:
            return creds_data["access_token"]
        else:
            raise Exception("Zoom access token missing")