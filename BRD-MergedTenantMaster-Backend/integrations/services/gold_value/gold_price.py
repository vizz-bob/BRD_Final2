import requests

API_KEY = "a8816ef9f571d8b59490d02cac0dfef8"
BASE_URL = "https://api.metalpriceapi.com/v1/latest"


def get_gold_price():
    """
    Fetch gold price (XAU) in USD per troy ounce
    """
    try:
        params = {
            "api_key": API_KEY,
            "base": "USD",
            "currencies": "XAU"
        }

        response = requests.get(BASE_URL, params=params)
        data = response.json()

        if data.get("success"):
            return {
                "gold_price": data["rates"].get("USDXAU"),
                "unit": "troy ounce"
            }
        else:
            return {
                "error": data
            }

    except Exception as e:
        return {
            "error": str(e)
        }


# Run directly (for testing)
if __name__ == "__main__":
    result = get_gold_price()
    print(result)