import requests

# Your Neon REST API base URL
API_BASE_URL = "https://ep-bold-glade-a1qej1vl.apirest.ap-southeast-1.aws.neon.tech/neondb/rest/v1"

# Your Neon API token
API_TOKEN = "napi_9sar0vpp8m0i8l06vrpgk40ly8breez95it0ij8rrrthrtu8m2358eqxgguh2tlk"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def run_sql(query: str):
    """
    Execute SQL query on Neon PostgreSQL DB
    """
    url = f"{API_BASE_URL}/rpc/run_sql"  # REST endpoint for SQL execution
    payload = {"query": query}

    response = requests.post(url, json=payload, headers=HEADERS)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.text, "status_code": response.status_code}