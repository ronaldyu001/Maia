from backend.Maia.hood.flavors.base import BaseModel
from typing import List
import requests
import asyncio

from backend.Maia.config import (
    OLLAMA_HOST,
    OLLAMA_MODEL_NAME
)


class OllamaModel( BaseModel ):
    """
    Purpose:
    - Wraps Ollama Engine to access its endpoints (Singleton).

    Arguments:
    - model_name = OLLAMA_MODEL_NAME from config.py
    - host = Ollama's default port
    """

    #singleton instance
    _instance = None

    def __new__(cls, model_name=OLLAMA_MODEL_NAME, host=OLLAMA_HOST):
        #create instance if it doesn't exist, otherwise return existing instance
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__( self, model_name=OLLAMA_MODEL_NAME, host=OLLAMA_HOST ):
        """
        Constructor
        - Sets model_name.
        - Sets api_url based on host. Default host is "http://localhost:11434".
        """

        #skip initialization if already initialized
        if self._initialized:
            return
        self._initialized = True

        self.model_name = model_name
        self.api_url = f"{host}/api/chat"


    def chat( self, prompt: list[dict] ) -> str:
        """
        Input:
        - prompt: Either a string or list of message dictionaries
        
        Returns:
        - string response from model
        
        Format for messages:
        [
            {"role": "system", "content": "system message"},
            {"role": "user", "content": "user message"}
        ]
        """

        # Convert string prompt to proper message format if string, else presreve original
        messages = [{"role": "user", "content": prompt}] if isinstance(prompt, str) else prompt

        try:
            # Call Ollama's API
            response = requests.post(
                url=self.api_url,
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "stream": False
                }
            )
            
            # Raise exception for 4xx and 5xx errors
            response.raise_for_status()
            
            # Extract response from JSON
            return response.json()["message"]["content"]
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama API error: {str(e)}")
        except (KeyError, TypeError) as e:
            raise Exception(f"Invalid response format: {str(e)}")
        

    async def async_chat( self, prompt: list[dict] ) -> str:
        """
        Input:
        - prompt: Either a string or list of message dictionaries
        
        Returns:
        - string response from model
        
        Format for messages:
        [
            {"role": "system", "content": "system message"},
            {"role": "user", "content": "user message"}
        ]
        """

        # Convert string prompt to proper message format
        if isinstance(prompt, str):
            messages = [{"role": "user", "content": prompt}]
        else:
            messages = prompt
        try:
            # Call Ollama's API
            response = requests.post(
                url=self.api_url,
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "stream": False
                }
            )
            
            # Raise exception for 4xx and 5xx errors
            response.raise_for_status()
            
            # Extract response from JSON
            return response.json()["message"]["content"]
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama API error: {str(e)}")
        except (KeyError, TypeError) as e:
            raise Exception(f"Invalid response format: {str(e)}")