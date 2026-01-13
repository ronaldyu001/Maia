from math import floor, ceil
from logging.LoggingWrapper import Logger

from Maia.hood.context_engineering.helpers.token_counters import token_counter
from Maia.hood.context_engineering.helpers.generic_trimmer import generic_trimmer
from Maia.hood.context_engineering.context_window.sections._task.variables import DEFAULT_CHAT


def generate_task( llm: str, size: int, task=DEFAULT_CHAT ) -> list[dict]:
    """
    Returns given task prompt, trimming if needed.\n
    Args
    - llm: choose a supported llm from below
    - size: number of tokens
    - task: inject a custom task prompt, otherwise defaults to chat task

    Supported llms
    - maia-llama3
    """
    # ----- if rules is within token allotment, return rules -----
    if token_counter( llm=llm ,text=task ) <= size:
        return [{ "role":"system", "content":task }]
    
    # ----- if rules too big, trim down to desired size and return -----
    else:
        TRIMMED_RULES, error = generic_trimmer( text=task, llm=llm, desired_tokens=size )
        return [{ "role":"system", "content":TRIMMED_RULES }]