from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone
import json

from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from backend.Maia.hood.context_engineering.helpers.transcript import (
    create_transcript,
    trim_transcript,
    create_transcript_with_timestamps
)
from backend.Maia.hood.context_engineering.helpers.token_counters import generic_token_counter
from backend.Maia.tools.memory.storage import load_json, save_json
from backend.Maia.hood.context_engineering.helpers.transcript import autosize_transcript_generic_keep_oldest


def subtract_list_of_dicts(a: list[dict], b: list[dict]) -> list[dict]:
    """
    Return items in a that are not in b, preserving order.
    Uses canonical JSON so dict key order doesn't matter.
    """
    b_keys = {json.dumps(d, sort_keys=True, ensure_ascii=False) for d in (b or [])}
    out: list[dict] = []
    for d in (a or []):
        k = json.dumps(d, sort_keys=True, ensure_ascii=False)
        if k not in b_keys:
            out.append(d)
    return out


def add_list_of_dicts(a: list[dict], b: list[dict]) -> list[dict]:
    """
    Return a new list with b appended to a (non-mutating).
    Defensive against None / wrong types.
    """
    if not isinstance(a, list):
        a = []
    if not isinstance(b, list):
        b = []
    return a + b


def get_current_conversation(current_conversation: list[dict], session_id: str, size: int) -> str | bool:
    Logger.info(f"Processing conversation for session {session_id} (token budget: {size})")

    vector_store = LlamaIndex()
    embedding_history_path = Path("backend/Maia/memories/conversations/last_embedded.json")

    # ensure and load embedding history
    try:
        embedding_history_path.parent.mkdir(parents=True, exist_ok=True)
        if not embedding_history_path.exists():
            save_json(path=embedding_history_path, default=[], data=[])

        # IMPORTANT: default must be an *instance*, not the type `list`
        embedding_history: list[dict] = load_json(path=embedding_history_path, default=[])
        if not isinstance(embedding_history, list):
            Logger.warning("Unable to load embedding history. Treating as empty.")
            embedding_history = []
    except Exception as err:
        embedding_history = []
        Logger.error(f"Failed to load embedding history: {repr(err)}")

    Logger.info(f"Loaded embedding history with size: ~{generic_token_counter(embedding_history)} tokens")

    # get portion of conversation not embedded yet
    try:
        conversation_not_embedded = subtract_list_of_dicts(current_conversation, embedding_history)
        conversation_not_embedded_obj = create_transcript_with_timestamps(conversation_not_embedded)
        conversation_not_embedded_str = trim_transcript(transcript=conversation_not_embedded_obj, stringify_entire_transcript=True)

    except Exception as err:
        conversation_not_embedded = current_conversation
        Logger.error(f"Failed to calculate unembedded turns: {repr(err)}")

    # return unembedded conversation if <= token limit
    conversation_not_embedded_token_count = generic_token_counter(text=conversation_not_embedded_str)
    if conversation_not_embedded_token_count <= size:
        Logger.info(f"Conversation fits within budget ({len(current_conversation)} turns, ~{conversation_not_embedded_token_count} tokens)")
        return conversation_not_embedded_str

    Logger.info(f"Conversation exceeds budget (~{conversation_not_embedded_token_count} > {size} tokens), embedding older turns")


    # keep the most recent turn(s) out of embedding to avoid dropping latest context
    recent_keep = 1
    if len(conversation_not_embedded) <= recent_keep:
        Logger.info("Not enough unembedded turns to embed without dropping latest; returning full transcript")
        return conversation_not_embedded_str

    embed_candidates = conversation_not_embedded[:-recent_keep]
    if not embed_candidates:
        Logger.info("No eligible turns to embed after reserving recent; returning full transcript")
        return conversation_not_embedded_str

    # get chunk size of conversation to embed
    chunk_ratio = 0.5
    chunk_size = int(size * chunk_ratio)

    chunk_list_dict = autosize_transcript_generic_keep_oldest(
        transcript=embed_candidates,
        size=chunk_size,
    )

    # If there's nothing new to embed, just return the full current transcript
    if not chunk_list_dict:
        Logger.info("No new turns to embed, returning full transcript")
        return conversation_not_embedded_str

    chunk_obj = create_transcript_with_timestamps(turns=chunk_list_dict)
    chunk_str = trim_transcript(transcript=chunk_obj, stringify_entire_transcript=True)

    # embed chunk
    metadata = {
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    Logger.info(f"Embedding {len(chunk_list_dict)} turns to vector store")
    vector_store.embed(
        text=chunk_str,
        metadata=metadata,
        index=vector_store.raw_conversations_index,
        persist_dir=vector_store.raw_conversations_index_path,
    )

    # update embedding history (no +=)
    try:
        embedding_history = add_list_of_dicts(embedding_history, chunk_list_dict)
        save_json(path=embedding_history_path, default=[], data=embedding_history)
    except Exception as err:
        Logger.error(f"Failed to save embedding history: {repr(err)}")

    # return remaining conversation (not embedded yet) for context window
    remaining = subtract_list_of_dicts(conversation_not_embedded, chunk_list_dict)
    remaining_obj = create_transcript_with_timestamps(turns=remaining)
    remaining_str = trim_transcript(transcript=remaining_obj, stringify_entire_transcript=True)

    Logger.info(f"Returning {len(remaining)} remaining turns for context window")
    return remaining_str
