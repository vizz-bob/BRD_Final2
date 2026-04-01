import requests


class YouTubeService:

    BASE_URL = "https://www.googleapis.com/youtube/v3"
    API_KEY = "AIzaSyATHXGtA_qrF4j1lzBPkjnoWl0sXKX1mB8"

    @classmethod
    def get_channel_details(cls, channel_id):
        url = f"{cls.BASE_URL}/channels"

        params = {
            "part": "snippet,statistics",
            "id": channel_id,
            "key": cls.API_KEY
        }

        response = requests.get(url, params=params)

        return response.json()