from backend.Maia.hood.context_engineering.helpers.conversations import load_conversation
from backend.Maia.hood.context_engineering.helpers.transcript import create_transcript_with_timestamps, trim_transcript
from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from llama_index.core import VectorStoreIndex


def store_raw_conversation(session_id: str, index: VectorStoreIndex, persist_dir: str):
    vector_store = LlamaIndex()

    #load conversation based on session id
    try:
        Logger.info(f"Loading conversation: {session_id}")
        turns = load_conversation(session_id=session_id)
        transcript = create_transcript_with_timestamps(turns=turns)
        stringified_transcript = trim_transcript(transcript=transcript, stringify_entire_transcript=True)

    except Exception as err:
        Logger.error(repr(err))
        raise repr(err)
    

    #create metadata
    try:
        Logger.info("Creating conversation metadata.")
        metadata = {
            "session_id": session_id,
            "project": "conversation"
        }

    except Exception as err:
        Logger.error(repr(err))


    #embed conversation to raw_conversations vector store
    try:
        Logger.info("Embedding conversation.")
        LlamaIndex.embed(
            text=stringified_transcript,
            metadata=metadata,
            index=index,
            persist_dir=persist_dir
        )
        Logger.info("Conversation embedded.")

    except Exception as err:
        Logger.error(repr(err))