# List all calendars from Radicale server

from backend.config.calendar import get_caldav_client, get_principal, resolve_calendar_name
from backend.routes.calendar.models import CalendarItem, ListCalendarsResponse
from backend.logging.LoggingWrapper import Logger


def list_calendars() -> ListCalendarsResponse:
    """
    Fetch all calendars from the Radicale server.

    Returns:
        ListCalendarsResponse containing all user calendars.
    """
    try:
        client = get_caldav_client()
        principal = get_principal(client)
        calendars = principal.calendars()

        items = [
            CalendarItem(
                name=resolve_calendar_name(calendar),
                url=str(calendar.url),
            )
            for calendar in calendars
        ]

        Logger.info(f"Listed {len(items)} calendars")
        return ListCalendarsResponse(calendars=items)

    except Exception as e:
        Logger.error(f"Failed to list calendars: {e}")
        return ListCalendarsResponse(calendars=[])
