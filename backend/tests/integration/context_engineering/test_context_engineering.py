import pytest
from Maia.hood.context_engineering.context_window.windows.generate_generic_window import generate_context_window

def test_context_engineering():
    """
    Test context window generation with valid parameters
    """
    try:
        # test with reasonable context size
        context_size = 8000
        context = generate_context_window(llm="maia-llama3", size=context_size, session_id="1ef6eec9-87aa-4591-9bc8-11df4108cd13")
        
        # assertions
        assert context is not None
        assert isinstance(context, list)
        assert len(context) > 0
        
    except Exception as err:
        pytest.fail(f"Context generation failed: {type(err).__name__}: {err}")
