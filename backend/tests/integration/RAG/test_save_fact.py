from backend.Maia.hood.context_engineering.RAG.frameworks.LlamaIndexWrapper.LlamaIndex import LlamaIndexWrapper


import json, faiss
from pathlib import Path

p = Path("Maia/memory/RAG/store/facts/default__vector_store.json")
# It’s *binary*; do NOT json.load() it.
with p.open("rb") as f:
    buf = f.read()
fa = faiss.deserialize_index(buf)  # should not crash
print("faiss ntotal:", fa.ntotal)


# def test_save_fact():
#     Maia_Index = LlamaIndexWrapper(category="facts")
#     Maia_Index.save_fact(text="I started lifting at 16 years old.", persist=True)
#     return