from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer


class NomicEmbedder:
    """
    Responsible for encoding data.
    Parent layer is the FaissWrapper.
    """
    nomic_model = "nomic-ai/nomic-embed-text-v1.5"
    safe_model = "sentence-transformers/all-MiniLM-L6-v2"
    def __init__(self, model_name: str = safe_model):
        # ----- Creates model and gets dimensions -----
        self.model = SentenceTransformer(
            model_name_or_path=model_name, 
            trust_remote_code=False,
            device="cpu",
            # revision="e5cf08aadaa33385f5990def41f7a23405aec398"
        )
        self.dimensions = self.model.get_sentence_embedding_dimension()

    def encode(self, texts):
        """
        Returns L2-normalized embeddings (float32) shaped (N, D),
        so cosine similarity == dot product.
        """
        if isinstance(texts, str): texts = [texts]
        embs = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,  # makes IP ≡ cosine
            batch_size=64,
            show_progress_bar=False,
        ).astype("float32")
        return embs
    