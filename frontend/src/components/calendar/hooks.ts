// Calendar-specific hooks

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import type { EventCounts, EventListItem } from "./types";

const EVENT_COUNTS_URL = "http://127.0.0.1:8000/calendar/get_event_counts";

async function fetchCountsAndEvents(
  calendarUrl: string,
  rangeStart: Date,
  rangeEnd: Date,
) {
  const response = await axios.post(EVENT_COUNTS_URL, {
    calendar_url: calendarUrl,
    range_start: rangeStart.toISOString(),
    range_end: rangeEnd.toISOString(),
  });
  return response.data as { counts?: EventCounts; events?: EventListItem[] };
}

export function useCalendarRange() {
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [viewType, setViewType] = useState("dayGridMonth");

  const handleDatesSet = useCallback((info: { start: Date; end: Date; view: { type: string } }) => {
    setRangeStart(info.start);
    setRangeEnd(info.end);
    setViewType(info.view.type);
  }, []);

  return { rangeStart, rangeEnd, viewType, handleDatesSet };
}

export function useEventCounts(
  calendarUrl: string,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  viewType: string,
  refreshToken: number = 0,
) {
  const [counts, setCounts] = useState<EventCounts>({});
  const [loading, setLoading] = useState(false);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!calendarUrl || !rangeStart || !rangeEnd || viewType !== "dayGridMonth") {
      setCounts({});
      lastKeyRef.current = null;
      return;
    }

    const key = `${calendarUrl}-${rangeStart.toISOString()}-${rangeEnd.toISOString()}-${viewType}-${refreshToken}`;
    if (lastKeyRef.current === key) {
      return;
    }
    lastKeyRef.current = key;

    let isActive = true;
    setLoading(true);

    fetchCountsAndEvents(calendarUrl, rangeStart, rangeEnd)
      .then((response) => {
        if (!isActive) return;
        setCounts(response?.counts ?? {});
      })
      .catch((err) => {
        if (!isActive) return;
        console.error("Failed to fetch event counts:", err);
        setCounts({});
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [calendarUrl, rangeStart, rangeEnd, viewType, refreshToken]);

  return { counts, loading };
}

export function useRangeEvents(
  calendarUrl: string,
  rangeStart: Date | null,
  rangeEnd: Date | null,
  viewType: string,
  refreshToken: number = 0,
) {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!calendarUrl || !rangeStart || !rangeEnd || viewType === "dayGridMonth") {
      setEvents([]);
      lastKeyRef.current = null;
      return;
    }

    const key = `${calendarUrl}-${rangeStart.toISOString()}-${rangeEnd.toISOString()}-${viewType}-${refreshToken}`;
    if (lastKeyRef.current === key) {
      return;
    }
    lastKeyRef.current = key;

    let isActive = true;
    setLoading(true);

    fetchCountsAndEvents(calendarUrl, rangeStart, rangeEnd)
      .then((response) => {
        if (!isActive) return;
        setEvents(response?.events ?? []);
      })
      .catch((err) => {
        if (!isActive) return;
        console.error("Failed to fetch range events:", err);
        setEvents([]);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [calendarUrl, rangeStart, rangeEnd, viewType, refreshToken]);

  return { events, loading };
}
