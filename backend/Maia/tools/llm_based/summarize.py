from backend.logging.LoggingWrapper import Logger
from math import floor
import re, json

from backend.Maia.hood.models.ollama.summarizer import Summarizer
from backend.Maia.hood.context_engineering.helpers.transcript import create_transcript, autosize_transcript, trim_transcript
from backend.Maia.hood.context_engineering.helpers.conversations import load_conversation
from backend.Maia.config import llms


def extract_summary(raw_output: str):
    try:
        match = re.search(r"<JSON>(.*?)</JSON>", raw_output, re.S)
        if not match: raise ValueError("No JSON block found")
        return json.loads(match.group(1).strip())
    except: return False


def summarize_conversation(session_id: str, llm=llms[2], ctx_wdw_size=4086) -> str:
    """
    Returns
    - a json list with the summary.
    - false if unsuccessful.

    Args
    - llm: the llm name to use.
    - ctx_wdw_size: number of tokens in context window.
    - session_id: session id of conversation to summarize.
    - memory_type: specifies whether saving a short term or long term conversation.
    """

    summarizer = Summarizer()


    try:
        # ----- create transcript: str of conversation to summarize -----
        conversation_size = floor(ctx_wdw_size * 0.5)
        conversation = load_conversation(session_id=session_id)
        conversation = autosize_transcript(transcript=conversation, size=conversation_size, llm=llm)
        conversation_list_str = create_transcript(turns=conversation)        
        CONVERSATIONAL_TRANSCRIPT = trim_transcript(transcript=conversation_list_str, num_turns=len(conversation_list_str))
        
        # ----- get summary from Maia -----
        summary = extract_summary(
            raw_output=summarizer.summarize(
                session_id=session_id,
                window_size_tkns=ctx_wdw_size,
                given_text=CONVERSATIONAL_TRANSCRIPT,
            )
        )

        if not summary: 
            raise Exception("Summary unable to be processed.")
        
        Logger.info(f"Conversation {session_id} summarized, returning summary.")
        return summary

    except Exception as err:
        Logger.error(repr(err))
        return {"response": f"{type(err).__name__}: {repr(err)}"}
