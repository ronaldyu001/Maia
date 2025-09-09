# tests/component/test_nomic_embedder.py
import numpy as np
import pytest

from Maia.hood.context_engineering.RAG.embedders.Nomic.NomicWrapper import NomicEmbedder


@pytest.fixture(scope="module")
def embedder():
    return NomicEmbedder()

def test_single_string_encoding(embedder):
    text = "hello world"
    vec = embedder.encode(text)

    # shape check
    assert vec.shape == (1, embedder.dimensions)
    # dtype check
    assert vec.dtype == np.float32
    # normalized check
    norm = np.linalg.norm(vec[0])
    assert np.isclose(norm, 1.0, atol=1e-3)


def test_batch_string_encoding(embedder):
    texts = ["hello world", "goodbye world"]
    vecs = embedder.encode(texts)

    # shape check
    assert vecs.shape == (len(texts), embedder.dimensions)
    # dtype check
    assert vecs.dtype == np.float32
    # normalized check
    norms = np.linalg.norm(vecs, axis=1)
    assert np.allclose(norms, 1.0, atol=1e-3)
    

def test_consistency(embedder):
    text = "consistency check"
    vec1 = embedder.encode(text)[0]
    vec2 = embedder.encode([text])[0]
    # embeddings should be very close
    cosine_sim = np.dot(vec1, vec2)
    assert np.isclose(cosine_sim, 1.0, atol=1e-3)