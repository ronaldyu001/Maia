# Maia Backend — Navigation Guide

Quick map of the backend layout, architecture, and the common flow from request to response.
Intended for LLMs and developers navigating this codebase.

---

## Entry Points

- `backend/main.py` — FastAPI app setup, CORS (localhost:5173), route registration, startup event (initializes OllamaModel singleton).
- `backend/startup.py` — Placeholder (unused).

---

## Directory Structure

```
backend/
├── main.py                             # FastAPI app, CORS, route registration, startup
├── startup.py                          # Unused placeholder
├── CLAUDE.md                           # This file
│
├── logging/
│   ├── LoggingWrapper.py               # MaiaLogFormatter, Logger setup (console + dated file)
│   └── logs/                           # Generated: YYYY_MM_DD.log
│
├── routes/
│   └── chat/
│       ├── chat.py                     # POST /chat — main request handler
│       └── helpers/
│           ├── embed_remainder_prev_conversation.py  # Embed unembedded turns from prev session
│           ├── error_handlers.py                     # Route-level error handling
│           ├── get_prev_session_id.py                # Read prev_session_id.txt
│           ├── set_prev_session_id.py                # Write prev_session_id.txt
│           └── summarize_response.py                 # Compress verbose responses
│
├── Maia/                               # Core application logic
│   ├── config.py                       # Model names, Ollama host, model paths
│   ├── SETTINGS.py                     # Prompts, rules, tool contract, constants
│   │
│   ├── hood/                           # AI logic layer
│   │   ├── models/
│   │   │   ├── ollama/
│   │   │   │   ├── wrapper_ollama.py   # OllamaModel (Singleton) — chat(), async_chat()
│   │   │   │   └── summarizer.py       # Summarizer (Singleton) — summarize(), summarize_response()
│   │   │   └── huggingface/
│   │   │       └── wrapper_huggingface.py  # Skeleton only
│   │   │
│   │   ├── flavors/
│   │   │   └── base.py                 # BaseModel abstract class
│   │   │
│   │   ├── RAG/
│   │   │   ├── LlamaIndex_Wrapper.py   # LlamaIndex (Singleton) — embed, retrieve, manage vector stores
│   │   │   └── get_vector_store_indices/
│   │   │       ├── get_raw_conversations_index.py
│   │   │       └── get_memories_index.py
│   │   │
│   │   └── context_engineering/
│   │       ├── settings.py             # Memory paths, rules text, contracts
│   │       ├── context_window/
│   │       │   ├── sections/           # Individual context components
│   │       │   │   ├── system_prompt.py       # get_system_prompt()
│   │       │   │   ├── task.py                # get_task()
│   │       │   │   ├── rules.py               # get_rules()
│   │       │   │   ├── tool_contract.py       # get_tool_contract()
│   │       │   │   ├── current_conversation.py # get_current_conversation()
│   │       │   │   └── RAG.py                  # get_RAG()
│   │       │   └── windows/            # Context builders
│   │       │       ├── generate_window.py                # build_context_window() + token truncation
│   │       │       ├── generate_conversation_window.py   # Conversation-specific window (2750 tokens)
│   │       │       └── summary_window.py                 # Summarization context builder
│   │       └── helpers/
│   │           ├── conversations.py     # load/save/format/archive conversations
│   │           ├── add_turn.py          # Add turn in memory (not persisted)
│   │           ├── transcript.py        # Format, resize, autosize transcripts
│   │           ├── token_counters.py    # generic_token_counter(): ceil(len/4)
│   │           ├── generic_trimmer.py
│   │           └── uuid4_to_int64.py
│   │
│   ├── tools/
│   │   ├── tool_handling.py            # Tool dispatcher: receive_tool_request(), single_request()
│   │   ├── memory/
│   │   │   ├── embed_conversation.py   # commit_session() — archive session to long-term
│   │   │   └── storage.py             # load_json(), save_json()
│   │   ├── data_interaction/
│   │   │   └── anchor_extractor.py    # extract_anchors() — key phrase extraction
│   │   ├── file_interaction/
│   │   │   ├── read_file.py
│   │   │   ├── copy_file.py
│   │   │   └── move_file.py
│   │   ├── llm_based/
│   │   │   └── summarize.py           # Response summarization
│   │   └── utility/
│   │       ├── _time.py               # time_now() — ISO format with timezone
│   │       └── _json.py              # try_parse_json()
│   │
│   └── memories/                       # Persistent storage (gitignored data)
│       ├── conversations/
│       │   ├── {session_id}.json       # Conversation turns array
│       │   ├── prev_session_id.txt     # Tracks previous session
│       │   └── last_embedded.json      # Embedding progress tracker
│       └── vector_stores/
│           ├── raw_conversations/      # LlamaIndex: embedded conversation history
│           └── memories/               # LlamaIndex: summarized long-term memories
│
└── tests/
    ├── component/                      # Unit tests
    │   ├── test_token_counter.py
    │   ├── test_encode.py
    │   ├── conversations/
    │   └── RAG/
    └── integration/                    # Integration tests
        ├── context_engineering/
        ├── RAG/
        └── summarizer/
```

