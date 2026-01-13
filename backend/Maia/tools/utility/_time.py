from datetime import datetime, timezone


def time_now():
    """
    returns current time in utc timezone and ISO format
    """
    return datetime.now(timezone.utc).isoformat(timespec="seconds")