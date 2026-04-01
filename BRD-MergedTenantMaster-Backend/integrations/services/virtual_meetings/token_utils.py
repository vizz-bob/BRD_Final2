from integrations.models import APIIntegration
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

def get_provider_credentials(tenant, provider):
    integration = APIIntegration.objects.filter(tenant=tenant, provider=provider).first()
    if not integration:
        raise Exception(f"No credentials found for {provider}")

    creds_data = integration.config

    if provider in ["google_calendar", "google_meet"]:
        creds = Credentials.from_authorized_user_info(creds_data)
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            integration.config = creds.to_json()
            integration.save()
        return creds

    if provider in ["zoom", "zoho"]:
        return creds_data.get("access_token")