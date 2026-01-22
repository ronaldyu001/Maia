from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex

def test_LlamaIndex_embed():
    vector_store = LlamaIndex()

    facts = [
        ("The Great Wall of China is over 13,000 miles long.", {"category": "history"}),
        ("Honey never spoils and can last thousands of years.", {"category": "food"}),
        ("Octopuses have three hearts and blue blood.", {"category": "animals"}),
        ("Venus is the hottest planet in our solar system.", {"category": "space"}),
        ("Bananas are technically berries but strawberries are not.", {"category": "food"}),
    ]

    for text, metadata in facts:
        vector_store.embed(text=text, metadata=metadata, index=vector_store.memories_index, persist_dir=vector_store.memories_index_path)
        print(f"Embedded: {text[:50]}...")

    print("\nFinished embedding all 5 facts")

    new_vector_store = LlamaIndex()
    retriever = new_vector_store.memories_index.as_retriever(similarity_top_k=5)

    queries = [
        ("ancient walls", "The Great Wall of China"),
        ("food preservation", "Honey never spoils"),
        ("ocean creatures", "Octopuses have three hearts"),
        ("planets temperature", "Venus is the hottest"),
        ("fruit classification", "Bananas are technically berries"),
    ]

    print("\n--- Retrieval Verification ---")
    for query, expected_substring in queries:
        results = retriever.retrieve(query)
        print(f"\nQuery: '{query}'")
        found = False
        for r in results:
            print(f"  Score: {r.score:.4f} | {r.node.text[:60]}...")
            if expected_substring.lower() in r.node.text.lower():
                found = True
        if found:
            print(f"    Found expected fact")
        else:
            print(f"    Expected fact not in top 5 results")

if __name__ == "__main__":
    test_LlamaIndex_embed()