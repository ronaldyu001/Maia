import json
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from backend.logging.LoggingWrapper import Logger


RAG_INTRO = """

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
        Logger.error(f"get_RAG: Conversation file not found: {conversations_path}")
        return ""
    except json.JSONDecodeError as err:
        Logger.error(f"get_RAG: Failed to parse conversation JSON: {err}")
        return ""

    #get user messages
    user_messages = [turn for turn in conversation if turn["role"] == "user"]
    if not user_messages:
        Logger.error("get_RAG: No user messages found in conversation")
        return ""

    #get last user message
    last_user_message = user_messages[-1]["content"]
    Logger.info(f"get_RAG: Querying with last user message: {last_user_message[:50]}...")

    #use last message to query vector store
    vector_store = LlamaIndex()
    retriever = vector_store.raw_conversations_index.as_retriever(similarity_top_k=5)
    results = retriever.retrieve(last_user_message)

    print(f'RAG results: {results}')

    if not results:
        return ""

    chunks = [f"[{i+1}] {r.node.text}" for i, r in enumerate(results)]
    return "\n\n---\n\n".join(chunks)