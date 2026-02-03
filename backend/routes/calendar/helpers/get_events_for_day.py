# Fetch events for a single day filtered by priority bucket

from __future__ import annotations

from datetime import datetime, time, timedelta
from typing import List

import caldav
from dateutil.rrule import rrulestr

from backend.config.calendar import get_caldav_client
from backend.logging.LoggingWrapper import Logger
from backend.routes.calendar.helpers.get_event_counts import (
    _coerce_range,
    _normalize_datetime,
    _priority_bucket,
)
from backend.routes.calendar.models import EventItem, GetEventsForDayRequest, GetEventsForDayResponse


def _extract_vevent(ical) -> object | None:
    for component in getattr(ical, "subcomponents", []):
        if getattr(component, "name", None) == "VEVENT":
            return component
    return None


def _priority_matches(bucket: str, wanted: str | None) -> bool:
    if not wanted:
        return True
    return bucket == wanted


def _parse_rrule(rrule_prop) -> tuple[str | None, list[str] | None]:
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


def get_events_for_day(req: GetEventsForDayRequest) -> GetEventsForDayResponse:
    day_start = datetime.combine(req.date, time.min)
    day_end = day_start + timedelta(days=1)
    results: List[EventItem] = []

    try:
        client = get_caldav_client()
        calendar = caldav.Calendar(client=client, url=req.calendar_url)
        events = calendar.date_search(day_start, day_end, expand=False)
    except Exception as exc:
        Logger.error(f"Failed to fetch events for day: {exc}")
        raise

    for event in events:
        try:
            ical = event.icalendar_instance
        except Exception:
            continue

        vevent = _extract_vevent(ical)
        if vevent is None:
            continue

        dtstart = _normalize_datetime(getattr(vevent.get("dtstart"), "dt", None))
        dtend = _normalize_datetime(getattr(vevent.get("dtend"), "dt", None)) or dtstart
        if dtstart is None or dtend is None:
            continue

        priority_value = vevent.get("priority")
        bucket = _priority_bucket(priority_value)
        if not _priority_matches(bucket, req.priority):
            continue

        summary = str(vevent.get("summary") or "")
        description = str(vevent.get("description") or "") if vevent.get("description") else None
        location = str(vevent.get("location") or "") if vevent.get("location") else None
        uid = str(vevent.get("uid") or "")
        url = str(event.url)

        rrule_prop = vevent.get("rrule")
        rrule_freq, rrule_byweekday = _parse_rrule(rrule_prop)
        if rrule_prop:
            try:
                rrule_str = rrule_prop.to_ical().decode("utf-8")
            except Exception:
                rrule_str = str(rrule_prop)

            try:
                rule = rrulestr(rrule_str, dtstart=dtstart)
                range_start, range_end = _coerce_range(day_start, day_end, dtstart)
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
                occ_end = occ_start + duration
                results.append(
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
                        rrule_freq=rrule_freq,
                        rrule_byweekday=rrule_byweekday,
                    )
                )
            continue

        if dtend <= day_start or dtstart >= day_end:
            continue

        results.append(
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
                rrule_freq=rrule_freq,
                rrule_byweekday=rrule_byweekday,
            )
        )

    results.sort(key=lambda item: item.dtstart)
    return GetEventsForDayResponse(events=results)
