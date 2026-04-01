import requests
from requests.auth import HTTPBasicAuth

class SetuService:
    BASE_URL = "https://umap-uat-core.setu.co/api/v1/aggregators/merchants"
    CLIENT_ID = "6fdeb33f-dc08-4aa5-b1c0-39b2b44c2270"
    SECRET_KEY = "Anrbp1CXRX0vRLlDhoiB9qH1Neb2h9Ap"

    @staticmethod
    def get_merchants():
        """
        Fetch merchants using Setu Aggregator API
        """
        headers = {
            "Content-Type": "application/json",
        }

        try:
            response = requests.get(
                SetuService.BASE_URL,
                headers=headers,
                auth=HTTPBasicAuth(SetuService.CLIENT_ID, SetuService.SECRET_KEY),
                timeout=10
            )

            try:
                resp_json = response.json()
            except ValueError:
                resp_json = {"raw_response": response.text}

            return {
                "status_code": response.status_code,
                "response": resp_json
            }
        except requests.exceptions.RequestException as e:
            return {
                "status_code": 500,
                "error": str(e),
                "details": "Failed to connect to Setu API"
            }