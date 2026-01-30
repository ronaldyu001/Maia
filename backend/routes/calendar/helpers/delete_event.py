# Delete a calendar event

import caldav

from backend.config.calendar import get_caldav_client
from backend.logging.LoggingWrapper import Logger
from backend.routes.calendar.models import DeleteEventRequest, DeleteEventResponse


def delete_event(req: DeleteEventRequest) -> DeleteEventResponse:
    """
    Delete an event from the specified calendar.

    Args:
        req: DeleteEventRequest with event_url and calendar_url.

    Returns:
        DeleteEventResponse indicating success or failure.
    """
    try:
        client = get_caldav_client()
        calendar = caldav.Calendar(client=client, url=req.calendar_url)

        # Find and delete the event by URL
        event = caldav.Event(client=client, url=req.event_url, parent=calendar)
        event.delete()

        Logger.info(f"Deleted event {req.event_url}")

        return DeleteEventResponse(
            success=True,
            message="Event deleted successfully",
        )

    except caldav.error.NotFoundError:
        Logger.warning(f"Event not found: {req.event_url}")
        return DeleteEventResponse(
            success=False,
            message="Event not found",
        )

    except Exception as e:
        Logger.error(f"Failed to delete event: {e}")
        raise
