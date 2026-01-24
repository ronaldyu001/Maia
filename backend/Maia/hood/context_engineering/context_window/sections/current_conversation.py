from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone
import json

from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.RAG.LlamaIndex_Wrapper import LlamaIndex
from backend.Maia.hood.context_engineering.helpers.transcript import (
    create_transcript,
    trim_transcript,
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
    Logger.info("Generating conversational transcript.")

    vector_store = LlamaIndex()
    embedding_history_path = Path("backend/Maia/memories/conversations/last_embedded.json")

    # token count of FULL current conversation (string form)
    current_transcript_obj = create_transcript(turns=current_conversation)
    current_transcript_str = trim_transcript(
        transcript=current_transcript_obj,
        stringify_entire_transcript=True,
    )
    conversation_token_count = generic_token_counter(text=current_transcript_str)

    # return conversation if <= token limit
    if conversation_token_count <= size:
        return current_transcript_str

    # ensure and load embedding history
    try:
        embedding_history_path.parent.mkdir(parents=True, exist_ok=True)
        if not embedding_history_path.exists():
            save_json(path=embedding_history_path, default=[], data=[])

        # IMPORTANT: default must be an *instance*, not the type `list`
        embedding_history: list[dict] = load_json(path=embedding_history_path, default=[])
        if not isinstance(embedding_history, list):
            embedding_history = []
    except Exception as err:
        embedding_history = []
        Logger.error(repr(err))

    # conversation portion not embedded yet
    try:
        conversation_not_embedded = subtract_list_of_dicts(current_conversation, embedding_history)
    except Exception as err:
        conversation_not_embedded = current_conversation
        Logger.error(repr(err))

    # pick chunk to embed (oldest part of not-embedded)
    chunk_ratio = 0.3
    chunk_size = int(size * chunk_ratio)

    chunk_list_dict = autosize_transcript_generic_keep_oldest(
        transcript=conversation_not_embedded,
        size=chunk_size,
    )

    # If there's nothing new to embed, just return the full current transcript
    if not chunk_list_dict:
        return current_transcript_str

    chunk_obj = create_transcript(turns=chunk_list_dict)
    chunk_str = trim_transcript(transcript=chunk_obj, stringify_entire_transcript=True)

    # embed chunk
    metadata = {
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
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
        Logger.error(repr(err))

    # return remaining conversation (not embedded yet) for context window
    remaining = subtract_list_of_dicts(current_conversation, chunk_list_dict)
    remaining_obj = create_transcript(turns=remaining)
    remaining_str = trim_transcript(transcript=remaining_obj, stringify_entire_transcript=True)

    return remaining_str