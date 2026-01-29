# Set the default calendar preference

import json

from backend.config.calendar import DEFAULT_CALENDAR_PATH
from backend.routes.calendar.models import SetDefaultCalendarResponse
from backend.logging.LoggingWrapper import Logger


def set_default_calendar(calendar_url: str) -> SetDefaultCalendarResponse:
    """
    Set the default calendar URL.

    Args:
        calendar_url: URL of the calendar to set as default.

    Returns:
        SetDefaultCalendarResponse confirming the operation.
    """
    try:
        DEFAULT_CALENDAR_PATH.parent.mkdir(parents=True, exist_ok=True)
        payload = {"calendar_url": calendar_url}
        DEFAULT_CALENDAR_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        Logger.info(f"Set default calendar: {calendar_url}")
        return SetDefaultCalendarResponse(success=True)

    except Exception as e:
        Logger.error(f"Failed to set default calendar: {e}")
        raise
