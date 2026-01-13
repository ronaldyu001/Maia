from llama_index.core import Document, StorageContext, VectorStoreIndex
from llama_index.vector_stores.faiss import FaissMapVectorStore
from llama_index.core.storage.docstore import SimpleDocumentStore
from llama_index.core.storage.index_store import SimpleIndexStore
from llama_index.core.graph_stores.simple import SimpleGraphStore

from backend.Maia.hood.llm_managers.maia_llama3 import Maia_llama3_Manager
from backend.Maia.hood.context_engineering.RAG.embedders.Nomic.NomicWrapper import NomicEmbedder
from backend.Maia.hood.context_engineering.RAG.frameworks.LlamaIndexWrapper.LlamaIndex import LlamaIndexEmbedAdapter

import faiss
from pathlib import Path

from backend.logs.LoggingWrapper import Logger
from backend.Maia.tools.memory.storage import load_json
from backend.Maia.SETTINGS import SEED_PATHS, STORE_PATHS
"""
startup events.
"""


async def load_llama3():
    """ loads existing instance of llama3 llm """
    Maia_llama3_Manager.get_llm()


def load_RAG():
    """ ensures indexes for LlamaIndex """
    required_files = ["default__vector_store.json", "docstore.json", "index_store.json", "image__vector_store.json", "graph_stores.json"]

    for file_path in STORE_PATHS.values(): Path(file_path).mkdir(parents=True, exist_ok=True)

    try:
        for memory_category in STORE_PATHS.keys():
            # --- make sure index docs exist ---
            Logger.info(f"Checking {memory_category} RAG stores.")
            if (all((Path(STORE_PATHS[memory_category]) / f).exists()) for f in required_files): pass

            # --- create blank index and docs if doc(s) DNE ---
            else:
                Logger.info(f"Creating {memory_category} RAG index.")
                embedder = NomicEmbedder()
                faiss_index = faiss.IndexFlatIP(embedder.dimensions)    # 2) create index
                faiss_map_index = faiss.IndexIDMap2(faiss_index)        # 3) wrap into mapped index
                Logger.info(f"Creating {memory_category} storage context.")
                storage_context = StorageContext.from_defaults(
                    docstore=SimpleDocumentStore(), 
                    index_store=SimpleIndexStore(),
                    vector_store=FaissMapVectorStore(faiss_index=faiss_map_index),
                    graph_store=SimpleGraphStore()
                )                                                       # 4) create storage context
                try: documents = load_json(path=Path(SEED_PATHS[memory_category]), default=[])
                except: documents = []
                index = VectorStoreIndex.from_documents(
                    documents=documents,
                    storage_context=storage_context,
                    embed_model=LlamaIndexEmbedAdapter(),
                )                                                       # 5) create index from seed
                Logger.info(f"Persisting to: {STORE_PATHS[memory_category]}")
                index.storage_context.persist(
                    persist_dir=STORE_PATHS[memory_category]
                )                                                       # 6) persist index

    except Exception as err:
        Logger.error(repr(err))
        return False