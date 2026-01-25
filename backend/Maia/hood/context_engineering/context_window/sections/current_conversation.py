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
    Logger.info(f"[get_current_conversation] Processing conversation for session {session_id} (token budget: {size})")

    vector_store = LlamaIndex()
    embedding_history_path = Path("backend/Maia/memories/conversations/last_embedded.json")

    # token count of FULL current conversation (string form)
    current_transcript_obj = create_transcript_with_timestamps(turns=current_conversation)
    current_transcript_str = trim_transcript(
        transcript=current_transcript_obj,
        stringify_entire_transcript=True,
    )
    conversation_token_count = generic_token_counter(text=current_transcript_str)
    Logger.info(f"[get_current_conversation] Current conversation: {len(current_conversation)} turns, ~{conversation_token_count} tokens")

    # return conversation if <= token limit
    if conversation_token_count <= size:
        Logger.info(f"[get_current_conversation] Conversation fits within budget, returning full transcript")
        return current_transcript_str

    Logger.info(f"[get_current_conversation] Conversation exceeds budget ({conversation_token_count} > {size}), preparing to embed older turns")

    # ensure and load embedding history
    try:
        embedding_history_path.parent.mkdir(parents=True, exist_ok=True)
        if not embedding_history_path.exists():
            save_json(path=embedding_history_path, default=[], data=[])

        # IMPORTANT: default must be an *instance*, not the type `list`
        embedding_history: list[dict] = load_json(path=embedding_history_path, default=[])
        if not isinstance(embedding_history, list):
            embedding_history = []
        Logger.info(f"[get_current_conversation] Loaded embedding history: {len(embedding_history)} previously embedded turns")
    except Exception as err:
        embedding_history = []
        Logger.error(f"[get_current_conversation] Failed to load embedding history: {repr(err)}")

    # conversation portion not embedded yet
    try:
        conversation_not_embedded = subtract_list_of_dicts(current_conversation, embedding_history)
        Logger.info(f"[get_current_conversation] {len(conversation_not_embedded)} turns not yet embedded")
    except Exception as err:
        conversation_not_embedded = current_conversation
        Logger.error(f"[get_current_conversation] Failed to calculate unembedded turns: {repr(err)}")

    # pick chunk to embed (oldest part of not-embedded)
    chunk_ratio = 0.5
    chunk_size = int(size * chunk_ratio)

    chunk_list_dict = autosize_transcript_generic_keep_oldest(
        transcript=conversation_not_embedded,
        size=chunk_size,
    )

    # If there's nothing new to embed, just return the full current transcript
    if not chunk_list_dict:
        Logger.info(f"[get_current_conversation] No new turns to embed, returning full transcript")
        return current_transcript_str

    chunk_obj = create_transcript_with_timestamps(turns=chunk_list_dict)
    chunk_str = trim_transcript(transcript=chunk_obj, stringify_entire_transcript=True)

    # embed chunk
    metadata = {
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    Logger.info(f"[get_current_conversation] Embedding {len(chunk_list_dict)} turns to vector store")
    vector_store.embed(
        text=chunk_str,
        metadata=metadata,
        index=vector_store.raw_conversations_index,
        persist_dir=vector_store.raw_conversations_index_path,
    )
    Logger.info(f"Chunk embedded: {chunk_str}")

    # update embedding history (no +=)
    try:
        embedding_history = add_list_of_dicts(embedding_history, chunk_list_dict)
        save_json(path=embedding_history_path, default=[], data=embedding_history)
        Logger.info(f"[get_current_conversation] Updated embedding history: now {len(embedding_history)} total embedded turns")
    except Exception as err:
        Logger.error(f"[get_current_conversation] Failed to save embedding history: {repr(err)}")

    # return remaining conversation (not embedded yet) for context window
    remaining = subtract_list_of_dicts(current_conversation, chunk_list_dict)
    remaining_obj = create_transcript_with_timestamps(turns=remaining)
    remaining_str = trim_transcript(transcript=remaining_obj, stringify_entire_transcript=True)

    Logger.info(f"[get_current_conversation] Returning {len(remaining)} remaining turns for context window")
    return remaining_str