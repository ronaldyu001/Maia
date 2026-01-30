# Create a new calendar event

import uuid
from datetime import datetime

import caldav
from icalendar import Calendar, Event

from backend.config.calendar import get_caldav_client
from backend.logging.LoggingWrapper import Logger
from backend.routes.calendar.models import CreateEventRequest, CreateEventResponse, EventItem


def create_event(req: CreateEventRequest) -> CreateEventResponse:
    """
    Create a new event in the specified calendar.

    Args:
        req: CreateEventRequest with calendar_url and event details.

    Returns:
        CreateEventResponse with the created event.
    """
    try:
        client = get_caldav_client()
        calendar = caldav.Calendar(client=client, url=req.calendar_url)

        # Generate unique ID for the event
        event_uid = str(uuid.uuid4())

        # Build iCalendar event
        ical = Calendar()
        ical.add("prodid", "-//Maia//Calendar//EN")
        ical.add("version", "2.0")

        event = Event()
        event.add("uid", event_uid)
        event.add("summary", req.summary)
        event.add("dtstart", req.dtstart)
        event.add("dtend", req.dtend)
        event.add("dtstamp", datetime.utcnow())

        if req.description:
            event.add("description", req.description)
        if req.location:
            event.add("location", req.location)
        if req.priority is not None:
            event.add("priority", req.priority)

        ical.add_component(event)

        # Save to calendar
        created_event = calendar.save_event(ical.to_ical().decode("utf-8"))
        event_url = str(created_event.url)

        Logger.info(f"Created event '{req.summary}' in calendar {req.calendar_url}")

        return CreateEventResponse(
            event=EventItem(
                uid=event_uid,
                summary=req.summary,
                description=req.description,
                dtstart=req.dtstart,
                dtend=req.dtend,
                location=req.location,
                priority=req.priority,
                url=event_url,
            )
        )

    except Exception as e:
        Logger.error(f"Failed to create event: {e}")
        raise
