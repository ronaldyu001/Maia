from datetime import datetime


def time_now():
    """
    returns current time in local timezone and ISO format
    """
    return datetime.now().astimezone().isoformat(timespec="seconds")
