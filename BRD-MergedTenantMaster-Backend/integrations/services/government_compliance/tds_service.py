import requests
import json

class TDSService:
    BASE_URL = "https://sandbox.tdsapi.com/v1/"  # Replace with actual sandbox endpoint if different
    API_KEY = "key_live_727de5213e704234b4417b9ab360326b"
    API_SECRET = "secret_live_128f5bec48f7445189d5d95355f5df7c"

    @staticmethod
    def check_status():
        """
        Example method to test API connectivity
        """
        url = f"{TDSService.BASE_URL}status"  # Replace with actual endpoint
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": TDSService.API_KEY,
            "X-API-SECRET": TDSService.API_SECRET
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            try:
                resp_json = response.json()
            except ValueError:
                resp_json = {"raw_response": response.text}

            if response.status_code == 200:
                return {"status_code": 200, "response": resp_json}
            else:
                return {
                    "status_code": response.status_code, 
                    "error": response.text,
                    "details": "API returned an error status"
                }
        except requests.exceptions.RequestException as e:
            return {
                "status_code": 500,
                "error": str(e),
                "details": "Failed to connect to TDS API"
            }