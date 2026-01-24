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
            Logger.info("[clear_embedding_history] File does not exist, nothing to clear")
            return

        LAST_EMBEDDED_PATH.write_text("[]", encoding="utf-8")
        Logger.info("[clear_embedding_history] Successfully cleared embedding history")

    except Exception as err:
        Logger.error(f"[clear_embedding_history] Failed to clear embedding history: {repr(err)}")


def embed_remainder_prev_conversation():
    """
    Embeds the remaining unembedded portion of the previous conversation.
    Retrieves the previous session id and uses LlamaIndex to embed any turns
    that haven't been embedded yet. Clears the embedding history after completion.
    """
    try:
        Logger.info("[embed_remainder_prev_conversation] Starting embedding of previous conversation remainder")

        # get previous session id
        prev_session_id = get_prev_session_id()
        if not prev_session_id:
            Logger.info("[embed_remainder_prev_conversation] No previous session id found, skipping")
            return

        # embed remaining conversation
        vector_store = LlamaIndex()
        vector_store.embed_remaining_conversation(session_id=prev_session_id)

        # clear embedding history for fresh start with new conversation
        clear_embedding_history()

        Logger.info("[embed_remainder_prev_conversation] Completed successfully")

    except Exception as err:
        Logger.error(f"[embed_remainder_prev_conversation] Failed: {repr(err)}")
