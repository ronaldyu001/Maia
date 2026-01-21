from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex


def test_embed_raw_conversation(session_id: str):
    vector_store = LlamaIndex()

    print(f"Embedding raw conversation for session: {session_id}")
    vector_store.embed_raw_conversation(session_id=session_id)
    print("Finished embedding raw conversation")

    # If your embed method persists+reloads internally, great.
    # If not, you may need a vector_store.reload_raw_conversations_index() here.

    retriever = vector_store.raw_conversations_index.as_retriever(similarity_top_k=5)

    print("\n--- Retrieval Verification ---")
    query = "date of birth age occupation hobbies"
    results = retriever.retrieve(query)
    print(f"\nQuery: {query}")
    for r in results:
        text_preview = r.node.text[:].replace("\n", " ")
        print(f"  Score: {r.score:.4f} | {text_preview}...")

    if results:
        print(f"\n    Successfully retrieved {len(results)} result(s)")
    else:
        print(f"\n    No results found")


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m backend.tests.component.conversations.embed_conversation <session_id>")
        sys.exit(1)
    test_embed_raw_conversation(session_id=sys.argv[1])
