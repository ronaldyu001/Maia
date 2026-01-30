# Maia Backend — Navigation Guide

Quick map of the backend layout, architecture, and the common flow from request to response.
Intended for LLMs and developers navigating this codebase.

---

## Entry Points

- `backend/main.py` — FastAPI app setup, CORS, route registration, async startup trigger
- `backend/startup.py` — Async startup orchestrator (LLM models + Radicale calendar server)

---

## Directory Structure

```
backend/
├── main.py                             # FastAPI app, CORS, route registration
├── startup.py                          # Async startup: models + Radicale server
├── CLAUDE.md                           # This file
│
├── config/                             # Centralized configuration
│   ├── __init__.py                     # Config exports
│   ├── calendar.py                     # Radicale credentials, CalDAV client factory
│   └── paths.py                        # All path constants
│
├── logging/
│   ├── LoggingWrapper.py               # MaiaLogFormatter, Logger setup
│   └── logs/                           # Generated: YYYY_MM_DD.log
│
├── routes/
│   ├── chat/
│   │   ├── chat.py                     # POST /chat — main chat handler
│   │   └── helpers/
│   │
│   └── calendar/
│       ├── route_calendar.py           # Router with 8 endpoints (5 calendar, 3 event)
│       ├── models.py                   # Centralized Pydantic models
│       └── helpers/
│           ├── create_calendar.py
│           ├── delete_calendar.py
│           ├── list_calendars.py
│           ├── get_default_calendar.py
│           ├── set_default_calendar.py
│           ├── create_event.py         # Create event via iCalendar
│           ├── delete_event.py         # Delete event by URL
│           └── edit_event.py           # Edit existing event
│
├── Calendar/
│   └── Radicale/
│       ├── Radicale.conf               # Server configuration
│       ├── htpasswd                    # Auth credentials (bcrypt)
│       ├── storage/                    # CalDAV data
│       └── default_calendar.json       # UI default preference
│
├── Maia/                               # Core application logic
│   ├── config.py                       # Model names, Ollama host
│   ├── SETTINGS.py                     # Prompts, rules, tool contract
│   ├── hood/                           # AI logic layer
│   ├── tools/                          # Tool implementations
│   └── memories/                       # Persistent storage (gitignored)
│
└── tests/
```

---

## Configuration System

### `config/calendar.py`
Centralized CalDAV/Radicale configuration:

```python
# Credentials (use env vars in production)
RADICALE_URL = os.getenv("RADICALE_URL", "http://localhost:5232")
RADICALE_USERNAME = os.getenv("RADICALE_USERNAME", "ronald")
RADICALE_PASSWORD = os.getenv("RADICALE_PASSWORD", "...")

# Factory functions
get_caldav_client() -> caldav.DAVClient
get_principal(client?) -> caldav.Principal
resolve_calendar_name(calendar) -> str
```

### `config/paths.py`
Centralized path constants:

```python
BACKEND_ROOT, MAIA_ROOT
CONVERSATIONS_DIR, PREV_SESSION_ID_PATH, LAST_EMBEDDED_PATH
VECTOR_STORES_DIR, RAW_CONVERSATIONS_INDEX, MEMORIES_INDEX
CALENDAR_DIR, RADICALE_CONFIG_PATH, DEFAULT_CALENDAR_JSON
LOGS_DIR
```

---

## Calendar System

### Pydantic Models (`routes/calendar/models.py`)

**Calendar Models:**
```python
CalendarItem(name, url)
ListCalendarsResponse(calendars)
CreateCalendarRequest(calendar_name)
CreateCalendarResponse(calendar_name)
DeleteCalendarRequest(calendar_name)
DeleteCalendarResponse(success, message)
GetDefaultCalendarResponse(calendar_url)
SetDefaultCalendarRequest(calendar_url)
SetDefaultCalendarResponse(success)
```

**Event Models:**
```python
EventItem(uid, summary, description?, dtstart, dtend, location?, priority?, url)
CreateEventRequest(calendar_url, summary, description?, dtstart, dtend, location?, priority?)
CreateEventResponse(event: EventItem)
DeleteEventRequest(event_url, calendar_url)
DeleteEventResponse(success, message)
EditEventRequest(event_url, calendar_url, summary?, description?, dtstart?, dtend?, location?, priority?)
EditEventResponse(event: EventItem)
```
*Note: priority is 1-9 where 1 is highest priority*

### Routes (`routes/calendar/route_calendar.py`)

