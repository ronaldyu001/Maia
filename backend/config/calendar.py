# Calendar (Radicale) configuration
# Centralizes CalDAV client setup and credentials

import os
from pathlib import Path
from typing import Optional

import caldav

# Radicale server configuration
# TODO: Move to environment variables for production
RADICALE_URL = os.getenv("RADICALE_URL", "http://localhost:5232")
RADICALE_USERNAME = os.getenv("RADICALE_USERNAME", "ronald")
RADICALE_PASSWORD = os.getenv("RADICALE_PASSWORD", "lazb3c4d")

# Default calendar preference file
DEFAULT_CALENDAR_PATH = (
    Path(__file__).resolve().parents[1] / "Calendar" / "Radicale" / "default_calendar.json"
)


def get_caldav_client() -> caldav.DAVClient:
    """Create a configured CalDAV client for Radicale."""
    return caldav.DAVClient(
        url=RADICALE_URL,
        username=RADICALE_USERNAME,
        password=RADICALE_PASSWORD,
    )


def get_principal(client: Optional[caldav.DAVClient] = None) -> caldav.Principal:
    """
    Get the CalDAV principal for the configured user.

    Args:
        client: Optional existing client. If None, creates a new one.

    Returns:
        caldav.Principal configured for the user's calendar home.
    """
    if client is None:
        client = get_caldav_client()

    principal_url = f"{RADICALE_URL.rstrip('/')}/{RADICALE_USERNAME}/"
    principal = client.principal(url=principal_url)
    principal.calendar_home_set = principal_url
    return principal


def resolve_calendar_name(calendar: caldav.Calendar) -> str:
    """
    Extract the display name from a calendar, falling back to URL slug.

    Args:
        calendar: CalDAV calendar object.

    Returns:
        Human-readable calendar name.
    """
    display_name: Optional[str] = None
    try:
        display_prop = calendar.get_display_name()
        if display_prop is not None:
            display_name = (
                display_prop.text
                if hasattr(display_prop, "text")
                else str(display_prop)
            )
    except Exception:
        display_name = None

    if display_name:
        return display_name

    url_str = str(calendar.url)
    return url_str.rstrip("/").split("/")[-1] or url_str
