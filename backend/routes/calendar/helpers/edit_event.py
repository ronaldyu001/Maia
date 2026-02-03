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


def _parse_rrule(rrule_prop) -> tuple[Optional[str], Optional[list[str]]]:
    if not rrule_prop:
        return None, None
    try:
        if hasattr(rrule_prop, "get"):
            freq_val = rrule_prop.get("FREQ")
            byday_val = rrule_prop.get("BYDAY")
            if isinstance(freq_val, (list, tuple)):
                freq_val = freq_val[0] if freq_val else None
            if isinstance(byday_val, (list, tuple)):
                byday = [str(day).upper() for day in byday_val]
            elif byday_val:
                byday = [part.strip().upper() for part in str(byday_val).split(",") if part.strip()]
            else:
                byday = None
            freq = str(freq_val).lower() if freq_val else None
            return freq, byday
        if hasattr(rrule_prop, "to_ical"):
            rrule_str = rrule_prop.to_ical().decode("utf-8")
        else:
            rrule_str = str(rrule_prop)
        parts = dict(part.split("=", 1) for part in rrule_str.split(";") if "=" in part)
        freq = parts.get("FREQ") or parts.get("freq")
        byday = parts.get("BYDAY") or parts.get("byday")
        byweekday = [d.strip().upper() for d in byday.split(",")] if byday else None
        return freq.lower() if freq else None, byweekday
    except Exception:
        return None, None



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
        current_rrule = vevent.get("rrule")
        current_rrule_freq, current_rrule_byweekday = _parse_rrule(current_rrule)
        current_priority = int(current_priority_raw) if current_priority_raw is not None else None

        # Apply updates (use new value if provided, else keep current)
        new_summary = req.summary if req.summary is not None else current_summary
        new_description = req.description if req.description is not None else current_description
        new_dtstart = req.dtstart if req.dtstart is not None else current_dtstart
        new_dtend = req.dtend if req.dtend is not None else current_dtend
        new_location = req.location if req.location is not None else current_location
        new_priority = req.priority if req.priority is not None else current_priority
        new_rrule_freq = req.rrule_freq if req.rrule_freq is not None else current_rrule_freq
        new_rrule_byweekday = (
            req.rrule_byweekday if req.rrule_byweekday is not None else current_rrule_byweekday
        )

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

        fields_set = getattr(req, "__fields_set__", getattr(req, "model_fields_set", set()))
        if "rrule_freq" in fields_set or "rrule_byweekday" in fields_set:
            if "rrule" in vevent:
                del vevent["rrule"]
            if new_rrule_freq:
                rrule: dict[str, object] = {"FREQ": new_rrule_freq.upper()}
                if new_rrule_byweekday:
                    rrule["BYDAY"] = [day.upper() for day in new_rrule_byweekday]
                vevent.add("rrule", rrule)

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
                rrule_freq=new_rrule_freq,
                rrule_byweekday=new_rrule_byweekday,
            )
        )

    except Exception as e:
        Logger.error(f"Failed to edit event: {e}")
        raise
