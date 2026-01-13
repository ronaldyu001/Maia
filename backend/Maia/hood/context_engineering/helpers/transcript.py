from backend.logs.LoggingWrapper import Logger

from backend.Maia.hood.context_engineering.helpers.token_counters import token_counter
from math import ceil, floor


def create_transcript(turns: list[dict]) -> list[str]:
    """
    Converts transcript from a list of dicts into a list of strings.
    """
    Logger.info("Converting transcript from list[dict] to list[str]")
    try:
        return [ f"{t['role'].capitalize()}: {t['content']}" for t in turns ]
    except Exception as err:
        return False


def trim_transcript( transcript: list[str], num_turns: int, stringify: bool = True ) -> str:
    """
    Shortens transcript (list of strings) to desired num_turns and returns as string.\n
    Prioritizes recency.

    Args
    - stringify: bool # stringifies list if True
    """
    Logger.info("Trimming transcript.")
    if stringify: num_turns = len(transcript)
    start_index = len(transcript) - num_turns
    return "\n".join( transcript[ start_index: ] )


def autosize_transcript( transcript: list[dict], size: int, llm: str ) -> list[dict]:
    """
    Automatically resizes a transcript to the desired token count for a desired llm.
    """
    Logger.info("Autosizing transcript.")
    # ----- token size bounds, num_turns -----
    num_turns = len(transcript)
    max_turns = num_turns
    min_turns = 1

    # ----- stringify transcript -----
    ready_transcript = transcript
    temp_transcript = create_transcript( turns=transcript )
    ready_transcript_str = trim_transcript( transcript=temp_transcript, num_turns=num_turns )
    
    # ----- current token count -----
    token_count = token_counter( llm=llm, text=ready_transcript_str  )

    # ----- if transcript is smaller than window, return -----
    if token_count <= size:
        return ready_transcript

    # ----- if transcript is larger than window, binary search -----
    start_index = 0
    while token_count > size:
        start_index += 1
        ready_transcript = transcript[ start_index: ]
        temp_transcript = create_transcript( ready_transcript )
        ready_transcript_str = trim_transcript( transcript=temp_transcript, num_turns=len(ready_transcript) )
        token_count = token_counter( llm=llm, text=ready_transcript_str )

    return ready_transcript