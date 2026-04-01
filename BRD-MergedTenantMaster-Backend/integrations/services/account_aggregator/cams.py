import requests


class CamsService:

    BASE_URL = "https://sandbox.api-setu.in/certificate/v3/camsonline/astmt"

    HEADERS = {
        "Content-Type": "application/json",
        "X-APISETU-APIKEY": "demokey123456ABCD789",
        "X-APISETU-CLIENTID": "in.gov.sandbox"
    }

    @staticmethod
    def get_account_statement(pan, from_date, to_date, email, mobile):
        payload = {
            "pan": pan,
            "fromDate": from_date,
            "toDate": to_date,
            "email": email,
            "mobile": mobile
        }

        try:
            response = requests.post(
                CamsService.BASE_URL,
                headers=CamsService.HEADERS,
                json=payload
            )
            
            # Check if response is JSON
            try:
                data = response.json()
            except Exception:
                data = {"raw_response": response.text}

            return {
                "status_code": response.status_code,
                "response": data
            }
        except Exception as e:
            return {
                "status_code": 500,
                "error": str(e)
            }