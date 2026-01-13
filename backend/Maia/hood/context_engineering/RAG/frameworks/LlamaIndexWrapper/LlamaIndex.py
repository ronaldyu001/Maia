from llama_index.core import Document, StorageContext, VectorStoreIndex, load_index_from_storage
from llama_index.vector_stores.faiss import FaissMapVectorStore
from llama_index.core.embeddings import BaseEmbedding
from llama_index.core.storage.docstore import SimpleDocumentStore
from llama_index.core.storage.index_store import SimpleIndexStore

from pydantic import PrivateAttr
import faiss
from typing import Literal, Optional, List
import datetime
from backend.utility_wrappers.LoggingWrapper.LoggingWrapper import Logger

from backend.Maia.SETTINGS import STORE_PATHS
from backend.Maia.hood.context_engineering.RAG.embedders.Nomic.NomicWrapper import NomicEmbedder


class LlamaIndexWrapper:
    """
    Constructor:
    - category (str): category to save info to. (facts, goals, events)
    """
    def __init__(self, category: Literal["facts","goals","events"]):
        # --- load storage context and load index ---
        Logger.info(f"Loading LlamaIndex Wrapper.")
        self.storage_context = StorageContext.from_defaults(
            persist_dir=STORE_PATHS[category],
            vector_store=FaissMapVectorStore.from_persist_dir(persist_dir=STORE_PATHS[category])
        )
        self.index = load_index_from_storage(storage_context=self.storage_context, embed_model=LlamaIndexEmbedAdapter())
    

    def save_fact(self, text: str, metadata: Optional[dict] = None, persist: bool = True, TOP_K: int = 5, SIM_THRESHOLD: float = 0.9) -> str | bool:
        if not text or not text.strip():
            raise ValueError("Fact text cannot be empty.")

        # --- collision check ---
        retriever = self.index.as_retriever(similarity_top_k=TOP_K)
        hits = retriever.retrieve(text)  # returns NodeWithScore
        for h in hits:
            if h.score >= SIM_THRESHOLD:
                # merge/update policy (simple: append note & update metadata)
                merged = self._merge_text(h.node.get_content(), text)
                h.node.text = merged
                if metadata: h.node.metadata.update(metadata)
                # upsert updated node
                self.index.delete_nodes([h.node.node_id])
                self.index.insert_nodes([h.node])
                return h.node.node_id  # reused

        # --- no collision: insert new ---
        meta = {"category": "facts", "created_at": datetime.utcnow().isoformat()}
        if metadata: meta.update(metadata)

        doc = Document(text=text, metadata=meta)
        self.index.insert(doc)

        if persist: self.index.storage_context.persist(persist_dir=STORE_PATHS[self.category])

        return doc.doc_id
    

# ----- Adapter for nomic embedder -----
class LlamaIndexEmbedAdapter(BaseEmbedding):
    """ Overrides functions LlamaIndex VectorStoreIndex expects from embedder. """
    # mark as private so pydantic doesn’t try to validate/serialize
    _embedder: NomicEmbedder = PrivateAttr()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._embedder = NomicEmbedder()

    # ---- sync ----
    def _get_query_embedding(self, query: str) -> List[float]:
        return self._embedder.encode([query])[0].tolist()

    def _get_text_embedding(self, text: str) -> List[float]:
        return self._embedder.encode([text])[0].tolist()

    # ---- async ----
    async def _aget_query_embedding(self, query: str) -> List[float]:
        return self._get_query_embedding(query)

    async def _aget_text_embedding(self, text: str) -> List[float]:
        return self._get_text_embedding(text)
