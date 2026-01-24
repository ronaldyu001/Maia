from pathlib import Path
import json

from llama_index.core import VectorStoreIndex, Document, Settings
from llama_index.embeddings.ollama import OllamaEmbedding
from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.get_vector_store_indices.get_memories_index import get_memories_index
from backend.Maia.hood.RAG.get_vector_store_indices.get_raw_conversations_index import get_raw_conversations_index
from backend.Maia.hood.context_engineering.helpers.conversations import load_conversation
from backend.Maia.hood.context_engineering.helpers.transcript import create_transcript_with_timestamps, trim_transcript
from backend.Maia.tools.memory.storage import load_json


class LlamaIndex:
    """
    A wrapper class for LlamaIndex (Singleton).

    PURPOSE:
    This class initialize a vectore store object from Maia's vector store, and abstracts necessary functions
    to dynamically maintain it.

    VECTOR STORE INDEXES:
    memory: This is where high level memories belong, such as summarized events, conversations, topics, projects, etc.
            This should be the first index hit for RAG.
    """

    #singleton instance
    _instance = None

    def __new__(cls):
        #create instance if it doesn't exist, otherwise return existing instance
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        #skip initialization if already initialized
        if self._initialized:
            return
        self._initialized = True

        #index paths
        self.memories_index_path = "backend/Maia/memories/vector_stores/memories"
        self.raw_conversations_index_path = "backend/Maia/memories/vector_stores/raw_conversations"

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
        


    def embed(self, text: str, metadata: dict, index: VectorStoreIndex, persist_dir: str):
        """
        Low level embedding function. Don't use directly unless necessary.
        
        :param text: Data being stored.
        :type text: str
        :param metadata: Metadata for the data being stored.
        :type metadata: dict
        :param index: Use this class object's own index. e.g.(Maia.memories_index)
        :type index: VectorStoreIndex
        :param persist_dir: The path to persist the index.
        :type persist_dir: str
        """
        #create document from text and metadata
        document = Document(text=text, extra_info=metadata)

        #insert document into vector store
        try: 
            Logger.info("Inserting document to index.")
            index.insert(document)
        except Exception as err:
            Logger.error(repr(err))

        #persist
        Logger.info("Persisting index.")
        index.storage_context.persist(
            persist_dir=persist_dir
        )


    def embed_remaining_conversation(self, session_id: str):
        """
        Embeds the unembedded portion of a conversation.
        Only works if the target conversation has just been rendered old due to a new conversation.
        Pulls the embedding history to embed the remaining conversation.

        :param session_id: the session id to embed
        :type session_id: str
        """
        embedding_history_path = Path("backend/Maia/memories/conversations/last_embedded.json")

        # load conversation based on session id
        try:
            Logger.info(f"Loading conversation for remaining embed: {session_id}")
            conversation = load_conversation(session_id=session_id)
            if not conversation:
                Logger.warning(f"No conversation found for session id: {session_id}")
                return
        except Exception as err:
            Logger.error(f"Failed to load conversation: {repr(err)}")
            return

        # load embedding history
        try:
            Logger.info("Loading embedding history.")
            embedding_history: list[dict] = load_json(path=embedding_history_path, default=[])
            if not isinstance(embedding_history, list):
                embedding_history = []
        except Exception as err:
            Logger.error(f"Failed to load embedding history: {repr(err)}")
            embedding_history = []

        # find portion of conversation not yet embedded
        try:
            Logger.info("Calculating remaining conversation to embed.")
            embedding_history_keys = {
                json.dumps(d, sort_keys=True, ensure_ascii=False) for d in embedding_history
            }
            remaining_conversation = [
                turn for turn in conversation
                if json.dumps(turn, sort_keys=True, ensure_ascii=False) not in embedding_history_keys
            ]
        except Exception as err:
            Logger.error(f"Failed to calculate remaining conversation: {repr(err)}")
            remaining_conversation = conversation

        # if nothing remaining to embed, exit
        if not remaining_conversation:
            Logger.info("No remaining conversation to embed.")
            return

        # create transcript from remaining conversation
        try:
            Logger.info(f"Embedding {len(remaining_conversation)} remaining turns.")
            transcript = create_transcript_with_timestamps(turns=remaining_conversation)
            stringified_transcript = trim_transcript(transcript=transcript, stringify_entire_transcript=True)
        except Exception as err:
            Logger.error(f"Failed to create transcript: {repr(err)}")
            return

        # create metadata
        metadata = {
            "session_id": session_id,
            "project": "conversation"
        }

        # embed remaining conversation to raw_conversations vector store
        try:
            Logger.info("Embedding remaining conversation.")
            self.embed(
                text=stringified_transcript,
                metadata=metadata,
                index=self.raw_conversations_index,
                persist_dir=self.raw_conversations_index_path
            )
            Logger.info("Remaining conversation embedded successfully.")
        except Exception as err:
            Logger.error(f"Failed to embed remaining conversation: {repr(err)}")


    def embed_entire_conversation(self, session_id: str):
        """
        One of Maia's embedding functions. Saves a raw conversation to its corresponding vector store.
        
        :param session_id: The session id of the conversation to save.
        :type session_id: str
        """

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
            self.embed(
                text=stringified_transcript,
                metadata=metadata,
                index=self.raw_conversations_index,
                persist_dir=self.raw_conversations_index_path
            )
            Logger.info("Conversation embedded.")

        except Exception as err:
            Logger.error(repr(err))