---

## Key Classes

### OllamaModel (Singleton)
**File:** `Maia/hood/models/ollama/wrapper_ollama.py`

- Wraps Ollama REST API (`http://localhost:11434/api/chat`).
- Default model: `ministral-3:latest` (set in `config.py`).
- `chat(prompt)` — accepts `str` or `list[dict]`, returns assistant response string.
- `async_chat(prompt)` — async variant.
- Streaming disabled.

### LlamaIndex (Singleton)
**File:** `Maia/hood/RAG/LlamaIndex_Wrapper.py`

- Manages two vector store indices: `raw_conversations` and `memories`.
- Embedding model: `nomic-embed-text` via Ollama.
- `embed(text, metadata, index, persist_dir)` — low-level Document insertion.
- `embed_entire_conversation(session_id)` — embed full conversation history.
- `embed_remaining_conversation(session_id)` — embed only unembedded portion using `last_embedded.json` tracking.

### Summarizer (Singleton)
**File:** `Maia/hood/models/ollama/summarizer.py`

- Model: `qwen2.5:3b` (set in `config.py`).
- `summarize(window_size_tkns, given_text, ...)` — general summarization with retry (max 3).
- `summarize_response(response)` — compress assistant response to 1-2 sentences, returns `"[Compressed] {summary}"`.

### Logger
**File:** `logging/LoggingWrapper.py`

- Custom `MaiaLogFormatter`: `TIMESTAMP [LEVEL]: MESSAGE` (ERROR+ adds `[filename:lineno]`).
- Dual output: console + dated file (`logging/logs/YYYY_MM_DD.log`).
- Usage: `Logger.info(...)`, `Logger.warning(...)`, `Logger.error(...)`.

---

## Chat Request Flow

**Endpoint:** `POST /chat` in `routes/chat/chat.py`

**Request:** `{ "message": str, "session_id": str }`
**Response:** `{ "response": str }`

```
1. Extract session_id & message from request
2. If session changed → embed_remainder_prev_conversation()
   ├── get_prev_session_id()
   ├── LlamaIndex.embed_remaining_conversation(prev_session_id)
   └── clear last_embedded.json
3. ensure_conversation_initialized(session_id)
4. add_turn(session_id, "user", message)  →  in-memory only
5. save_conversation(session_id, turns)
6. generate_conversation_window(session_id, turns)
   ├── get_system_prompt()           15% of 2750 tokens
   ├── get_task()                    10%
   ├── get_tool_contract()           15%
   ├── get_current_conversation()    25%
   │   └── If exceeds budget → embed older turns via LlamaIndex
   └── get_RAG()                     0% (not active by default)
7. OllamaModel.chat(context_window)
8. Parse response:
   ├── JSON detected → receive_tool_request() → execute tool → return summary
   └── Plain text:
       ├── If >300 tokens or contains lists → summarize_response()
       ├── add_turn(session_id, "assistant", response)
       └── save_conversation(session_id, turns)
9. set_prev_session_id(session_id)
10. Return { "response": ... }
```

---

## Context Window Construction

**Builder:** `context_engineering/context_window/windows/generate_conversation_window.py`

Total budget: **2750 tokens**. Each section allocated a ratio:

| Section              | Ratio | ~Tokens | Source                        |
|----------------------|-------|---------|-------------------------------|
| SYSTEM_PROMPT        | 0.15  | 412     | `sections/system_prompt.py`   |
| TASK                 | 0.10  | 275     | `sections/task.py`            |
| TOOL_CONTRACT        | 0.15  | 412     | `sections/tool_contract.py`   |
| CURRENT_CONVERSATION | 0.25  | 687     | `sections/current_conversation.py` |
| RAG                  | 0.00  | 0       | `sections/RAG.py`             |

