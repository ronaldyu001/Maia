import os
from backend.logging.LoggingWrapper import Logger

prev_session_id_path = "backend/Maia/memories/conversations/prev_session_id.txt"

def get_prev_session_id() -> str | None:
    """
    Reads and returns the previous session id from file.

    :return: The previous session id, or None if file does not exist.
    :rtype: str | None
    """
    if not os.path.exists(prev_session_id_path):
        Logger.info("No previous session id file found")
        return None

    try:
        with open(prev_session_id_path, "r") as f:
            session_id = f.read().strip()
        Logger.info(f"Retrieved previous session id: {session_id}")
        return session_id
    except Exception as e:
        Logger.error(f"Failed to read previous session id: {repr(e)}")
        return None
