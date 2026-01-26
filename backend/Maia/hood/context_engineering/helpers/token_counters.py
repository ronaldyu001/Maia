from llama_cpp import Llama
from math import ceil
from backend.logging.LoggingWrapper import Logger
    

def generic_token_counter(text: str) -> int:
    """
    Retuns the amount of tokens in a text.\n
    Uses generic method ( ceil(text/4) ), not as accurate.
    """
    try:
        if text is None:
            return 0
        return ceil(len(str(text)) / 4)
    except Exception as err:
        Logger.error(f"[generic_token_counter] Failed to count tokens: {repr(err)}")
        return 0
