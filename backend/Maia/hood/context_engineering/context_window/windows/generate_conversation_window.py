from backend.Maia.hood.context_engineering.context_window.windows.generate_window import build_context_window

from backend.Maia.hood.context_engineering.context_window.sections.system_prompt import get_system_prompt
from backend.Maia.hood.context_engineering.context_window.sections.task import get_task
from backend.Maia.hood.context_engineering.context_window.sections.current_conversation import get_current_conversation
from backend.Maia.hood.context_engineering.context_window.sections.tool_contract import get_tool_contract
from backend.Maia.hood.context_engineering.context_window.sections.RAG import get_RAG

from math import floor
from typing import List


section_ratios = {
    "SYSTEM_PROMPT": 0.15,
    "TASK": 0.05,
    "TOOL_CONTRACT": 0.10,
    "RAG": 0.4,
    "CURRENT_CONVERSATION": 0.30,
}


CURRENT_CONVERSATION_INTRO = """
The section below the bullet points contains the current conversation.

- Use this to continue the conversation naturally.
- Prioritize this context over retrieved material (RAG) if there is any conflict.
- Use it to maintain continuity, assumptions, and constraints.
"""


def generate_conversation_window(session_id: str, window_size_tkns: int, current_conversation: List[dict] ):

    #generate sections for context window
    SYSTEM_PROMPT = get_system_prompt()
    TASK = get_task()
    TOOL_CONTRACT = get_tool_contract()
    RAG = get_RAG(
        session_id=session_id
    )
    CURRENT_CONVERSATION = get_current_conversation(
        current_conversation=current_conversation,
        session_id=session_id,
        size=floor(window_size_tkns * section_ratios["CURRENT_CONVERSATION"]),
    )
    CURRENT_CONVERSATION_FULL = CURRENT_CONVERSATION_INTRO + CURRENT_CONVERSATION

    #create sections dict
    section_names = list(section_ratios.keys())
    section_content = [SYSTEM_PROMPT, TASK, TOOL_CONTRACT, RAG, CURRENT_CONVERSATION_FULL]
    sections = [(str(k), str(v)) for k, v in zip(section_names, section_content)]

    #build context window
    context_window = build_context_window(
        sections=sections,
        ratios=section_ratios,
        max_tokens=window_size_tkns
    )

    return context_window
