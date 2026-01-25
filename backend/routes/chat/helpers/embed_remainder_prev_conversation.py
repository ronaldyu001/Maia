from pathlib import Path

from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from backend.routes.chat.helpers.get_prev_session_id import get_prev_session_id


LAST_EMBEDDED_PATH = Path("backend/Maia/memories/conversations/last_embedded.json")


def clear_embedding_history():
    """
    Clears the contents of the last_embedded.json file.
    Handles the case where the file does not exist gracefully.
    """
    try:
        if not LAST_EMBEDDED_PATH.exists():
            return

        LAST_EMBEDDED_PATH.write_text("[]", encoding="utf-8")
        Logger.info("Cleared embedding history")

    except Exception as err:
        Logger.error(f"Failed to clear embedding history: {repr(err)}")


def embed_remainder_prev_conversation():
    """
    Embeds the remaining unembedded portion of the previous conversation.
    Retrieves the previous session id and uses LlamaIndex to embed any turns
    that haven't been embedded yet. Clears the embedding history after completion.
    """
    try:
        # get previous session id
        prev_session_id = get_prev_session_id()
        if not prev_session_id:
            return

        # embed remaining conversation
        Logger.info(f"Embedding remainder of previous session: {prev_session_id}")
        vector_store = LlamaIndex()
        vector_store.embed_remaining_conversation(session_id=prev_session_id)

        # clear embedding history for fresh start with new conversation
        clear_embedding_history()
        Logger.info("Previous conversation embedding complete")

    except Exception as err:
        Logger.error(f"Failed to embed previous conversation remainder: {repr(err)}")
