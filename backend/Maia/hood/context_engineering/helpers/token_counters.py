from llama_cpp import Llama
from math import ceil
from Maia.hood.llm_managers.maia_llama3 import Maia_llama3_Manager
    

def generic_token_counter( text: str ) -> int:
    """
    Retuns the amount of tokens in a text.\n
    Uses generic method ( ceil(text/4) ), not as accurate.
    """
    return ceil( len(text)/4 )


def maia_llama3_token_counter( text: str ) -> int:
    """
    Returns the amount of tokens in a text, specifically for maia-llama3.
    """
    # gets list of tokens generated from text input
    llm = Maia_llama3_Manager.get_llm( window_size=4096 )
    tokens = llm.tokenize( text=text.encode("utf-8") )

    return len(tokens)


def token_counter( llm: str, text: str ) -> int:
    """
    This supports the following llms (must enter exactly as spelled in ""). \n
    - "maia-llama3"

    If the llm is not recognized, uses fallback method (generic).
    """
    SUPPORTED_LLMS = {
            "maia-llama3": maia_llama3_token_counter
        }
    
    try:
        return SUPPORTED_LLMS[ llm ]( text=text )
    except Exception as err:
        return generic_token_counter( text=text )

    