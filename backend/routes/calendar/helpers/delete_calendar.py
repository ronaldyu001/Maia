# Delete a calendar from the Radicale server

from backend.config.calendar import get_caldav_client, get_principal, resolve_calendar_name
from backend.logging.LoggingWrapper import Logger


def delete_calendar(calendar_name: str) -> bool:
    """
    Delete a calendar by name.

    Args:
        calendar_name: Name of the calendar to delete.

    Returns:
        True if calendar was found and deleted, False otherwise.
    """
    try:
        client = get_caldav_client()
        principal = get_principal(client)
        calendars = principal.calendars()

        for calendar in calendars:
            name = resolve_calendar_name(calendar)
            if name == calendar_name:
                calendar.delete()
                Logger.info(f"Deleted calendar: {calendar_name}")
                return True

        Logger.warning(f"Calendar not found for deletion: {calendar_name}")
        return False

    except Exception as e:
        Logger.error(f"Failed to delete calendar '{calendar_name}': {e}")
        raise
