# Create a new calendar on the Radicale server

from backend.config.calendar import get_caldav_client, get_principal
from backend.logging.LoggingWrapper import Logger


def create_calendar(calendar_name: str) -> None:
    """
    Create a new calendar with the given name.

    Args:
        calendar_name: Display name for the new calendar.

    Raises:
        Exception: If calendar creation fails.
    """
    try:
        client = get_caldav_client()
        principal = get_principal(client)
        new_cal = principal.make_calendar(name=calendar_name)
        Logger.info(f"Created calendar: {new_cal.url}")

    except Exception as e:
        Logger.error(f"Failed to create calendar '{calendar_name}': {e}")
        raise
