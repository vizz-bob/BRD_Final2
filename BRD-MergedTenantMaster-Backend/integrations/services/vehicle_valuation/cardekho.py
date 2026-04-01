import requests


class CarDekhoAPI:
    """
    Vehicle Valuation using Apify (CarDekho scraper)
    """

    def __init__(self):
        self.api_token = "apify_api_tDbF5lwarAa68c7NGuPk1XLJHVwnNh2hjKPs"
        self.base_url = "https://api.apify.com/v2/acts/Tx4vKBWNWT4uMbpft/runs"

    def fetch_vehicle_data(self, url):
        try:
            payload = {
                "urls": [url],
                "offset": 0,
                "ignore_url_failures": True,
                "max_items_per_url": 20
            }

            response = requests.post(
                f"{self.base_url}?token={self.api_token}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
            