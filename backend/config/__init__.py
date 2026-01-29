# Backend configuration module
# Centralizes all configuration for the application

from .calendar import (
    RADICALE_URL,
    RADICALE_USERNAME,
    RADICALE_PASSWORD,
    DEFAULT_CALENDAR_PATH,
    get_caldav_client,
    get_principal,
)
from .paths import (
    BACKEND_ROOT,
    CONVERSATIONS_DIR,
    VECTOR_STORES_DIR,
    PREV_SESSION_ID_PATH,
    LAST_EMBEDDED_PATH,
)

__all__ = [
    # Calendar
    "RADICALE_URL",
    "RADICALE_USERNAME",
    "RADICALE_PASSWORD",
    "DEFAULT_CALENDAR_PATH",
    "get_caldav_client",
    "get_principal",
    # Paths
    "BACKEND_ROOT",
    "CONVERSATIONS_DIR",
    "VECTOR_STORES_DIR",
    "PREV_SESSION_ID_PATH",
    "LAST_EMBEDDED_PATH",
]
