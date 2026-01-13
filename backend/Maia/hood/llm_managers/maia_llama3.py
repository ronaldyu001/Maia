from llama_cpp import Llama
from typing import Optional
from backend.Maia.config import MAIA_LLAMA3_V1

class Maia_llama3_Manager:
    _instance: Optional[Llama] = None  # Class variable to store single instance
    
    @classmethod
    def get_llm(cls) -> Llama:
        """
        Returns singleton instance of LLM.
        Creates instance if it doesn't exist.
        """
        if cls._instance is None:
            print("Creating new LLM instance...")
            cls._instance = Llama(
                model_path=MAIA_LLAMA3_V1,
                n_ctx=8192
            )
        return cls._instance
    