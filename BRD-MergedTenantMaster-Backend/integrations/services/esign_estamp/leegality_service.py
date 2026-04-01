import requests

BASE_URL = "https://app1.leegality.com"
AUTH_TOKEN = "zkf7ay0SkVnLFqsA3KsGjfaL55CDlbaj"
PRIVATE_SALT = "e2Eqqu9Q5zEpBhrN4WEysKh0IgAEvY1h"

HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}

def create_document(template_id, signers, data):
    """
    Create a new document from a template.
    
    :param template_id: ID of the Leegality template
    :param signers: List of signers [{"name": "John Doe", "email": "john@example.com"}]
    :param data: Dictionary of template fields {"field1": "value1", ...}
    :return: JSON response
    """
    url = f"{BASE_URL}/v1/document/template/{template_id}/create"
    payload = {
        "signers": signers,
        "data": data
    }

    response = requests.post(url, json=payload, headers=HEADERS)
    try:
        return response.json()
    except Exception:
        return {"status_code": response.status_code, "raw_response": response.text}


def get_document_status(document_id):
    """
    Get status of a document by ID.
    """
    url = f"{BASE_URL}/v1/document/{document_id}/status"
    response = requests.get(url, headers=HEADERS)
    try:
        return response.json()
    except Exception:
        return {"status_code": response.status_code, "raw_response": response.text}