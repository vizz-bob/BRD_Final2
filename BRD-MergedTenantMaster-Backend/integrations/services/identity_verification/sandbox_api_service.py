import requests

class SandboxAadhaarService:
    API_KEY = "key_live_b09d1fc738ab49f2ad6ee0b6e5ed3c52"
    API_SECRET = "secret_live_6996eab0164b44c7baa1359c86094c0c"
    BASE_URL = "https://api.sandbox.co.in/kyc/aadhaar/okyc"

    @classmethod
    def get_headers(cls):
        return {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0",
            "Authorization": f"Bearer {cls.API_SECRET}"
        }

    @classmethod
    def generate_otp(cls, aadhaar_number):
        url = f"{cls.BASE_URL}/otp"
        headers = {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0"
        }
        # Based on typical sandbox.co.in docs for aadhaar, auth headers might vary.
        # Assuming simple x-api-key or Authorization
        # Including both for safety, but payload usually has aadhaar_number
        payload = {"aadhaar_number": aadhaar_number}
        # Sandbox usually requires x-api-key, x-api-version, Authorization headers
        headers["Authorization"] = cls.API_SECRET # typical sandbox auth
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    @classmethod
    def verify_otp(cls, reference_id, otp):
        url = f"{cls.BASE_URL}/otp/verify"
        headers = {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0",
            "Authorization": cls.API_SECRET
        }
        payload = {"reference_id": reference_id, "otp": otp}
        response = requests.post(url, headers=headers, json=payload)
        return response.json()


class SandboxPanService:
    API_KEY = "key_live_bf57854a9987444fb296723dc7c96b45"
    API_SECRET = "secret_live_63ad80a0352b4faf915f57026f6aaad6"
    BASE_URL = "https://api.sandbox.co.in/kyc"

    @classmethod
    def verify_pan(cls, pan):
        url = f"{cls.BASE_URL}/pan/verify"
        headers = {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0",
            "Authorization": cls.API_SECRET
        }
        payload = {"pan": pan}
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    @classmethod
    def pan_aadhaar_status(cls, pan, aadhaar_number):
        url = f"{cls.BASE_URL}/pan-aadhaar/status"
        headers = {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0",
            "Authorization": cls.API_SECRET
        }
        payload = {"pan": pan, "aadhaar_number": aadhaar_number}
        response = requests.post(url, headers=headers, json=payload)
        return response.json()


class SandboxMcaService:
    API_KEY = "key_live_bc5ed2c4967048c99b78e2f1298c2c18"
    API_SECRET = "secret_live_b4ae7a2d51d243e1ae38a025533aa6cb"
    BASE_URL = "https://api.sandbox.co.in/mca"

    @classmethod
    def company_master_data(cls, cin):
        url = f"{cls.BASE_URL}/company/master-data/search"
        headers = {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0",
            "Authorization": cls.API_SECRET
        }
        payload = {"cin": cin}
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    @classmethod
    def director_master_data(cls, din):
        url = f"{cls.BASE_URL}/director/master-data/search"
        headers = {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0",
            "Authorization": cls.API_SECRET
        }
        payload = {"din": din}
        response = requests.post(url, headers=headers, json=payload)
        return response.json()


class SandboxIfscService:
    API_KEY = "key_test_a0c6bc3ae6004b778c3b33a1363e13b7"
    API_SECRET = "secret_test_8d62b9295d604c928a23557b5a16d6a1"
    BASE_URL = "https://api.sandbox.co.in/bank"

    @classmethod
    def verify_ifsc(cls, ifsc):
        url = f"{cls.BASE_URL}/{ifsc}"
        headers = {
            "x-api-key": cls.API_KEY,
            "x-api-version": "1.0",
            "Authorization": cls.API_SECRET
        }
        response = requests.get(url, headers=headers)
        return response.json()
