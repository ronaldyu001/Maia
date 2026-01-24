import os
from backend.logging.LoggingWrapper import Logger

prev_session_id_path = "backend/Maia/memories/conversations/prev_session_id.txt"

def set_prev_session_id(current_session_id: str):
    """
    Sets the prev session id to the current session id.

    :param current_session_id: The current session id.
    :type current_session_id: str
    """
    try:
        os.makedirs(os.path.dirname(prev_session_id_path), exist_ok=True)
        with open(prev_session_id_path, "w") as f:
            f.write(current_session_id)
        Logger.info(f"Successfully saved session id: {current_session_id}")
    except Exception as e:
        Logger.error(f"Failed to save session id: {e}")
