# Centralized Pydantic models for calendar routes
from typing import List, Optional

from pydantic import BaseModel


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
