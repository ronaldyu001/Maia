# Edit an existing calendar event

from datetime import datetime, time
from typing import Optional

import caldav
from icalendar import Calendar

from backend.config.calendar import get_caldav_client
from backend.logging.LoggingWrapper import Logger
from backend.routes.calendar.models import EditEventRequest, EditEventResponse, EventItem


def _local_time(value: datetime | None) -> time | None:
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone().time().replace(tzinfo=None)
    return value.time()




def _get_ical_value(component, prop: str, default=None):
    """Safely extract a value from an iCalendar component."""
    val = component.get(prop)
    if val is None:
        return default
    # Handle properties that return datetime objects directly
    if hasattr(val, "dt"):
        return val.dt
    return str(val) if val else default


def edit_event(req: EditEventRequest) -> EditEventResponse:
    """
    Edit an existing event in the specified calendar.

    Args:
        req: EditEventRequest with event_url, calendar_url, and fields to update.

    Returns:
        EditEventResponse with the updated event.
    """
    try:
        client = get_caldav_client()
        calendar = caldav.Calendar(client=client, url=req.calendar_url)

        # Fetch the existing event
        event = caldav.Event(client=client, url=req.event_url, parent=calendar)
        event.load()

        # Parse the existing iCalendar data
        ical = Calendar.from_ical(event.data)

        # Find the VEVENT component
        vevent = None
        for component in ical.walk():
            if component.name == "VEVENT":
                vevent = component
                break

        if vevent is None:
            raise ValueError("No VEVENT found in calendar data")

        # Extract current values
        current_uid = _get_ical_value(vevent, "uid", "")
        current_summary = _get_ical_value(vevent, "summary", "")
        current_description = _get_ical_value(vevent, "description")
        current_dtstart = _get_ical_value(vevent, "dtstart")
        current_dtend = _get_ical_value(vevent, "dtend")
        current_location = _get_ical_value(vevent, "location")
        current_priority_raw = vevent.get("priority")
        current_priority = int(current_priority_raw) if current_priority_raw is not None else None

        # Apply updates (use new value if provided, else keep current)
        new_summary = req.summary if req.summary is not None else current_summary
        new_description = req.description if req.description is not None else current_description
        new_dtstart = req.dtstart if req.dtstart is not None else current_dtstart
        new_dtend = req.dtend if req.dtend is not None else current_dtend
        new_location = req.location if req.location is not None else current_location
        new_priority = req.priority if req.priority is not None else current_priority

        # Update the VEVENT component
        if "summary" in vevent:
            del vevent["summary"]
        vevent.add("summary", new_summary)

        if "description" in vevent:
            del vevent["description"]
        if new_description:
            vevent.add("description", new_description)

        if "dtstart" in vevent:
            del vevent["dtstart"]
        vevent.add("dtstart", new_dtstart)

        if "dtend" in vevent:
            del vevent["dtend"]
        vevent.add("dtend", new_dtend)

        if "location" in vevent:
            del vevent["location"]
        if new_location:
            vevent.add("location", new_location)

        if "priority" in vevent:
            del vevent["priority"]
        if new_priority is not None:
            vevent.add("priority", new_priority)

        # Update last-modified timestamp
        if "last-modified" in vevent:
            del vevent["last-modified"]
        vevent.add("last-modified", datetime.utcnow())

        # Save the updated event
        event.data = ical.to_ical().decode("utf-8")
        event.save()

        Logger.info(f"Updated event '{new_summary}' at {req.event_url}")

        # Ensure datetime values for response
        dtstart_dt = new_dtstart if isinstance(new_dtstart, datetime) else datetime.combine(new_dtstart, datetime.min.time())
        dtend_dt = new_dtend if isinstance(new_dtend, datetime) else datetime.combine(new_dtend, datetime.min.time())

        return EditEventResponse(
            event=EventItem(
                uid=current_uid,
                summary=new_summary,
                description=new_description,
                dtstart=dtstart_dt,
                dtend=dtend_dt,
                timestart=_local_time(dtstart_dt),
                timeend=_local_time(dtend_dt),
                location=new_location,
                priority=new_priority,
                url=req.event_url,
            )
        )

    except Exception as e:
        Logger.error(f"Failed to edit event: {e}")
        raise