**Calendar Routes:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/calendar/create_calendar` | POST | Create new calendar |
| `/calendar/delete_calendar` | POST | Delete calendar by name |
| `/calendar/list_calendars` | GET | List all calendars |
| `/calendar/get_default_calendar` | GET | Get default calendar URL |
| `/calendar/set_default_calendar` | POST | Set default calendar |

**Event Routes:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/calendar/create_event` | POST | Create event in calendar |
| `/calendar/delete_event` | POST | Delete event by URL |
| `/calendar/edit_event` | POST | Edit existing event |

### Helpers
All helpers use centralized config from `config/calendar.py`:

**Calendar Helpers:**
- `create_calendar(name)` — Creates calendar via CalDAV
- `delete_calendar(name)` — Deletes calendar by name
- `list_calendars()` — Returns all calendars
- `get_default_calendar()` — Reads default from JSON
- `set_default_calendar(url)` — Writes default to JSON

**Event Helpers:**
- `create_event(req)` — Creates event via iCalendar/CalDAV
- `delete_event(req)` — Deletes event by URL
- `edit_event(req)` — Updates event fields in-place

---

## Startup System

**File:** `startup.py`

### Startup Events
```python
_EVENTS = [
    {"name": "models",   "label": "Loading LLM models"},
    {"name": "calendar", "label": "Starting calendar service"},
]
```

### Progress Tracking
- `get_startup_status()` — Returns progress dict for frontend polling
- `_mark_done(name)` — Marks event complete

### Tasks
1. **`start_models()`** — Initializes OllamaModel singleton
2. **`start_calendar()`** — Launches Radicale CalDAV server subprocess

### API Endpoint
```
GET /startup/status
Response: { total, completed, events: {...}, finished }
```

---

## Key Classes

### OllamaModel (Singleton)
**File:** `Maia/hood/models/ollama/wrapper_ollama.py`

- Wraps Ollama REST API
- Default model: `ministral-3:latest`
- `chat(prompt)`, `async_chat(prompt)`

### LlamaIndex (Singleton)
**File:** `Maia/hood/RAG/LlamaIndex_Wrapper.py`

- Manages vector store indices
- Embedding model: `nomic-embed-text`

### Summarizer (Singleton)
**File:** `Maia/hood/models/ollama/summarizer.py`

- Model: `qwen2.5:3b`
- `summarize()`, `summarize_response()`

### Logger
**File:** `logging/LoggingWrapper.py`

- Custom formatter with caller info
- Dual output: console + dated file
- Usage: `Logger.info(...)`, `Logger.error(...)`

---

## Chat Request Flow

**Endpoint:** `POST /chat`

**Request:** `{ "message": str, "session_id": str }`
**Response:** `{ "response": str }`

```
1. Extract session_id & message
2. If session changed → embed previous conversation
3. Initialize conversation if needed
4. Add user turn, save conversation
5. Generate context window
6. Call OllamaModel.chat()
7. Parse response (tool request or plain text)
8. Return response
```

---

## Context Window Construction

Total budget: **2750 tokens**

| Section | Ratio | Source |
|---------|-------|--------|
| SYSTEM_PROMPT | 0.15 | `sections/system_prompt.py` |
| TASK | 0.10 | `sections/task.py` |
| TOOL_CONTRACT | 0.15 | `sections/tool_contract.py` |
| CURRENT_CONVERSATION | 0.25 | `sections/current_conversation.py` |
| RAG | 0.00 | `sections/RAG.py` |

---

## Patterns & Conventions

### Singleton Pattern
Used by: `OllamaModel`, `LlamaIndex`, `Summarizer`

### Centralized Config
All calendar operations import from `backend.config.calendar`:
```python
from backend.config.calendar import get_caldav_client, get_principal
```

### Logging Convention
```python
Logger.info("Message")  # Prefix auto-injected
Logger.error(f"Failed: {e}")
```

---

## Quick Reference

| I want to... | Go to |
|--------------|-------|
| Add/modify chat endpoint | `routes/chat/chat.py` |
| Add calendar endpoint | `routes/calendar/route_calendar.py` |
| Add event endpoint | `routes/calendar/route_calendar.py` |
| Add calendar/event model | `routes/calendar/models.py` |
| Add event helper | `routes/calendar/helpers/` |
| Change calendar config | `config/calendar.py` |
| Change path constants | `config/paths.py` |
| Change LLM model | `Maia/config.py` |
| Edit system prompt | `SETTINGS.py` |
| Configure Radicale | `Calendar/Radicale/Radicale.conf` |
| Change startup behavior | `startup.py` |
| Check logs | `logging/logs/YYYY_MM_DD.log` |

---

## Environment Variables

For production, set these environment variables:
```bash
RADICALE_URL=http://localhost:5232
RADICALE_USERNAME=your_username
RADICALE_PASSWORD=your_password
```
