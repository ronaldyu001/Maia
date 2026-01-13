from math import ceil, floor
from logging.LoggingWrapper import Logger

from Maia.hood.context_engineering.context_window.sections._rules._rules import generate_rules
from Maia.hood.context_engineering.context_window.sections._tool_contract._tool_contract import generate_tool_contract
from Maia.hood.context_engineering.context_window.sections._conversation_history._conversation import generate_conversational_transcript
from Maia.hood.context_engineering.context_window.sections._task._task import generate_task


def generate_custom_context_window( 
    llm: str, 
    size: int, 
    session_id: str,
    # context
    RULES="",
    TOOL_CONTRACT="",
    TASK_FRAMING="",
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
    
    Default content available if none specified
    - RULES
    - TOOL_CONTRACT
    - CONVERSATIONAL_TRANSCRIPT (based on given session id)

    Sections covered by RAG (only give if necessary)
    - PINNED_FACTS
    - GOALS
    - LONGTERM_RECALL

    Empty if not given
    - TASK_FRAMING

    Default sizes if none specified
    - set to 0 for all context groups.
    - specify sizes of sections to include.

    This supports the following llms (must enter exactly as spelled in ""). \n
    - "maia-llama3"
    """
    Logger.info("Generating custom context window.")

    CONTENT = [ "RULES", "TOOL_CONTRACT", "TASK_FRAMING", "PINNED_FACTS", "GOALS", "LONGTERM_RECALL", "CONVERSATIONAL_HISTORY" ]
    RATIOS = [ RULES_ratio, TOOL_CONTRACT_ratio, TASK_FRAMING_ratio, PINNED_FACTS_ratio, GOALS_ratio, LONGTERM_RECALL_ratio, CONVERSATIONAL_TRANSCRIPT_ratio ]
    
    try:
        # ----- make sure ratios add to 1 -----
        if not sum( RATIOS ) <= 1:
            raise Exception( f"Sum of given ratios can't exceed 1." )

        # ----- calculate size of each section of context window -----
        CONTEXT_WINDOW_tkns = ceil( size * 0.7 ) # leave 30% of window for Maia's reply
        CONTENT_tkns = {}
        for entry, ratio in zip( CONTENT, RATIOS ):
            CONTENT_tkns[ entry ] = floor( CONTEXT_WINDOW_tkns * ratio )

        # ----- generate content -----
        RULES = generate_rules( llm=llm, size=CONTENT_tkns["RULES"], session_id=session_id )
        TOOL_CONTRACT = generate_tool_contract( llm=llm, size=CONTENT_tkns["TOOL_CONTRACT"] )
        TASK = generate_task( llm=llm, size=CONTENT_tkns["TASK_FRAMING"], task=TASK_FRAMING )
        
        # generate conversational history iff none given, else inject as system prompt
        if not CONVERSATIONAL_TRANSCRIPT: 
            CONVERSATIONAL_TRANSCRIPT = generate_conversational_transcript( llm=llm, session_id=session_id, size=CONTENT_tkns["CONVERSATIONAL_HISTORY"] )
        else: 
            CONVERSATIONAL_TRANSCRIPT = [{"role": "system", "content": CONVERSATIONAL_TRANSCRIPT}]
        

        # ----- Context Window -----
        CONTENT = [ RULES, TOOL_CONTRACT, TASK, PINNED_FACTS, GOALS, LONGTERM_RECALL, CONVERSATIONAL_TRANSCRIPT ]
        CONTEXT_WINDOW = []
        for section in CONTENT:
            if isinstance( section, list ):
                CONTEXT_WINDOW += section

        print( CONTEXT_WINDOW )

        # ----- Summary -----
        print( f"Sizes:" )
        print( f"\nRules: ~{ceil(len(str(RULES))/4)} tokens\n" )
        print( f"Tool Contract: ~{ceil(len(str(TOOL_CONTRACT))/4)} tokens\n" )
        print( f"Conversational Transcript: ~{ceil(len(str(CONVERSATIONAL_TRANSCRIPT))/4)} tokens\n" )

    except Exception as err:
        Logger.error(repr(err))
        return False

    return CONTEXT_WINDOW