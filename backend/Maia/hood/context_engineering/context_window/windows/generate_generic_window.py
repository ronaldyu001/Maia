from math import ceil
from backend.logs.LoggingWrapper import Logger

from backend.Maia.hood.context_engineering.helpers.token_counters import token_counter
from backend.Maia.hood.context_engineering.context_window.sections._rules._rules import generate_rules
from backend.Maia.hood.context_engineering.context_window.sections._tool_contract._tool_contract import generate_tool_contract
from backend.Maia.hood.context_engineering.context_window.sections._conversation_history._conversation import generate_conversational_transcript
from backend.Maia.hood.context_engineering.context_window.sections._task._task import generate_task

def generate_context_window( llm: str, size: int, session_id: str ) -> list[dict]:
    """
    Generates the context window for Maia.\n
    This supports the following llms (must enter exactly as spelled in ""). \n
    - "maia-llama3"
    """
    # ----- calculate size of each section of context window -----
    size_TOTAL = ceil( size * 0.7 ) # leave 30% of window for Maia's reply
    size_RULES = ceil( size_TOTAL * 0.075 )
    size_TOOL_CONTRACT = ceil( size_TOTAL * 0.1 )
    size_TASK_FRAMING = ceil( size_TOTAL * 0.1 )
    size_PINNED_FACTS = ceil( size_TOTAL * 0.075 )
    size_LONGTERM_RECALL = ceil( size_TOTAL * 0.25 )
    size_CONVERSATIONAL_TRANSCRIPT = ceil( size_TOTAL * 0.4 )

    # ----- generate non-RAG components for context window -----
    RULES = generate_rules( llm=llm, size=size_RULES, session_id=session_id )
    TOOL_CONTRACT = generate_tool_contract( llm=llm, size=size_TOOL_CONTRACT )
    TASK = generate_task( llm=llm, size=size_TASK_FRAMING )
    CONVERSATIONAL_HISTORY = generate_conversational_transcript( llm=llm, session_id=session_id, size=size_CONVERSATIONAL_TRANSCRIPT )

    # ----- generata RAG components for context window -----
    # This should never fail. If fails, make sure chat route is saving conversations properly.
    try: query = CONVERSATIONAL_HISTORY[-1]["content"]
    except Exception as err: Logger.info(repr(err))

    # ----- Context Window -----
    CONTENT = [ RULES, TOOL_CONTRACT, TASK, CONVERSATIONAL_HISTORY ]
    CONTEXT_WINDOW = []
    for section in CONTENT:
        if isinstance( section, list ): CONTEXT_WINDOW += section

    print( CONTEXT_WINDOW )

    # ----- Summary -----
    print( f"Sizes:\n" )
    print( f"Rules: ~{ceil(len(str(RULES))/4)} tokens\n" )
    print( f"Tool Contract: ~{ceil(len(str(TOOL_CONTRACT))/4)} tokens\n" )
    print( f"Conversational Transcript: ~{ceil(len(str(CONVERSATIONAL_HISTORY))/4)} tokens\n" )

    return CONTEXT_WINDOW