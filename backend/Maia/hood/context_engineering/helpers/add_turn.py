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
        # ----- ensure directory and file exist -----
        conversations_dir = Path("backend/Maia/memories/conversations")
        conversations_dir.mkdir(parents=True, exist_ok=True)

        conversation_file = conversations_dir / f"{session_id}.json"

        # ----- initialize with empty array if file DNE or is empty -----
        if not conversation_file.exists() or conversation_file.stat().st_size == 0:
            conversation_file.write_text("[]", encoding="utf-8")
            Logger.info(f"[add_turn] Created new conversation file for session {session_id}")
            conversational_memory = []
        else:
            # ----- load existing conversation -----
            conversational_memory = load_conversation(session_id=session_id)
            if not isinstance(conversational_memory, list):
                conversational_memory = []

        # ----- returns conversation as json list -----
        turns = [*conversational_memory, {
            "role": role,
            "timestamp": time_now(),
            "content": content
        }]

        content_preview = content[:50].replace('\n', ' ')
        Logger.info(f"[add_turn] Added {role} turn to session {session_id} ({len(turns)} total turns): \"{content_preview}{'...' if len(content) > 50 else ''}\"")
        return turns

    except Exception as err:
        Logger.error(f"[add_turn] Failed to add turn to session {session_id}: {repr(err)}")
        return [{}]
