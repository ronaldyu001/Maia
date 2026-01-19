from backend.Maia.hood.context_engineering.helpers.conversations import load_conversation, 
from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from llama_index.core import VectorStoreIndex


def store_raw_conversation(session_id: str, index: VectorStoreIndex, persist_dir: str):
    vector_store = LlamaIndex()

    #load conversation based on session id
    try:
        Logger.info(f"Loading {session_id} conversation.")
        load_conversation(session_id=session_id)


    except Exception as err:
        Logger.error(repr(err))
        raise repr(err)

    #embed conversation to raw_conversations vector store
    LlamaIndex.embed(
        
    )