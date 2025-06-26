import requests
from .config import FLASK_BACKEND_URL

def send_metrics(data):
    try:
        res = requests.post(FLASK_BACKEND_URL, json=data, timeout=5)
        res.raise_for_status()
        return True
    except Exception as e:
        print(f"Error sending data: {e}")
        return False
