import pytest

from Maia.hood.context_engineering.context_window.generate_custom_window import generate_custom_context_window
from backend.Maia.hood.context_engineering.settings import RULES, TOOL_CONTRACT
from Maia.hood.context_engineering.context_window.sections._conversation_history._conversation import generate_conversational_transcript


def test_custom_window():
    try:
        llm = "maia-llama3"
        session_id = "1ef6eec9-87aa-4591-9bc8-11df4108cd13"
        tkns = 8192
        CONVERSATIONAL_TRANSCRIPT_ratio = 0.4

        generate_custom_context_window(
            llm=llm,
            size=tkns,
            session_id=session_id,

            RULES=RULES,
            TOOL_CONTRACT=TOOL_CONTRACT,
            TASK_FRAMING="",
            PINNED_FACTS="",
            GOALS="",
            LONGTERM_RECALL="",
            CONVERSATIONAL_TRANSCRIPT="",
            RULES_ratio=0.1,
            TOOL_CONTRACT_ratio=0.1,
            TASK_FRAMING_ratio=0,
            PINNED_FACTS_ratio=0,
            GOALS_ratio=0,
            LONGTERM_RECALL_ratio=0,
            CONVERSATIONAL_TRANSCRIPT_ratio=CONVERSATIONAL_TRANSCRIPT_ratio
        )
        
    except Exception as err:
        pytest.fail( reason=err )