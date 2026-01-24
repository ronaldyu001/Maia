from llama_cpp import Llama
from math import ceil
    

def generic_token_counter( text: str ) -> int:
    """
    Retuns the amount of tokens in a text.\n
    Uses generic method ( ceil(text/4) ), not as accurate.
    """
    return ceil( len(text)/4 )
