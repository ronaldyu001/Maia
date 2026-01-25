# Backend Navigation Guide

Quick map of the backend layout and the common flow from request -> response.

## Entry Points
- `backend/main.py`: FastAPI app setup, CORS, and route registration.
- `backend/startup.py`: Empty placeholder (unused).

## Routing
- `backend/routes/chat/chat.py`: `/chat` route; main request handler and response flow.
- `backend/routes/chat/helpers/`: helper utilities used by chat flow (session IDs, embeddings, summarization helpers).

## Core Engine (Maia)
Top-level package: `backend/Maia/`

### Engine Wrappers
- `backend/Maia/hood/models/ollama/wrapper_ollama.py`: main Ollama wrapper.
- `backend/Maia/hood/models/ollama/summarizer.py`: summarizer singleton + retry logic.
- `backend/Maia/hood/models/huggingface/`: HuggingFace wrapper (if used).

### Context Engineering
- `backend/Maia/hood/context_engineering/context_window/windows/`:
  - `generate_conversation_window.py`: full chat context window.
  - `summary_window.py`: summarization window.
  - `generate_window.py`: common window builder + token truncation logic.
- `backend/Maia/hood/context_engineering/context_window/sections/`:
  - `system_prompt.py`, `task.py`, `rules.py`, `tool_contract.py`, `current_conversation.py`, `RAG.py`.
- `backend/Maia/hood/context_engineering/helpers/`:
  - conversation loading/saving, transcript building, token counters, etc.

### Tools
Shared tools live in `backend/Maia/tools/`.
- `backend/Maia/tools/llm_based/`: LLM-driven tools (summarize, anchor extraction, etc).
- `backend/Maia/tools/data_interaction/`: data utilities (anchor extraction, memory helpers).
- `backend/Maia/tools/file_interaction/`: file IO helpers.
- `backend/Maia/tools/memory/`: memory storage utilities.
- `backend/Maia/tools/utility/`: JSON helpers and small utilities.

### Memory + Storage
- `backend/Maia/memories/conversations/`: saved conversation transcripts.
- `backend/Maia/memories/vector_stores/`: vector store data (RAG).

### RAG
- `backend/Maia/hood/RAG/`: retrieval logic and helpers.

## Logging
- `backend/logging/LoggingWrapper.py`: logging helper.
- `backend/logging/logs/`: log files.

## Tests
- `backend/tests/component/`: component-level tests.
- `backend/tests/integration/`: integration tests (summarizer, RAG, context).

## Common Flow (Chat)
1) `POST /chat` -> `backend/routes/chat/chat.py`
2) Conversation initialized/saved.
3) Context window built via `generate_conversation_window`.
4) Model called via `OllamaModel.chat()`.
5) Response is either:
   - Plain text reply -> saved to conversation.
   - Tool request -> processed by `tools/tool_handling.py`.

## Common Flow (Summarize)
1) Build transcript in `backend/Maia/tools/llm_based/summarize.py`
2) Call `Summarizer.summarize()` -> builds summary window + retries.
3) Output parsed and formatted.
