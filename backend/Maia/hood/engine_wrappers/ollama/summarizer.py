import re
import requests

from backend.Maia.config import OLLAMA_HOST, SUMMARIZER_MODEL_NAME
from backend.Maia.hood.context_engineering.context_window.windows.summary_window import (
    generate_summarize_context_window,
)
from backend.logging.LoggingWrapper import Logger


MAX_SUMMARY_RETRIES = 3


class Summarizer:
    """
    Purpose:
    - Summarize text using Ollama (Singleton).

    Arguments:
    - model_name = SUMMARIZER_MODEL_NAME
    - host = Ollama's default port
    """

    _instance = None

    def __new__(cls, model_name=SUMMARIZER_MODEL_NAME, host=OLLAMA_HOST):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_name=SUMMARIZER_MODEL_NAME, host=OLLAMA_HOST):
        if self._initialized:
            return
        self._initialized = True

        self.model_name = model_name
        self.api_url = f"{host}/api/chat"

    def _is_json_wrapped(self, text: str) -> bool:
        return bool(re.search(r"{.*?}", text, re.S))

    def _request_summary(self, prompt: str) -> str:
        try:
            response = requests.post(
                url=self.api_url,
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                },
            )
            response.raise_for_status()
            return response.json()["message"]["content"]
        except requests.exceptions.RequestException as err:
            raise Exception(f"Ollama API error: {str(err)}")
        except (KeyError, TypeError) as err:
            raise Exception(f"Invalid response format: {str(err)}")


    def summarize(self, session_id: str, window_size_tkns: int, given_text: str) -> str:
        prompt = generate_summarize_context_window(
            window_size_tkns=window_size_tkns,
            given_text=given_text,
        )

        last_response = ""
        for _ in range(MAX_SUMMARY_RETRIES):
            last_response = self._request_summary(prompt)
            Logger.info(f'Summarize response is valid json: {self._is_json_wrapped(last_response)}')

            if self._is_json_wrapped(last_response):
                return last_response
            

        return last_response
