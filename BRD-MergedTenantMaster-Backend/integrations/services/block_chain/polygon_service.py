import requests
import json

class PolygonService:
    BASE_URL = "https://hidden-cosmological-wildflower.matic-amoy.quiknode.pro/817cce1caced7665ed640559f8b6e1336607ac71/"

    @staticmethod
    def get_block_number():
        """
        Fetch the latest block number from Polygon network
        """
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_blockNumber",
            "params": [],
            "id": 1
        }

        try:
            response = requests.post(
                PolygonService.BASE_URL,
                headers={"Content-Type": "application/json"},
                data=json.dumps(payload),
                timeout=10
            )

            if response.status_code == 200:
                try:
                    result = response.json()
                    block_number = int(result.get("result", "0x0"), 16)  # Convert hex to decimal
                    return {"status_code": 200, "block_number": block_number}
                except (ValueError, TypeError, KeyError) as e:
                    return {
                        "status_code": 200, 
                        "error": "Failed to parse API response",
                        "details": str(e),
                        "raw_response": response.text
                    }
            else:
                return {
                    "status_code": response.status_code, 
                    "error": response.text,
                    "details": "Blockchain API returned an error"
                }
        except requests.exceptions.RequestException as e:
            return {
                "status_code": 500,
                "error": str(e),
                "details": "Failed to connect to Polygon network"
            }