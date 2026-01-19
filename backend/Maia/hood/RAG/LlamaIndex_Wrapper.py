from llama_index.core import VectorStoreIndex, Document, Settings, StorageContext
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.core.vector_stores.simple import SimpleVectorStore
from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.get_vector_store_indices.get_memories_index import get_memories_index
from backend.Maia.hood.RAG.get_vector_store_indices.get_raw_conversations_index import get_raw_conversations_index
from backend.Maia.hood.RAG.store_to_vector_store_indices.store_raw_conversation import store_raw_conversation


class LlamaIndex:
    """
    A wrapper class for LlamaIndex.

    PURPOSE:
    This class initialize a vectore store object from Maia's vector store, and abstracts necessary functions
    to dynamically maintain it.

    VECTOR STORE INDEXES:
    memory: This is where high level memories belong, such as summarized events, conversations, topics, projects, etc.
            This should be the first index hit for RAG. 
    """


    def __init__(self):
        #index paths
        self.memories_index_path = "backend/Maia/memories/vector_stores/memories"

        #initialize LlamaIndex settings object
        self.settings = Settings

        #set embedder in settings
        Logger.info("Setting embed model for LlamaIndex in settings.")
        self.settings.embed_model = OllamaEmbedding(
            model_name="nomic-embed-text",
            base_url="http://localhost:11434"
        )

        #intialize/load vector stores
        Logger.info("initializing/Loading 'raw_converations' index.")
        self.raw_conversations_index = get_raw_conversations_index()

        Logger.info("Initializing/Loading 'memories' index.")
        self.memories_index = get_memories_index()
        


    def embed(self, text: str, metadata: dict):
        #create document from text and metadata
        document = Document(text=text, extra_info=metadata)

        #insert document into vector store
        self.memories_index.insert(document)

        #persist
        self.memories_index.storage_context.persist(
            persist_dir=self.memories_index_path
        )


    def embed_raw_conversation(self, session_id: str):
        store_raw_conversation(session_id=session_id)