from pathlib import Path

from Maia.tools.memory.conversations import load_conversation
from Maia.tools.utility._time import time_now


def add_turn( session_id: str, role: str, content: str,  ) -> list[dict]:
    """
    - Gets the conversation history from json based on session id.
    - Adds conversation turn to conversation history.
    - Does not update the json.
    """
    try:
        # ----- create conversation file if DNE -----
        CONVERSATION = Path( f"backend/memory/raw/short_term/conversations" ) / f"{session_id}.json"
        CONVERSATION.touch( exist_ok=True )

        # ----- load conversation -----
        conversational_memory = load_conversation( session_id=session_id )

        # ----- returns conversation as json list -----
        turns = [ *conversational_memory, {
            "role": role,
            "time stamp": time_now(),
            "content": content
        }]
        return turns

    except Exception as err:
        return [{}]
