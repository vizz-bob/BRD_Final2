import requests


class HumanticAPI:
    """
    Humantic AI - Behavioral Psychometric API
    """

    def __init__(self):
        self.api_key = "chrexec_a6ae8346f4d0ca3268cb06678b3e521c"
        self.base_url = "https://api.humantic.ai/v1/user-profile"

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    # 🔹 Create user profile
    def create_profile(self, email, first_name=None, last_name=None):
        try:
            url = f"{self.base_url}/create"

            payload = {
                "email": email,
                "firstName": first_name,
                "lastName": last_name
            }

            response = requests.post(url, json=payload, headers=self.headers)

            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json()
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    # 🔹 Fetch user profile
    def get_profile(self, email):
        try:
            url = f"{self.base_url}/{email}"

            response = requests.get(url, headers=self.headers)

            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json()
            }

        except Exception as e:
            return {"success": False, "error": str(e)}