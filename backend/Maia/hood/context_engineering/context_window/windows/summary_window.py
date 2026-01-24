from math import ceil, floor
from backend.logging.LoggingWrapper import Logger

from backend.Maia.hood.context_engineering.context_window.windows.generate_custom_window import generate_custom_context_window
from backend.Maia.hood.context_engineering.context_window.sections._task._task import generate_task
from backend.Maia.hood.context_engineering.context_window.sections._task.variables import SUMMARIZE_CONVERSATION


def generate_summarize_context_window( 
    llm: str, 
    size: int, 
    session_id: str,
    # context
    RULES="",
    TOOL_CONTRACT="",
    TASK_FRAMING=SUMMARIZE_CONVERSATION,
    PINNED_FACTS="",
    GOALS="",
    LONGTERM_RECALL="",
    CONVERSATIONAL_TRANSCRIPT="",
    # percent of context window
    RULES_ratio=0,
    TOOL_CONTRACT_ratio=0.0,
    TASK_FRAMING_ratio=0.0,
    PINNED_FACTS_ratio=0.0,
    GOALS_ratio=0.0,
    LONGTERM_RECALL_ratio=0.0,
    CONVERSATIONAL_TRANSCRIPT_ratio=0.0
) -> list[dict] | bool:
    """
    Returns
    - context window as a list[dict]

    Arguments (bare minimum args to enter)
    - llm: the llm model to use
    - size: token size of window
    - session_id: id of conversation to summarize
    
    Default contracts available for if none specified
    - RULES
    - TOOL_CONTRACT
    - TASK_FRAMING
    - CONVERSATIONAL_TRANSCRIPT (based on given session id)\n

    Sections covered by RAG (only specify if necessary)
    - PINNED_FACTS
    - GOALS
    - LONGTERM_RECALL

    Default sizes if none specified
    - set to 0 for all context groups.
    - specify sizes of sections to include.

    This supports the following llms (must enter exactly as spelled in ""). \n
    - "maia-llama3"
    """

    Logger.info(f"[generate_summarize_context_window] Creating summarization window for session {session_id} (size: {size} tokens, llm: {llm})")
    args = locals()
    RATIOS = [ RULES_ratio, TOOL_CONTRACT_ratio, TASK_FRAMING_ratio, PINNED_FACTS_ratio, GOALS_ratio, LONGTERM_RECALL_ratio, CONVERSATIONAL_TRANSCRIPT_ratio ]

    try:
        # ----- Check ratio sum > 1. Get dict of args. Create window. -----
        ratio_sum = sum(RATIOS)
        if ratio_sum > 1:
            raise Exception(f"Sum of given ratios ({ratio_sum:.2f}) exceeds 1.0")

        active_sections = sum(1 for r in RATIOS if r > 0)
        Logger.info(f"[generate_summarize_context_window] {active_sections} active sections, ratio sum: {ratio_sum:.2f}")

        CONTEXT_WINDOW = generate_custom_context_window(**args)
        Logger.info(f"[generate_summarize_context_window] Successfully generated context window")

    except Exception as err:
        Logger.error(f"[generate_summarize_context_window] Failed to generate context window: {repr(err)}")
        return False

    return CONTEXT_WINDOW