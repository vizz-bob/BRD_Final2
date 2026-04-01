import http.client
import json
import os


class GSTReturnService:
    """
    Service class for GST Return Status (RapidAPI)
    """

    def __init__(self):
        self.api_key = os.getenv("RAPIDAPI_KEY")
        self.host = "gst-return-status.p.rapidapi.com"

    def get_gst_return_status(self, gstin, financial_year=None):
        try:
            conn = http.client.HTTPSConnection(self.host)

            gstin = gstin.strip().upper()

            endpoint = f"/free/gstin/{gstin}"
            if financial_year:
                endpoint += f"?financial_year={financial_year}"

            headers = {
                "x-rapidapi-key": self.api_key,
                "x-rapidapi-host": self.host,
                "Content-Type": "application/json"
            }

            conn.request("GET", endpoint, headers=headers)

            res = conn.getresponse()
            data = res.read()

            conn.close()

            return {
                "success": res.status == 200,
                "status_code": res.status,
                "data": json.loads(data.decode("utf-8"))
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }