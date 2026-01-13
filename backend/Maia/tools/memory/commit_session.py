from backend.Maia.tools.memory.conversations import conversational_to_longterm
from backend.Maia.hood.context_engineering.settings import SHORT_TERM_conversations
from pathlib import Path


def commit_session( session_id: str, include_raw=True ):
    """
    Summarizes the short term conversation and saves it to long term summaries.\n
    Updates index with conversation.\n

    Include Raw = True:\n
    - Moves a conversation history json file from short term to long term memory.\n

    \n*only works on short term conversations.
    """

    # ----- paths -----
    CONVERSATIONAL = Path( SHORT_TERM_conversations )
    TARGET = CONVERSATIONAL / f"{session_id}.json"

    try:
        # ----- if file DNE, raise error -----
        if not TARGET.is_dir() and not TARGET.is_file():
            raise Exception( f"{session_id}.json not found in short term memory." )
        
        # ----- create summary for vector embedding -----
        

        # ----- if include raw true, save raw transcript to longterm memory -----
        if include_raw:
            if not conversational_to_longterm( session_id=session_id ):
                raise Exception( f"{session_id}.json unable to be saved to longterm memory." )
            
    except Exception as err:
        return