Sections joined with `### SECTION_NAME` headers, then sent to LLM as prompt.

---

## Memory & Persistence

### Conversation Files
- **Format:** JSON array of `{ "role", "content", "timestamp" }` objects.
- **Path:** `Maia/memories/conversations/{session_id}.json`
- **Operations:**
  - `load_conversation(session_id)` — read JSON file.
  - `save_conversation(session_id, data)` — append last turn to file.
  - `add_turn(session_id, role, content)` — build turn list in memory (no file write).
  - `format_conversation(conversation)` — strip timestamps for LLM input.
  - `ensure_conversation_initialized(session_id)` — create file if missing.

### Vector Stores
- **raw_conversations** (`vector_stores/raw_conversations/`) — embedded conversation history, queried with last user message.
- **memories** (`vector_stores/memories/`) — summarized long-term memories (partially implemented).

### Session Tracking
- `prev_session_id.txt` — stores last session ID to detect session changes.
- `last_embedded.json` — tracks which turns have been embedded; cleared on session change.

---

## Tool System

**Dispatcher:** `Maia/tools/tool_handling.py`

### Available Tools

| Tool Name         | Function          | File                               | Purpose                          |
|-------------------|-------------------|-------------------------------------|----------------------------------|
| `_commit_session` | `commit_session()` | `tools/memory/embed_conversation.py` | Archive session to long-term memory |

### Tool Request Format (LLM output)
```json
{
  "reason": "concise goal (<=20 words)",
  "tool": "_commit_session",
  "arguments": { "session_id": "...", "include_raw": true }
}
```

Batch format: array of the above objects.

### Processing
1. LLM outputs JSON → `try_parse_json()` detects it.
2. `receive_tool_request()` routes to handler.
3. `single_request()` executes, returns summary string.

---

## Configuration

### config.py
```python
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL_NAME = "ministral-3:latest"    # Main chat model
SUMMARIZER_MODEL_NAME = "qwen2.5:3b"        # Summarizer model
```

### SETTINGS.py
- `RULES` — behavioral guidelines (concise, direct, friendly, plain text + bullets).
- `TOOL_CONTRACT` — JSON schema for tool requests.
- `SUMMARIZE_CONVERSATION_Task` — prompt template for conversation summarization.
- Memory and vector store path constants.

### context_engineering/settings.py
- `SHORT_TERM_conversations` / `LONG_TERM_conversations` — archive paths.
- Rules and contract text duplicates (used by context sections).

---

## Patterns & Conventions

### Singleton Pattern
Used by: `OllamaModel`, `LlamaIndex`, `Summarizer`.
```python
_instance = None
_initialized = False

def __new__(cls, ...):
    if cls._instance is None:
        cls._instance = super().__new__(cls)
        cls._instance._initialized = False
    return cls._instance
```

### JSON Persistence
```python
data = load_json(path=file_path, default=[])         # Safe load
success, error = save_json(path=file_path, default=[], data=my_data)  # Safe save
```

### Logging Convention
All functions use bracketed prefixes: `Logger.info(f"[function_name] descriptive message")`.

### Token Estimation
`generic_token_counter(text)` — rough estimate: `ceil(len(text) / 4)`.

---

## Quick Reference

| I want to...                    | Go to                                                    |
|---------------------------------|----------------------------------------------------------|
| Add/modify the chat endpoint    | `routes/chat/chat.py`                                    |
| Change the LLM model            | `Maia/config.py`                                         |
| Edit system prompt / rules      | `SETTINGS.py` or `context_engineering/context_window/sections/` |
| Add a new tool                   | `tools/tool_handling.py` (register) + `tools/` (implement) |
| Change context window ratios     | `context_window/windows/generate_conversation_window.py` |
| Debug a conversation             | `Maia/memories/conversations/{session_id}.json`          |
| Check logs                       | `logging/logs/YYYY_MM_DD.log`                            |
| Modify summarization             | `hood/models/ollama/summarizer.py`                       |
| Update RAG / embeddings          | `hood/RAG/LlamaIndex_Wrapper.py`                         |
| Add a new route                  | Create in `routes/`, register in `main.py`               |
| Add a new context section        | Create in `context_window/sections/`, wire in `windows/` |
