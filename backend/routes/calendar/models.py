# Centralized Pydantic models for calendar routes
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# =============================================================================
# Calendar Models
# =============================================================================

class CalendarItem(BaseModel):
    """Represents a single calendar."""
    name: str
    url: str


class ListCalendarsResponse(BaseModel):
    """Response for listing all calendars."""
    calendars: List[CalendarItem]


class CreateCalendarRequest(BaseModel):
    """Request to create a new calendar."""
    calendar_name: str


class CreateCalendarResponse(BaseModel):
    """Response after creating a calendar."""
    calendar_name: str


class DeleteCalendarRequest(BaseModel):
    """Request to delete a calendar."""
    calendar_name: str


class DeleteCalendarResponse(BaseModel):
    """Response after deleting a calendar."""
    success: bool
    message: str


class GetDefaultCalendarResponse(BaseModel):
    """Response containing the default calendar URL."""
    calendar_url: Optional[str]


class SetDefaultCalendarRequest(BaseModel):
    """Request to set the default calendar."""
    calendar_url: str


class SetDefaultCalendarResponse(BaseModel):
    """Response after setting the default calendar."""
    success: bool


# =============================================================================
# Event Models
# =============================================================================

class EventItem(BaseModel):
    """Represents a calendar event."""
    uid: str
    summary: str
    description: Optional[str] = None
    dtstart: datetime
    dtend: datetime
    location: Optional[str] = None
    url: str


class CreateEventRequest(BaseModel):
    """Request to create a new event."""
    calendar_url: str
    summary: str
    description: Optional[str] = None
    dtstart: datetime
    dtend: datetime
    location: Optional[str] = None


class CreateEventResponse(BaseModel):
    """Response after creating an event."""
    event: EventItem


class DeleteEventRequest(BaseModel):
    """Request to delete an event."""
    event_url: str
    calendar_url: str


class DeleteEventResponse(BaseModel):
    """Response after deleting an event."""
    success: bool
    message: str


class EditEventRequest(BaseModel):
    """Request to edit an event."""
    event_url: str
    calendar_url: str
    summary: Optional[str] = None
    description: Optional[str] = None
    dtstart: Optional[datetime] = None
    dtend: Optional[datetime] = None
    location: Optional[str] = None


class EditEventResponse(BaseModel):
    """Response after editing an event."""
    event: EventItem
