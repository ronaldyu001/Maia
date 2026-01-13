from abc import ABC, abstractmethod
from typing import List

class BaseModel(ABC):
    @abstractmethod
    def chat(self, prompt: str, history: List[str] = []) -> str:
        """
        Accepts a user prompt (and optional history),
        returns a string response from the model.
        """
        pass
