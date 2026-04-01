import requests
import os
from django.conf import settings

class GoogleGeocodingAPI:
    def __init__(self, api_key=None):
        self.api_key = api_key or getattr(settings, "GOOGLE_MAPS_API_KEY", os.getenv("GOOGLE_MAPS_API_KEY"))
        self.base_url = "https://maps.googleapis.com/maps/api/geocode/json"

    def get_coordinates(self, address):
        if not self.api_key:
            return {"error": "Google Maps API Key not configured."}

        try:
            params = {
                "address": address,
                "key": self.api_key
            }
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()

            if data["status"] == "OK":
                location = data["results"][0]["geometry"]["location"]
                return {
                    "success": True,
                    "lat": location["lat"],
                    "lng": location["lng"],
                    "formatted_address": data["results"][0]["formatted_address"]
                }
            return {"success": False, "error": data["status"]}
        except Exception as e:
            return {"success": False, "error": str(e)}
