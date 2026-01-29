# Centralized path configuration
# All file/directory paths used throughout the backend

from pathlib import Path

# Root directories
BACKEND_ROOT = Path(__file__).resolve().parents[1]
MAIA_ROOT = BACKEND_ROOT / "Maia"

# Conversation storage
CONVERSATIONS_DIR = MAIA_ROOT / "memories" / "conversations"
PREV_SESSION_ID_PATH = CONVERSATIONS_DIR / "prev_session_id.txt"
LAST_EMBEDDED_PATH = CONVERSATIONS_DIR / "last_embedded.json"

# Vector stores
VECTOR_STORES_DIR = MAIA_ROOT / "memories" / "vector_stores"
RAW_CONVERSATIONS_INDEX = VECTOR_STORES_DIR / "raw_conversations"
MEMORIES_INDEX = VECTOR_STORES_DIR / "memories"

# Calendar
CALENDAR_DIR = BACKEND_ROOT / "Calendar" / "Radicale"
RADICALE_CONFIG_PATH = CALENDAR_DIR / "Radicale.conf"
DEFAULT_CALENDAR_JSON = CALENDAR_DIR / "default_calendar.json"

# Logging
LOGS_DIR = BACKEND_ROOT / "logging" / "logs"
