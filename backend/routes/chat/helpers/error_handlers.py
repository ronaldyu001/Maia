import requests

def _post(self, payload: dict) -> dict:
    try:
        r = requests.post(self.api_url, json=payload, timeout=60)
        if r.status_code >= 400:
            # Surface Ollama's error text to your test output
            try:
                detail = r.json()
            except Exception:
                detail = r.text
            raise Exception(f"Ollama HTTP {r.status_code}: {detail}")
        return r.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Ollama API error: {e}")