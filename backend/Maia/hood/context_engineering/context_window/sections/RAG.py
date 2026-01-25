import json
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from backend.logging.LoggingWrapper import Logger


RAG_INTRO = """
The following section contains retrieved reference material that may be relevant to the current task.

- The content was retrieved automatically based on semantic similarity.
- It may include partial, outdated, or tangential information.
- Use it only if it is helpful for answering the user’s current request.
- Do not assume the retrieved content is correct or complete.
- Do not mention retrieval, embeddings, or vector stores in the final answer.
- Do not include raw RAG text in final answer unless asked.
"""


def get_RAG(session_id: str) -> str:
    """
    Retrieves top 5 RAG results from raw_conversations index using the user's last message as query.

    :param session_id: The session id to get the last user message from.
    :type session_id: str
    :return: Top 5 results joined as a single string.
    :rtype: str
    """
    conversations_path = f"backend/Maia/memories/conversations/{session_id}.json"

    #load the conversation
    try:
        with open(conversations_path, "r") as f:
            conversation = json.load(f)
    except FileNotFoundError:
        Logger.warning(f"Conversation file not found: {conversations_path}")
        return ""
    except json.JSONDecodeError as err:
        Logger.error(f"Failed to parse conversation JSON: {repr(err)}")
        return ""

    #get user messages
    user_messages = [turn for turn in conversation if turn["role"] == "user"]
    if not user_messages:
        Logger.warning(f"No user messages found in session: {session_id}")
        return ""

    #get last user message
    last_user_message = user_messages[-1]["content"]
    query_preview = last_user_message[:80].replace('\n', ' ')
    Logger.info(f"RAG query: \"{query_preview}{'...' if len(last_user_message) > 80 else ''}\"")

    #use last message to query vector store
    vector_store = LlamaIndex()
    retriever = vector_store.raw_conversations_index.as_retriever(similarity_top_k=3)
    results = retriever.retrieve(last_user_message)

    if not results:
        Logger.info("No relevant RAG results found")
        return ""

    Logger.info(f"Retrieved {len(results)} RAG chunks")
    chunks = [f"[{i+1}] {r.node.text}" for i, r in enumerate(results)]

    BODY = "\n\n---\n\n".join(chunks)
    RAG_TEXT = RAG_INTRO + BODY

    return RAG_TEXT
