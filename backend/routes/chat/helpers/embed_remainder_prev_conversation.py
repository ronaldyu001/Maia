from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from backend.routes.chat.helpers.get_prev_session_id import get_prev_session_id


def embed_remainder_prev_conversation():
    """
    Embeds the remaining unembedded portion of the previous conversation.
    Retrieves the previous session id and uses LlamaIndex to embed any turns
    that haven't been embedded yet.
    """
    try:
        Logger.info("Starting embed_remainder_prev_conversation.")

        # get previous session id
        prev_session_id = get_prev_session_id()
        if not prev_session_id:
            Logger.info("No previous session id found. Skipping embedding.")
            return

        # embed remaining conversation
        vector_store = LlamaIndex()
        vector_store.embed_remaining_conversation(session_id=prev_session_id)

        Logger.info("Finished embed_remainder_prev_conversation.")

    except Exception as err:
        Logger.error(f"Failed to embed remainder of previous conversation: {repr(err)}")
