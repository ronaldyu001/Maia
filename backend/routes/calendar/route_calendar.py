# Calendar routes for managing CalDAV calendars via Radicale

from typing import Optional

from fastapi import APIRouter

from backend.routes.calendar.models import (
    CreateCalendarRequest,
    CreateCalendarResponse,
    DeleteCalendarRequest,
    DeleteCalendarResponse,
    GetDefaultCalendarResponse,
    ListCalendarsResponse,
    SetDefaultCalendarRequest,
    SetDefaultCalendarResponse,
)
from backend.routes.calendar.helpers.create_calendar import create_calendar
from backend.routes.calendar.helpers.delete_calendar import delete_calendar
from backend.routes.calendar.helpers.get_default_calendar import get_default_calendar
from backend.routes.calendar.helpers.list_calendars import list_calendars
from backend.routes.calendar.helpers.set_default_calendar import set_default_calendar


router = APIRouter(prefix="/calendar", tags=["calendar"])


# POST routes
@router.post("/create_calendar", response_model=CreateCalendarResponse)
def create_calendar_route(req: CreateCalendarRequest) -> CreateCalendarResponse:
    """Create a new calendar."""
    create_calendar(req.calendar_name)
    return CreateCalendarResponse(calendar_name=req.calendar_name)


@router.post("/delete_calendar", response_model=DeleteCalendarResponse)
def delete_calendar_route(req: DeleteCalendarRequest) -> DeleteCalendarResponse:
    """Delete a calendar by name."""
    deleted = delete_calendar(req.calendar_name)
    return DeleteCalendarResponse(
        success=deleted,
        message=f"Calendar '{req.calendar_name}' deleted" if deleted else "Calendar not found",
    )


@router.post("/set_default_calendar", response_model=SetDefaultCalendarResponse)
def set_default_calendar_route(req: SetDefaultCalendarRequest) -> SetDefaultCalendarResponse:
    """Set the default calendar."""
    return set_default_calendar(req.calendar_url)


# GET routes
@router.get("/list_calendars", response_model=ListCalendarsResponse)
def list_calendars_route() -> ListCalendarsResponse:
    """List all calendars."""
    return list_calendars()


@router.get("/get_default_calendar", response_model=Optional[GetDefaultCalendarResponse])
def get_default_calendar_route() -> Optional[GetDefaultCalendarResponse]:
    """Get the default calendar URL."""
    return get_default_calendar()
