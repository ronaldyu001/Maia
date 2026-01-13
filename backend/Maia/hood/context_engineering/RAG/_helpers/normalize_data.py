import numpy as np
import faiss


def normalize_embed_input(query: str | list[str]) -> str:
    """
    Normalize input for embedding.
    
    Args:
    - query: A single string or a list of strings.
    
    Returns: 
    - A single string to embed (if list, returns the first element).
    
    Raises:
    - ValueError: If input is empty or invalid.
    """
    print("    - Normalizing inputs...")

    if isinstance(query, str):
        text = query.strip()
    elif isinstance(query, list) and len(query) > 0:
        text = str(query[0]).strip()
    else:
        raise ValueError("No texts to embed.")

    if not text:
        raise ValueError("Input string is empty after normalization.")

    return text


def normalize_meta_input(metadata: list[dict] | str, data: list[str]) -> list[dict]:
    """
    - If metadata is None: return empty list[dict]
    - If metadata length does not match data length: raise error
    """
    print(f"    - Aligning metadata...")
    if metadata is None:
        return [{} for _ in data]
    if len(metadata) != len(data):
        raise ValueError("metadata length must match texts length.")
    

def normalize_vectors(vectors: list[list[float]]):
    vector = np.asarray(vector, dtype=np.float32)
    if vectors.ndim == 1:
        vectors = vectors.reshape(1, -1)
    vectors = np.ascontiguousarray(vectors)
    # If you intend cosine similarity with IndexFlatIP, normalize:
    faiss.normalize_L2(vectors)
    return vectors


def normalize_vector_ids(vector_ids: list[str]):
    ids = np.asarray(ids, dtype=np.int64).reshape(-1)
    ids = np.ascontiguousarray(ids)
    return ids