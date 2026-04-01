import requests

API_TOKEN = "apify_api_tDbF5lwarAa68c7NGuPk1XLJHVwnNh2hjKPs"

APIFY_URL = "https://api.apify.com/v2/acts/OGrVzUv64ImXJ1Cen/runs"


def fetch_magicbricks_properties():
    """
    Trigger Apify actor to scrape MagicBricks data
    """

    try:
        payload = {
            "urls": [
                "https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=2,3&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment,Residential-House,Villa&cityName=New-Delhi"
            ],
            "max_items_per_url": 30,
            "max_retries_per_url": 2,
            "proxy": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"],
                "apifyProxyCountry": "US"
            }
        }

        response = requests.post(
            f"{APIFY_URL}?token={API_TOKEN}",
            json=payload
        )

        return response.json()

    except Exception as e:
        return {"error": str(e)}