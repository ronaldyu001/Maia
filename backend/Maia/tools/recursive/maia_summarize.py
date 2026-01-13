from pathlib import Path
from backend.logging.LoggingWrapper import Logger
from math import floor
import re, json


from backend.Maia.hood.context_engineering.context_window.sections._task.variables import SUMMARIZE_CONVERSATION
from backend.Maia.hood.context_engineering.context_window.windows.summary_window import generate_summarize_context_window
from backend.Maia.hood.engine_wrappers.ollama.wrapper_ollama import OllamaModel
from backend.Maia.hood.context_engineering.helpers.transcript import create_transcript, autosize_transcript, trim_transcript
from backend.Maia.tools.memory.conversations import load_conversation


# helpers
def extract_summary(raw_output: str):
    try:
        match = re.search(r"<JSON>(.*?)</JSON>", raw_output, re.S)
        if not match: raise ValueError("No JSON block found")
        return json.loads(match.group(1).strip())
    except: return False


async def async_maia_summarize_conversation( llm: str, ctx_wdw_size: int, session_id: str, task=SUMMARIZE_CONVERSATION, memory_type=["short_term", "long_term"] ) -> str:
    """
    Returns
    - a json list with the summary.
    - false if unsuccessful.

    Args
    - llm: the llm name to use.
    - ctx_wdw_size: number of tokens in context window.
    - session_id: session id of conversation to summarize.
    - task: rules for how to summarize conversation. defaults to generic summary.
    - memory_type: specifies whether saving a short term or long term conversation.
    """

    Maia = OllamaModel()


    try:
        # ----- determine memory type and set target path -----
        if memory_type == "short_term": TARGET = Path( f"backend/memory/raw/short_term/conversations" ) / f"{session_id}.json"
        elif memory_type == "long_term": TARGET = Path( f"backend/memory/raw/long_term/conversations" ) / f"{session_id}.json"
        else: raise Exception( f"Invalid memory type given." )

        # ----- create transcript: str of conversation to summarize -----
        conversation_size = floor(ctx_wdw_size * 0.5)
        conversation = load_conversation(session_id=session_id)
        conversation = autosize_transcript(transcript=conversation, size=conversation_size, llm=llm)
        conversation_list_str = create_transcript(turns=conversation)        
        CONVERSATIONAL_TRANSCRIPT = trim_transcript(transcript=conversation_list_str, num_turns=len(conversation_list_str))
        
        # ----- create context window -----
        window = generate_summarize_context_window(
            llm=llm,
            size=ctx_wdw_size,
            session_id=session_id,
            TASK_FRAMING=SUMMARIZE_CONVERSATION,
            CONVERSATIONAL_TRANSCRIPT=CONVERSATIONAL_TRANSCRIPT,
            RULES_ratio=0.1,
            TASK_FRAMING_ratio=0.1,
            CONVERSATIONAL_TRANSCRIPT_ratio=0.5
        )

        # ----- get summary from Maia -----
        summary = extract_summary(raw_output=Maia.chat( prompt=window ))
        if not summary: raise Exception("Summary unable to be processed.")
        print(summary)
        return summary

    except Exception as err:
        Logger.error(repr(err))
        return {"response": f"{type(err).__name__}: {repr(err)}"}

