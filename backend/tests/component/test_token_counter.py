import pytest
from llama_cpp import Llama
from typing import Tuple
from Maia.hood.context_engineering.helpers.token_counters import (
    maia_llama3_token_counter,
    token_counter
)


def test_token_counter():
    try:
        sample_text = "Hello Maia, how are you today? This one should be > 10"

        token_count = token_counter( llm="maia-llama3", text=sample_text )
        print( f"Token count: {token_count}" )
        return

    except Exception as err:
        print( err )
        pytest.fail( f"{type(err).__name__}: {err}" )

