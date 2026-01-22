from pathlib import Path
from llama_index.core import StorageContext, VectorStoreIndex, load_index_from_storage
from llama_index.core.vector_stores.simple import SimpleVectorStore
from backend.logging.LoggingWrapper import Logger


def get_memories_index() -> VectorStoreIndex:
    """
    getter for Maia's memories vector store index.
    """

    #memories vector store persist path, creates path if DNE
    persist_dir = Path("backend/Maia/memories/vector_stores/memories")
    persist_dir.mkdir(parents=True, exist_ok=True)


    #manually check for vector stores. load if exists.
    Logger.info("Checking for existing 'memories' stores.")
    if any(persist_dir.iterdir()):
        Logger.info("Existing 'memories' stores found. Loading.")

        #load storage context
        storage_context = StorageContext.from_defaults(
            persist_dir=str(persist_dir)
        )

        #load vector store index
        memories_index = load_index_from_storage(
            storage_context=storage_context
        )


    #create vector store if DNE and persist
    else:
        Logger.info("No 'memories' stores found. Creating.")

        #create storage context
        storage_context = StorageContext.from_defaults(
            vector_store=SimpleVectorStore(),
        )

        #create vector store index
        memories_index = VectorStoreIndex(
            nodes=[],
            storage_context=storage_context
        )

        #persist vector store
        memories_index.storage_context.persist(persist_dir=persist_dir)


    #return the vector store
    Logger.info("Returning 'memories' index.")
    return memories_index