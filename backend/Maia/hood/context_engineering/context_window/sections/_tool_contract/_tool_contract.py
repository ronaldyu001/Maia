from logging.LoggingWrapper import Logger

from Maia.hood.context_engineering.settings import TOOL_CONTRACT
from Maia.hood.context_engineering.helpers.token_counters import token_counter
from Maia.hood.context_engineering.helpers.generic_trimmer import generic_trimmer


def generate_tool_contract( llm: str, size: int, contract=TOOL_CONTRACT ) -> list[dict] | None:
    """
    """
    Logger.info("Generating tool contract.")
    try:
        # ----- if rules is within token allotment, return rules -----
        if token_counter( llm=llm ,text=TOOL_CONTRACT ) <= size:
            return [{ "role":"system", "content":TOOL_CONTRACT }]
        
        # ----- if rules too big, trim down to desired size and return -----
        else:
            TRIMMED_TOOL_CONTRACT, error = generic_trimmer( text=TOOL_CONTRACT, llm=llm, desired_tokens=size )
            return [{ "role":"system", "content":TRIMMED_TOOL_CONTRACT }]
        
    except Exception as err:
        return None
