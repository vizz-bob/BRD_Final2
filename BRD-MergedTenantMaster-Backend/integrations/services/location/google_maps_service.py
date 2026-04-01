import requests
from django.conf import settings

class GoogleMapsService:
    BASE_URL = getattr(settings, "GOOGLE_MAPS_API_BASE_URL", "https://maps.googleapis.com/maps/api")
    API_KEY = getattr(settings, "GOOGLE_MAPS_API_KEY", "AIzaSyCwMn_NUAWPJs0xIMQ4OpBIuq8uU7_qXZ8")

    @classmethod
    def geocode(cls, address: str) -> dict:
        """
        Geocodes an address using Google Maps Geocoding API.
        """
        url = f"{cls.BASE_URL}/geocode/json"
        params = {
            "address": address,
            "key": cls.API_KEY
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return {
                "status_code": response.status_code,
                "response": response.json()
            }
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}
