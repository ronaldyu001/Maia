import json
import re
import requests
from typing import Optional

from backend.Maia.config import OLLAMA_HOST, SUMMARIZER_MODEL_NAME
from backend.Maia.hood.context_engineering.context_window.windows.summary_window import (
    generate_summarize_context_window,
)
from backend.logging.LoggingWrapper import Logger
from backend.Maia.tools.data_interaction.anchor_extractor import extract_anchors


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

    def _parse_summary_dict(self, text: str) -> Optional[dict]:
        match = re.search(r"<JSON>(.*?)</JSON>", text, re.S)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                return None

        match = re.search(r"{.*}", text, re.S)
        if not match:
            return None
        try:
            return json.loads(match.group(0).strip())
        except json.JSONDecodeError:
            return None

    def _stringify_summary(self, summary: dict) -> str:
        lines: list[str] = []

        title = summary.get("title")
        if isinstance(title, str) and title.strip():
            lines.append(f"Title: {title.strip()}")

        goal = summary.get("goal")
        if isinstance(goal, str) and goal.strip():
            lines.append(f"Goal: {goal.strip()}")

        events = summary.get("events")
        if isinstance(events, list) and events:
            lines.append("Events:")
            for event in events:
                if isinstance(event, str) and event.strip():
                    lines.append(f"- {event.strip()}")

        anchors = summary.get("anchors")
        if isinstance(anchors, list) and anchors:
            lines.append("Anchors:")
            for anchor in anchors:
                if isinstance(anchor, str) and anchor.strip():
                    lines.append(f"- {anchor.strip()}")

        if not lines:
            return ""

        return "\n".join(lines)

    def summarize(self, session_id: str, window_size_tkns: int, given_text: str, custom_prompt: Optional[str] = None) -> str:
        prompt_text = given_text
        if custom_prompt:
            prompt_text = f"{custom_prompt}\n\n{given_text}"

        prompt = generate_summarize_context_window(
            window_size_tkns=window_size_tkns,
            given_text=prompt_text,
        )

        last_response = ""
        #retry until valid response or max retries hit
        for _ in range(MAX_SUMMARY_RETRIES):
            last_response = self._request_summary(prompt)
            Logger.info(f'Summarize response is valid json: {self._is_json_wrapped(last_response)}')

            if self._is_json_wrapped(last_response):
                break

        #parse the response into a dict
        summary_dict = self._parse_summary_dict(last_response)
        if summary_dict is None:
            return last_response

        #extract anchors from the text and add it to the dict
        anchors = extract_anchors(given_text)
        summary_dict["anchors"] = anchors
        return self._stringify_summary(summary_dict)

    def summarize_response(self, response: str) -> str:
        from backend.routes.chat.helpers.summarize_response import summarize_response

        summary_text = summarize_response(response)
        summary_dict = self._parse_summary_dict(summary_text)
        if summary_dict is None:
            return summary_text
        return self._stringify_summary(summary_dict)
