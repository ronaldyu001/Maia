from pathlib import Path

from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.context_engineering.helpers.conversations import load_conversation
from backend.Maia.tools.utility._time import time_now


def add_turn( session_id: str, role: str, content: str,  ) -> list[dict]:
    """
    - Gets the conversation history from json based on session id.
    - Adds conversation turn to conversation history.
    - Does not update the json.
    """
    try:
        # ----- create conversation file if DNE -----
        CONVERSATION = Path( f"backend/Maia/memories/conversations" ) / f"{session_id}.json"
        CONVERSATION.touch( exist_ok=True )

        # ----- load conversation -----
        conversational_memory = load_conversation( session_id=session_id )

        # ----- returns conversation as json list -----
        turns = [ *conversational_memory, {
            "role": role,
            "time stamp": time_now(),
            "content": content
        }]

        content_preview = content[:50].replace('\n', ' ')
        Logger.info(f"[add_turn] Added {role} turn to session {session_id} ({len(turns)} total turns): \"{content_preview}{'...' if len(content) > 50 else ''}\"")
        return turns

    except Exception as err:
        Logger.error(f"[add_turn] Failed to add turn to session {session_id}: {repr(err)}")
        return [{}]
