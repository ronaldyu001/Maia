# Compute per-day priority counts for events within a visible range

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import Dict, List

import caldav
from dateutil.rrule import rrulestr

from backend.config.calendar import get_caldav_client
from backend.logging.LoggingWrapper import Logger
from backend.routes.calendar.models import EventItem, GetEventCountsRequest, GetEventCountsResponse, PriorityCounts


def _normalize_datetime(value: object) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime.combine(value, time.min)
    return None


def _priority_bucket(priority: object) -> str:
    try:
        if priority is None:
            return "low"
        numeric = int(priority)
    except (TypeError, ValueError):
        return "low"

    if numeric <= 3:
        return "high"
    if numeric <= 6:
        return "medium"
    return "low"


def _visible_date_bounds(start_dt: datetime, end_dt: datetime) -> tuple[date, date] | None:
    if end_dt <= start_dt:
        return None
    start_date = start_dt.date()
    end_date = end_dt.date()
    if end_dt.time() == time.min:
        end_date = end_date - timedelta(days=1)
    if end_date < start_date:
        return None
    return start_date, end_date


def _event_date_span(start_dt: datetime, end_dt: datetime) -> tuple[date, date]:
    start_date = start_dt.date()
    if end_dt <= start_dt:
        return start_date, start_date
    end_date = end_dt.date()
    if end_dt.time() == time.min:
        end_date = end_date - timedelta(days=1)
    if end_date < start_date:
        end_date = start_date
    return start_date, end_date


def _coerce_range(
    start_dt: datetime,
    end_dt: datetime,
    reference: datetime,
) -> tuple[datetime, datetime]:
    if reference.tzinfo is None and start_dt.tzinfo is not None:
        return start_dt.replace(tzinfo=None), end_dt.replace(tzinfo=None)
    if reference.tzinfo is not None and start_dt.tzinfo is None:
        return start_dt.replace(tzinfo=reference.tzinfo), end_dt.replace(tzinfo=reference.tzinfo)
    return start_dt, end_dt


def _iter_dates(start_date: date, end_date: date) -> list[date]:
    days = []
    current = start_date
    while current <= end_date:
        days.append(current)
        current += timedelta(days=1)
    return days


def _recurrence_duration(dtstart: datetime, dtend: datetime | None) -> timedelta:
    if dtend is None:
        return timedelta(0)
    start_time = _local_time(dtstart) or dtstart.time()
    end_time = _local_time(dtend) or dtend.time()
    start_minutes = start_time.hour * 60 + start_time.minute + start_time.second / 60
    end_minutes = end_time.hour * 60 + end_time.minute + end_time.second / 60
    delta_minutes = end_minutes - start_minutes
    if delta_minutes <= 0:
        delta_minutes += 24 * 60
    return timedelta(minutes=delta_minutes)


def _local_time(value: datetime | None) -> time | None:
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone().time().replace(tzinfo=None)
    return value.time()


def _extract_vevent(ical) -> object | None:
    for component in getattr(ical, "subcomponents", []):
        if getattr(component, "name", None) == "VEVENT":
            return component
    return None


def get_event_counts(req: GetEventCountsRequest) -> GetEventCountsResponse:
    """
    Count event priorities per day for a calendar within a visible range.

    Returns a dict keyed by YYYY-MM-DD with priority counts.
    """
    visible_bounds = _visible_date_bounds(req.range_start, req.range_end)
    if not visible_bounds:
        return {}

    visible_start, visible_end = visible_bounds
    counts: Dict[str, PriorityCounts] = {
        day.isoformat(): PriorityCounts() for day in _iter_dates(visible_start, visible_end)
    }
    event_items: List[EventItem] = []

    try:
        client = get_caldav_client()
        calendar = caldav.Calendar(client=client, url=req.calendar_url)
        events = calendar.date_search(req.range_start, req.range_end, expand=False)
    except Exception as exc:
        Logger.error(f"Failed to fetch events for counts: {exc}")
        raise

    for event in events:
        try:
            ical = event.icalendar_instance
        except Exception:
            continue

        vevent = _extract_vevent(ical)
        if vevent is None:
            continue

        dtstart_prop = vevent.get("dtstart")
        dtend_prop = vevent.get("dtend")
        dtstart = _normalize_datetime(getattr(dtstart_prop, "dt", None))
        dtend = _normalize_datetime(getattr(dtend_prop, "dt", None)) or dtstart
        if dtstart is None or dtend is None:
            continue

        priority_value = vevent.get("priority")
        bucket = _priority_bucket(priority_value)
        summary = str(vevent.get("summary") or "")
        description = str(vevent.get("description") or "") if vevent.get("description") else None
        location = str(vevent.get("location") or "") if vevent.get("location") else None
        uid = str(vevent.get("uid") or "")
        url = str(event.url)
        rrule_prop = vevent.get("rrule")
        if rrule_prop:
            try:
                rrule_str = rrule_prop.to_ical().decode("utf-8")
            except Exception:
                rrule_str = str(rrule_prop)

            try:
                rule = rrulestr(rrule_str, dtstart=dtstart)
                range_start, range_end = _coerce_range(req.range_start, req.range_end, dtstart)
                # Heuristic: if the event end date is later than the start date,
                # treat it as a recurrence cap when RRULE has no explicit UNTIL.
                cap_end = None
                if dtend and dtend.date() > dtstart.date():
                    cap_end = dtend
                if cap_end:
                    range_end = min(range_end, cap_end)
                occurrences = rule.between(range_start, range_end, inc=True)
            except Exception:
                occurrences = []

            duration = _recurrence_duration(dtstart, dtend)
            for occ_start in occurrences:
                occ_date = occ_start.date()
                if occ_date < visible_start or occ_date > visible_end:
                    continue
                occ_end = occ_start + duration
                event_items.append(
                    EventItem(
                        uid=uid,
                        summary=summary,
                        description=description,
                        dtstart=occ_start,
                        dtend=occ_end,
                        timestart=_local_time(occ_start),
                        timeend=_local_time(occ_end),
                        location=location,
                        priority=int(priority_value) if priority_value is not None else None,
                        url=url,
                        rrule_freq=None,
                        rrule_byweekday=None,
                    )
                )
                key = occ_date.isoformat()
                if key not in counts:
                    continue
                if bucket == "high":
                    counts[key].high += 1
                elif bucket == "medium":
                    counts[key].medium += 1
                else:
                    counts[key].low += 1
            continue

        event_start, event_end = _event_date_span(dtstart, dtend)
        if event_end < visible_start or event_start > visible_end:
            continue

        event_items.append(
            EventItem(
                uid=uid,
                summary=summary,
                description=description,
                dtstart=dtstart,
                dtend=dtend,
                timestart=_local_time(dtstart),
                timeend=_local_time(dtend),
                location=location,
                priority=int(priority_value) if priority_value is not None else None,
                url=url,
                rrule_freq=None,
                rrule_byweekday=None,
            )
        )

        start_date = max(event_start, visible_start)
        end_date = min(event_end, visible_end)
        for day in _iter_dates(start_date, end_date):
            key = day.isoformat()
            if key not in counts:
                continue
            if bucket == "high":
                counts[key].high += 1
            elif bucket == "medium":
                counts[key].medium += 1
            else:
                counts[key].low += 1

    event_items.sort(key=lambda item: item.dtstart)
    return GetEventCountsResponse(counts=counts, events=event_items)
