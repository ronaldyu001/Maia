# Get the default calendar preference

import json
from typing import Optional

from backend.config.calendar import DEFAULT_CALENDAR_PATH
from backend.routes.calendar.models import GetDefaultCalendarResponse
from backend.logging.LoggingWrapper import Logger


def get_default_calendar() -> Optional[GetDefaultCalendarResponse]:
    """
    Get the URL of the default calendar.

    Returns:
        GetDefaultCalendarResponse with the default calendar URL, or None if not set.
    """
    if not DEFAULT_CALENDAR_PATH.exists():
        return None

    try:
        raw = DEFAULT_CALENDAR_PATH.read_text(encoding="utf-8").strip()
        if not raw:
            return None

        payload = json.loads(raw)
        calendar_url = payload.get("calendar_url")

        if not calendar_url:
            return None

        return GetDefaultCalendarResponse(calendar_url=calendar_url)

    except json.JSONDecodeError as e:
        Logger.warning(f"Invalid default calendar JSON: {e}")
        return None
    except Exception as e:
        Logger.error(f"Failed to read default calendar: {e}")
        return None
