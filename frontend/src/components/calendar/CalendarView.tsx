// Main calendar view with FullCalendar display

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import tokens from "../../tokens";
import { Dropdown } from "./Dropdown";
import {
  CoffeeIcon,
  CalendarListIcon,
  ChevronIcon,
  CheckIcon,
  MoreIcon,
  PlusIcon,
  EventIcon,
  EditIcon,
  StarIcon,
} from "../shared/icons";
import { MONTH_LABELS } from "./constants";
import { daysInMonth } from "./helpers";
import { useCalendarRange, useEventCounts, useRangeEvents } from "./hooks";
import { CreateEventModal } from "./CreateEventModal";
import { calendarStyles } from "./calendarStyles";
import type { CalendarItem, EventListItem, PriorityCounts, Priority } from "./types";

interface CalendarViewProps {
  selectedCalendar: CalendarItem;
  onCalendarSelect: (calendar: CalendarItem | null) => void;
  onAddCalendar: () => void;
  defaultCalendarUrl: string | null;
  onDefaultCalendarChange: (url: string | null) => void;
}

export default function CalendarView({
  selectedCalendar,
  onCalendarSelect,
  onAddCalendar,
  defaultCalendarUrl,
  onDefaultCalendarChange,
}: CalendarViewProps) {
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  // Popup states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isContextVisible, setIsContextVisible] = useState(false);
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [isEventsPopupVisible, setIsEventsPopupVisible] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  // Hover states
  const [tabHover, setTabHover] = useState(false);
  const [eventsTabHover, setEventsTabHover] = useState(false);
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null);
  const [hoveredMoreBtn, setHoveredMoreBtn] = useState<string | null>(null);
  const [hoveredEventOption, setHoveredEventOption] = useState<string | null>(null);

  // Context menu
  const [contextCalendar, setContextCalendar] = useState<CalendarItem | null>(null);
  const [contextPos, setContextPos] = useState({ right: 0, y: 0 });
  const [isCountPopupOpen, setIsCountPopupOpen] = useState(false);
  const [isCountPopupVisible, setIsCountPopupVisible] = useState(false);
  const [countPopupItems, setCountPopupItems] = useState<EventListItem[]>([]);
  const [countPopupTitle, setCountPopupTitle] = useState("");
  const [countPopupLoading, setCountPopupLoading] = useState(false);
  const [countPopupError, setCountPopupError] = useState<string | null>(null);
  const [eventRefreshToken, setEventRefreshToken] = useState(0);
  const [isCalendarTransitioning, setIsCalendarTransitioning] = useState(false);
  const [calendarSlideDirection, setCalendarSlideDirection] = useState<"next" | "prev">("next");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  // Refs
  const popupRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const eventsPopupRef = useRef<HTMLDivElement>(null);
  const countPopupRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);
  const eventsTabRef = useRef<HTMLButtonElement>(null);
  const calendarTransitionRef = useRef<number | null>(null);
  const prevRangeStartRef = useRef<Date | null>(null);
  const prevViewTypeRef = useRef<string | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);

  // Transition timings
  const transitionMs = 200;
  const contextTransitionMs = 180;
  const countPopupTransitionMs = 200;
  const calendarTransitionMs = 800;

  // Calendar range and event counts
  const { rangeStart, rangeEnd, viewType, handleDatesSet } = useCalendarRange();
  const { counts: eventCounts } = useEventCounts(
    selectedCalendar.url,
    rangeStart,
    rangeEnd,
    viewType,
    eventRefreshToken
  );
  const { events: rangeEvents } = useRangeEvents(
    selectedCalendar.url,
    rangeStart,
    rangeEnd,
    viewType,
    eventRefreshToken
  );

  const monthOptions = useMemo(
    () => MONTH_LABELS.map((label, value) => ({ label, value })),
    []
  );

  const yearOptions = useMemo(() => {
    const startYear = currentYear - 4;
    return Array.from({ length: 9 }, (_, index) => {
      const year = startYear + index;
      return { label: String(year), value: year };
    });
  }, [currentYear]);

  // Fetch calendars
  async function fetchCalendars() {
    setLoadingCalendars(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/calendar/list_calendars");
      const items = response.data.calendars ?? [];
      setCalendars(items);
      return items as CalendarItem[];
    } catch {
      console.error("Failed to fetch calendars");
      return [] as CalendarItem[];
    } finally {
      setLoadingCalendars(false);
    }
  }

  useEffect(() => {
    fetchCalendars();
  }, []);

  // Popup visibility effects
  useEffect(() => {
    if (isPopupOpen) {
      requestAnimationFrame(() => setIsPopupVisible(true));
    } else {
      setIsPopupVisible(false);
    }
  }, [isPopupOpen]);

  useEffect(() => {
    if (isContextOpen) {
      requestAnimationFrame(() => setIsContextVisible(true));
    } else {
      setIsContextVisible(false);
    }
  }, [isContextOpen]);

  useEffect(() => {
    if (isEventsPopupOpen) {
      requestAnimationFrame(() => setIsEventsPopupVisible(true));
    } else {
      setIsEventsPopupVisible(false);
    }
  }, [isEventsPopupOpen]);

  useEffect(() => {
    if (isCountPopupOpen) {
      requestAnimationFrame(() => setIsCountPopupVisible(true));
    } else {
      setIsCountPopupVisible(false);
    }
  }, [isCountPopupOpen]);

  useEffect(() => {
    return () => {
      if (calendarTransitionRef.current) {
        window.clearTimeout(calendarTransitionRef.current);
      }
    };
  }, []);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isCountPopupOpen) return;
      if (contextRef.current?.contains(event.target as Node)) return;
      if (event.button === 2) return;
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        tabRef.current &&
        !tabRef.current.contains(event.target as Node)
      ) {
        closePopup();
      }
    }
    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopupOpen, isCountPopupOpen]);

  useEffect(() => {
    function handleContextOutside(event: MouseEvent) {
      if (isCountPopupOpen) return;
      if (event.button !== 0) return;
      if (contextRef.current && !contextRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    }
    if (isContextOpen) {
      document.addEventListener("mousedown", handleContextOutside);
    }
    return () => document.removeEventListener("mousedown", handleContextOutside);
  }, [isContextOpen, isCountPopupOpen]);

  useEffect(() => {
    function handleEventsClickOutside(event: MouseEvent) {
      if (isCountPopupOpen) return;
      if (
        eventsPopupRef.current &&
        !eventsPopupRef.current.contains(event.target as Node) &&
        eventsTabRef.current &&
        !eventsTabRef.current.contains(event.target as Node)
      ) {
        closeEventsPopup();
      }
    }
    if (isEventsPopupOpen) {
      document.addEventListener("mousedown", handleEventsClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleEventsClickOutside);
  }, [isEventsPopupOpen, isCountPopupOpen]);

  // Popup controls
  function togglePopup() {
    if (isPopupOpen) {
      closePopup();
    } else {
      fetchCalendars();
      setIsPopupOpen(true);
    }
  }

  function closePopup() {
    setIsPopupVisible(false);
    setTimeout(() => setIsPopupOpen(false), transitionMs);
  }

  function toggleEventsPopup() {
    if (isEventsPopupOpen) {
      closeEventsPopup();
    } else {
      setIsEventsPopupOpen(true);
    }
  }

  function closeEventsPopup() {
    setIsEventsPopupVisible(false);
    setTimeout(() => setIsEventsPopupOpen(false), transitionMs);
  }

  const triggerCalendarTransition = useCallback(
    (direction: "next" | "prev") => {
      setCalendarSlideDirection(direction);
      setIsCalendarTransitioning(true);
      if (calendarTransitionRef.current) {
        window.clearTimeout(calendarTransitionRef.current);
      }
      calendarTransitionRef.current = window.setTimeout(() => {
        setIsCalendarTransitioning(false);
      }, calendarTransitionMs);
    },
    [calendarTransitionMs]
  );

  function openContextMenu(event: React.MouseEvent, calendar: CalendarItem) {
    event.preventDefault();
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const menuHeight = 140;
    const padding = 8;
    const rightPos = window.innerWidth - rect.right;
    let y = rect.bottom + 8;
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    if (y < padding) y = padding;
    setContextCalendar(calendar);
    setContextPos({ right: rightPos, y });
    setIsContextOpen(true);
  }

  function closeContextMenu() {
    setIsContextVisible(false);
    setTimeout(() => {
      setIsContextOpen(false);
      setContextCalendar(null);
    }, contextTransitionMs);
  }

  function closeCountPopup() {
    setIsCountPopupVisible(false);
    setTimeout(() => setIsCountPopupOpen(false), countPopupTransitionMs);
  }

  function formatDateDisplay(dateValue: Date) {
    return dateValue.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatEventTime(item: EventListItem) {
    const parseTime = (value?: string | null) => {
      if (!value) return null;
      const [hour, minute, second] = value.split(":").map((part) => Number(part));
      if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
      const date = new Date();
      date.setHours(hour, minute, Number.isNaN(second) ? 0 : second, 0);
      return date;
    };

    const timeStart = parseTime(item.timestart);
    const timeEnd = parseTime(item.timeend);
    const start = timeStart ?? new Date(item.dtstart);
    const end = timeEnd ?? new Date(item.dtend);
    const isAllDay =
      !item.timestart &&
      !item.timeend &&
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      end.getTime() > start.getTime();

    if (isAllDay) {
      return "All day";
    }

    const fmt: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
    };
    return `${start.toLocaleTimeString([], fmt)} – ${end.toLocaleTimeString([], fmt)}`;
  }

  async function openCountPopup(dateValue: Date, priority: Priority) {
    const label = priority === "high" ? "High" : priority === "medium" ? "Med" : "Low";
    setCountPopupTitle(`${label} priority · ${formatDateDisplay(dateValue)}`);
    setCountPopupItems([]);
    setCountPopupError(null);
    setCountPopupLoading(true);
    setIsCountPopupOpen(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/calendar/get_events_for_day", {
        calendar_url: selectedCalendar.url,
        date: dateValue.toISOString().split("T")[0],
        priority,
      });
      setCountPopupItems(response.data?.events ?? []);
    } catch (err) {
      console.error("Failed to fetch events for day:", err);
      setCountPopupError("Could not load events. Please try again.");
    } finally {
      setCountPopupLoading(false);
    }
  }

  function handleCalendarClick(calendar: CalendarItem) {
    onCalendarSelect(calendar);
    closePopup();
  }

  async function handleDeleteCalendar() {
    if (!contextCalendar) return;
    try {
      await axios.post("http://127.0.0.1:8000/calendar/delete_calendar", {
        calendar_name: contextCalendar.name,
      });
      const updated = await fetchCalendars();
      if (defaultCalendarUrl && !updated.some((c) => c.url === defaultCalendarUrl)) {
        onDefaultCalendarChange(null);
      }
      if (updated.length === 0) {
        onCalendarSelect(null);
      } else if (contextCalendar.url === selectedCalendar.url) {
        onCalendarSelect(updated[0]);
      }
    } catch {
      console.error("Failed to delete calendar");
    } finally {
      closeContextMenu();
    }
  }

  async function handleSetDefaultCalendar() {
    if (!contextCalendar) return;
    try {
      await axios.post("http://127.0.0.1:8000/calendar/set_default_calendar", {
        calendar_url: contextCalendar.url,
      });
      onDefaultCalendarChange(contextCalendar.url);
    } catch {
      console.error("Failed to set default calendar");
    } finally {
      closeContextMenu();
    }
  }

  // Event count display helpers
  const getTotalCountLabel = useCallback(
    (dateKey?: string | null, fallback?: number) => {
      if (dateKey) {
        const counts = eventCounts[dateKey];
        if (counts) {
          const total = counts.high + counts.medium + counts.low;
          return `${total} events`;
        }
      }
      if (typeof fallback === "number") return `${fallback} events`;
      return "";
    },
    [eventCounts]
  );

  const renderMoreLinkContent = useCallback(() => "", []);

  const handleDatesSetWithTransition = useCallback(
    (info: { start: Date; end: Date; view: { type: string } }) => {
      if (prevRangeStartRef.current) {
        let direction: "next" | "prev" = calendarSlideDirection;
        if (info.start > prevRangeStartRef.current) {
          direction = "next";
        } else if (info.start < prevRangeStartRef.current) {
          direction = "prev";
        } else if (prevViewTypeRef.current && prevViewTypeRef.current !== info.view.type) {
          direction = "next";
        }
        triggerCalendarTransition(direction);
      }
      prevRangeStartRef.current = info.start;
      prevViewTypeRef.current = info.view.type;
      const activeDate = calendarRef.current?.getApi().getDate() ?? info.start;
      setCurrentDate(activeDate);
      setCurrentMonth(activeDate.getMonth());
      setCurrentYear(activeDate.getFullYear());
      handleDatesSet(info);
    },
    [calendarSlideDirection, handleDatesSet, triggerCalendarTransition]
  );

  const handleEventCreated = useCallback(() => {
    setEventRefreshToken((prev) => prev + 1);
  }, []);

  const handleMonthChange = useCallback(
    (value: string | number) => {
      const month = Number(value);
      const day = Math.min(currentDate.getDate(), daysInMonth(currentYear, month));
      const nextDate = new Date(currentYear, month, day);
      setCurrentMonth(month);
      setCurrentDate(nextDate);
      calendarRef.current?.getApi().gotoDate(nextDate);
    },
    [currentDate, currentYear]
  );

  const handleYearChange = useCallback(
    (value: string | number) => {
      const year = Number(value);
      const day = Math.min(currentDate.getDate(), daysInMonth(year, currentMonth));
      const nextDate = new Date(year, currentMonth, day);
      setCurrentYear(year);
      setCurrentDate(nextDate);
      calendarRef.current?.getApi().gotoDate(nextDate);
    },
    [currentDate, currentMonth]
  );

  const handlePrevRange = useCallback(() => {
    calendarRef.current?.getApi().prev();
  }, []);

  const handleNextRange = useCallback(() => {
    calendarRef.current?.getApi().next();
  }, []);

  const handleViewChange = useCallback((nextView: string) => {
    calendarRef.current?.getApi().changeView(nextView);
  }, []);

  const handleMoreLinkDidMount = useCallback(
    (args: { el: HTMLElement; num: number; view: { type: string } }) => {
      if (args.view.type !== "dayGridMonth") {
        args.el.textContent = getTotalCountLabel(null, args.num);
        return;
      }
      const dayEl = args.el.closest(".fc-daygrid-day") as HTMLElement | null;
      const dateKey = dayEl?.getAttribute("data-date");
      const label = getTotalCountLabel(dateKey, args.num);
      if (label) args.el.textContent = label;
    },
    [getTotalCountLabel]
  );

  const renderDayCellContent = useCallback(
    (arg: { dayNumberText: string }) => (
      <span style={{ fontFamily: tokens.fonts.elegant, fontSize: 15, fontWeight: 500 }}>
        {arg.dayNumberText}
      </span>
    ),
    []
  );

  const renderEventContent = useCallback((arg: { event: any }) => {
    const kind = arg.event.extendedProps?.kind;
    if (kind === "counts") {
      const counts = arg.event.extendedProps?.counts as PriorityCounts | undefined;
      if (!counts) return null;
      const dateValue = arg.event.start ? new Date(arg.event.start) : null;
      return (
        <div
          style={{
            display: "grid",
            gridTemplateRows: "repeat(3, minmax(0, auto))",
            gap: 6,
            fontFamily: tokens.fonts.sans,
            fontSize: 12,
            textAlign: "left",
            width: "100%",
          }}
        >
          {[
            { label: "High", value: counts.high, bg: "rgba(196, 96, 72, 0.2)", color: "#d9a093", bucket: "high" },
            {
              label: "Med",
              value: counts.medium,
              bg: "rgba(212, 165, 116, 0.22)",
              color: tokens.colors.accent,
              bucket: "medium",
            },
            {
              label: "Low",
              value: counts.low,
              bg: "rgba(180, 140, 120, 0.18)",
              color: tokens.colors.textSecondary,
              bucket: "low",
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (!dateValue || item.value === 0) return;
                openCountPopup(dateValue, item.bucket as Priority);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: tokens.radius.sm,
                background: item.bg,
                color: item.color,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
                border: "none",
                cursor: item.value === 0 ? "default" : "pointer",
                opacity: item.value === 0 ? 0.55 : 1,
              }}
            >
              <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.6 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, fontFamily: tokens.fonts.elegant }}>
                {item.value}
              </span>
            </button>
          ))}
        </div>
      );
    }
    return (
      <div
        style={{
          padding: "2px 4px",
          fontFamily: tokens.fonts.elegant,
          fontSize: 12,
          color: tokens.colors.background,
          letterSpacing: 0.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={arg.event.title}
      >
        {arg.event.title}
      </div>
    );
  }, [openCountPopup]);

  const countEvents = useMemo(() => {
    if (viewType !== "dayGridMonth") return [];
    return Object.entries(eventCounts)
      .filter(([, counts]) => counts.high + counts.medium + counts.low > 0)
      .map(([date, counts]) => ({
        id: `counts-${date}`,
        start: date,
        allDay: true,
        title: "",
        display: "block",
        editable: false,
        className: ["calendar-counts-event"],
        extendedProps: { kind: "counts", counts },
      }));
  }, [eventCounts, viewType]);

  const rangeCalendarEvents = useMemo(
    () =>
      rangeEvents
        .map((event) => {
          const dtstartRaw = event.dtstart ?? "";
          const isDateOnlyStart = /^\d{4}-\d{2}-\d{2}$/.test(dtstartRaw);
          const hasTimeFields = Boolean(event.timestart || event.timeend);

          const parseDate = (value?: string | null) => {
            if (!value) return null;
            let normalized = value;
            if (/^\d{4}-\d{2}-\d{2} /.test(normalized)) {
              normalized = normalized.replace(" ", "T");
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
              normalized = `${normalized}T00:00:00`;
            }
            let parsed = new Date(normalized);
            if (!Number.isNaN(parsed.getTime())) return parsed;
            if (!normalized.endsWith("Z")) {
              parsed = new Date(`${normalized}Z`);
              if (!Number.isNaN(parsed.getTime())) return parsed;
            }
            return null;
          };

          const startDate = parseDate(event.dtstart);
          if (!startDate) return null;

          const baseDate = new Date(startDate);
          if (event.timestart) {
            const [hour, minute, second] = event.timestart.split(":").map((part) => Number(part));
            baseDate.setHours(hour || 0, minute || 0, Number.isNaN(second) ? 0 : second, 0);
          }

          let endDate: Date | null = null;
          if (event.timeend) {
            endDate = new Date(baseDate);
            const [hour, minute, second] = event.timeend.split(":").map((part) => Number(part));
            endDate.setHours(hour || 0, minute || 0, Number.isNaN(second) ? 0 : second, 0);
          } else {
            endDate = parseDate(event.dtend);
          }

          const safeEnd =
            !endDate || endDate <= baseDate
              ? new Date(baseDate.getTime() + 30 * 60 * 1000)
              : endDate;
          const durationMs = safeEnd.getTime() - baseDate.getTime();
          const startsAtMidnight = baseDate.getHours() === 0 && baseDate.getMinutes() === 0;
          const endsAtMidnight = safeEnd.getHours() === 0 && safeEnd.getMinutes() === 0;
          const endsLate =
            safeEnd.getHours() === 23 && safeEnd.getMinutes() >= 59 && safeEnd.getSeconds() >= 0;
          const isAllDaySpan =
            startsAtMidnight &&
            (endsAtMidnight || endsLate) &&
            durationMs >= 23 * 60 * 60 * 1000 &&
            durationMs <= 25 * 60 * 60 * 1000;

          const spansMultipleDays = baseDate.toDateString() !== safeEnd.toDateString();
          let clampedEnd = safeEnd;
          if (viewType !== "dayGridMonth" && hasTimeFields && spansMultipleDays) {
            clampedEnd = new Date(baseDate);
            clampedEnd.setHours(23, 59, 59, 999);
          }

          return {
            id: `${event.url || event.uid}-${event.dtstart}`,
            title: event.summary || "Untitled event",
            start: baseDate,
            end: clampedEnd,
            allDay: !hasTimeFields && (isDateOnlyStart || isAllDaySpan),
            extendedProps: {
              location: event.location,
              priority: event.priority,
              url: event.url,
            },
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [rangeEvents]
  );

  const fullCalendarEvents = useMemo(
    () => (viewType === "dayGridMonth" ? countEvents : rangeCalendarEvents),
    [countEvents, rangeCalendarEvents, viewType]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: tokens.colors.background,
        color: tokens.colors.text,
        position: "relative",
      }}
    >
      <style>{calendarStyles}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
          borderBottom: `1px solid ${tokens.colors.border}`,
          background: `linear-gradient(180deg, ${tokens.colors.surface} 0%, ${tokens.colors.background} 100%)`,
          position: "relative",
        }}
      >
        {/* Decorative left element */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: tokens.colors.accent }}>
          <CoffeeIcon size={18} />
          <span
            style={{
              fontFamily: tokens.fonts.elegant,
              fontSize: 14,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: tokens.colors.textSecondary,
            }}
          >
            Your Schedule
          </span>
        </div>

        {/* Calendar name - centered */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            padding: "8px 20px",
            background: `linear-gradient(135deg, rgba(212, 165, 116, 0.12) 0%, rgba(212, 165, 116, 0.05) 100%)`,
            borderRadius: tokens.radius.full,
            border: `1px solid rgba(212, 165, 116, 0.25)`,
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
          }}
        >
          <span
            style={{
              fontFamily: tokens.fonts.elegant,
              fontSize: 17,
              fontWeight: 500,
              color: tokens.colors.text,
              letterSpacing: "0.02em",
            }}
          >
            {selectedCalendar.name}
          </span>
        </div>

        {/* Header right section */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 130 }}>
          {/* Events button */}
          <div style={{ position: "relative", zIndex: 130 }}>
            <button
              ref={eventsTabRef}
              onClick={toggleEventsPopup}
              onMouseEnter={() => setEventsTabHover(true)}
              onMouseLeave={() => setEventsTabHover(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background:
                  eventsTabHover || isEventsPopupOpen
                    ? `linear-gradient(135deg, ${tokens.colors.surfaceSecondary} 0%, ${tokens.colors.surface} 100%)`
                    : tokens.colors.surface,
                border: `1px solid ${isEventsPopupOpen ? tokens.colors.accent : tokens.colors.border}`,
                borderRadius: tokens.radius.md,
                color: tokens.colors.text,
                fontFamily: tokens.fonts.elegant,
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  eventsTabHover || isEventsPopupOpen
                    ? `0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px ${tokens.colors.accent}22`
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <EventIcon size={16} />
              <span>Events</span>
              <ChevronIcon size={14} direction={isEventsPopupOpen ? "up" : "down"} />
            </button>

            {/* Events popup */}
            {isEventsPopupOpen && (
              <div
                ref={eventsPopupRef}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: 200,
                  background: `linear-gradient(160deg, ${tokens.colors.surface} 0%, #1f1a17 100%)`,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.lg,
                  boxShadow:
                    "0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 165, 116, 0.1)",
                  overflow: "hidden",
                  zIndex: 140,
                  opacity: isEventsPopupVisible ? 1 : 0,
                  transform: isEventsPopupVisible
                    ? "translateY(0) scale(1)"
                    : "translateY(-8px) scale(0.98)",
                  transition: `all ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                }}
              >
                <PopupHeader title="Event Actions" />
                <div style={{ padding: "8px" }}>
                  <EventOptionButton
                    icon={<PlusIcon size={16} />}
                    title="Create Event"
                    subtitle="Add a new event"
                    isHovered={hoveredEventOption === "create"}
                    onMouseEnter={() => setHoveredEventOption("create")}
                    onMouseLeave={() => setHoveredEventOption(null)}
                    onClick={() => {
                      closeEventsPopup();
                      setIsCreateEventOpen(true);
                    }}
                  />
                  <EventOptionButton
                    icon={<EditIcon size={16} />}
                    title="Edit Event"
                    subtitle="Modify existing events"
                    isHovered={hoveredEventOption === "edit"}
                    onMouseEnter={() => setHoveredEventOption("edit")}
                    onMouseLeave={() => setHoveredEventOption(null)}
                    onClick={() => {
                      closeEventsPopup();
                      console.log("Edit event clicked");
                    }}
                    style={{ marginTop: 4 }}
                  />
                </div>
                <PopupFooter />
              </div>
            )}
          </div>

          {/* Calendar selector tab */}
          <div style={{ position: "relative" }}>
            <button
              ref={tabRef}
              onClick={togglePopup}
              onMouseEnter={() => setTabHover(true)}
              onMouseLeave={() => setTabHover(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background:
                  tabHover || isPopupOpen
                    ? `linear-gradient(135deg, ${tokens.colors.surfaceSecondary} 0%, ${tokens.colors.surface} 100%)`
                    : tokens.colors.surface,
                border: `1px solid ${isPopupOpen ? tokens.colors.accent : tokens.colors.border}`,
                borderRadius: tokens.radius.md,
                color: tokens.colors.text,
                fontFamily: tokens.fonts.elegant,
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  tabHover || isPopupOpen
                    ? `0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px ${tokens.colors.accent}22`
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CalendarListIcon size={16} />
              <span>Calendars</span>
              <ChevronIcon size={14} direction={isPopupOpen ? "up" : "down"} />
            </button>

            {/* Calendar popup */}
            {isPopupOpen && (
              <div
                ref={popupRef}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: 260,
                  maxWidth: 320,
                  background: `linear-gradient(160deg, ${tokens.colors.surface} 0%, #1f1a17 100%)`,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.lg,
                  boxShadow:
                    "0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 165, 116, 0.1)",
                  overflow: "hidden",
                  zIndex: 50,
                  opacity: isPopupVisible ? 1 : 0,
                  transform: isPopupVisible
                    ? "translateY(0) scale(1)"
                    : "translateY(-8px) scale(0.98)",
                  transition: `all ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                }}
              >
                <PopupHeader title="My Calendars" />

                {/* Calendar list */}
                <div style={{ padding: "8px", maxHeight: 280, overflowY: "auto" }}>
                  {loadingCalendars ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        color: tokens.colors.textMuted,
                        fontFamily: tokens.fonts.elegant,
                        fontStyle: "italic",
                      }}
                    >
                      Brewing your calendars...
                    </div>
                  ) : calendars.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        color: tokens.colors.textMuted,
                        fontFamily: tokens.fonts.elegant,
                        textAlign: "center",
                      }}
                    >
                      <CalendarListIcon size={24} />
                      <span style={{ marginTop: 8, fontStyle: "italic" }}>No calendars yet</span>
                    </div>
                  ) : (
                    calendars.map((calendar) => (
                      <CalendarListItem
                        key={calendar.url}
                        calendar={calendar}
                        isSelected={calendar.url === selectedCalendar.url}
                        isDefault={calendar.url === defaultCalendarUrl}
                        isHovered={hoveredCalendar === calendar.url}
                        isMoreHovered={hoveredMoreBtn === calendar.url}
                        onMouseEnter={() => setHoveredCalendar(calendar.url)}
                        onMouseLeave={() => {
                          setHoveredCalendar(null);
                          setHoveredMoreBtn(null);
                        }}
                        onMoreMouseEnter={() => setHoveredMoreBtn(calendar.url)}
                        onMoreMouseLeave={() => setHoveredMoreBtn(null)}
                        onClick={() => handleCalendarClick(calendar)}
                        onMoreClick={(e) => openContextMenu(e, calendar)}
                      />
                    ))
                  )}
                </div>

                {/* Add calendar button */}
                <div style={{ padding: "4px 12px 12px" }}>
                  <AddCalendarButton
                    onClick={() => {
                      closePopup();
                      onAddCalendar();
                    }}
                  />
                </div>
                <PopupFooter />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date selector header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
          background: `linear-gradient(180deg, ${tokens.colors.surface} 0%, ${tokens.colors.background} 100%)`,
          position: "relative",
          zIndex: 90,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={handlePrevRange}
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.radius.full,
              border: `1px solid ${tokens.colors.border}`,
              background: tokens.colors.surface,
              color: tokens.colors.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(0, 0, 0, 0.12)",
              transition: "all 0.2s ease",
            }}
          >
            <ChevronIcon size={16} direction="left" />
          </button>

          <div style={{ width: 140 }}>
            <Dropdown value={currentMonth} options={monthOptions} onChange={handleMonthChange} />
          </div>
          <div style={{ width: 100 }}>
            <Dropdown value={currentYear} options={yearOptions} onChange={handleYearChange} />
          </div>

          <button
            type="button"
            onClick={handleNextRange}
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.radius.full,
              border: `1px solid ${tokens.colors.border}`,
              background: tokens.colors.surface,
              color: tokens.colors.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(0, 0, 0, 0.12)",
              transition: "all 0.2s ease",
            }}
          >
            <ChevronIcon size={16} direction="right" />
          </button>

          <button
            type="button"
            onClick={() => calendarRef.current?.getApi().today()}
            style={{
              padding: "8px 12px",
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.colors.border}`,
              background: tokens.colors.surfaceSecondary,
              color: tokens.colors.text,
              fontFamily: tokens.fonts.elegant,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(0, 0, 0, 0.12)",
              transition: "all 0.2s ease",
            }}
          >
            Today
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[
            { label: "Month", value: "dayGridMonth" },
            { label: "Week", value: "timeGridWeek" },
            { label: "Day", value: "timeGridDay" },
          ].map((item) => {
            const isActive = viewType === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleViewChange(item.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: tokens.radius.sm,
                  border: `1px solid ${isActive ? tokens.colors.accent : tokens.colors.border}`,
                  background: isActive ? tokens.colors.accent : tokens.colors.surface,
                  color: isActive ? tokens.colors.background : tokens.colors.text,
                  fontFamily: tokens.fonts.elegant,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isActive
                    ? "0 6px 14px rgba(0, 0, 0, 0.2)"
                    : "0 4px 10px rgba(0, 0, 0, 0.12)",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Context menu */}
      {isContextOpen && contextCalendar && (
        <div
          ref={contextRef}
          style={{
            position: "fixed",
            top: contextPos.y,
            right: contextPos.right,
            width: 210,
            background: `linear-gradient(160deg, ${tokens.colors.surfaceSecondary} 0%, #1f1a17 100%)`,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radius.md,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
            padding: "8px",
            zIndex: 200,
            opacity: isContextVisible ? 1 : 0,
            transform: isContextVisible ? "translateY(0)" : "translateY(-6px)",
            transition: `opacity ${contextTransitionMs}ms ease, transform ${contextTransitionMs}ms ease`,
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              borderBottom: `1px solid ${tokens.colors.border}`,
              color: tokens.colors.textMuted,
              fontFamily: tokens.fonts.elegant,
              fontSize: 13,
              letterSpacing: 0.6,
            }}
          >
            {contextCalendar.name}
          </div>
          <ContextMenuItem onClick={handleSetDefaultCalendar}>Set as default</ContextMenuItem>
          <ContextMenuItem onClick={handleDeleteCalendar} variant="danger">
            Delete calendar
          </ContextMenuItem>
        </div>
      )}

      {/* FullCalendar container */}
      <div
        style={{
          flex: 1,
          padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px ${tokens.spacing.lg}px`,
          overflow: "auto",
          opacity: 1,
          transform: "translateX(0)",
          willChange: "transform, opacity",
          animation: isCalendarTransitioning
            ? `calendar-slide-${calendarSlideDirection} ${calendarTransitionMs}ms ease`
            : "none",
        }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="100%"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          slotEventOverlap={false}
          eventOverlap={false}
          forceEventDuration={true}
          defaultTimedEventDuration="00:30"
          events={fullCalendarEvents}
          datesSet={handleDatesSetWithTransition}
          dayCellContent={renderDayCellContent}
          eventContent={renderEventContent}
          moreLinkContent={renderMoreLinkContent}
          moreLinkDidMount={handleMoreLinkDidMount}
          eventClick={(info) => console.log("Event clicked:", info.event)}
          select={(info) => console.log("Date selected:", info.startStr, "to", info.endStr)}
        />
      </div>

      {/* Decorative bottom border */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "12px",
          borderTop: `1px solid ${tokens.colors.border}`,
          background: tokens.colors.surface,
        }}
      >
        <div style={{ width: 40, height: 1, background: tokens.colors.border }} />
        <CoffeeIcon size={14} />
        <div style={{ width: 40, height: 1, background: tokens.colors.border }} />
      </div>

      {/* Priority Events Popup */}
      {isCountPopupOpen && (
        <div
          onClick={closeCountPopup}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(16, 12, 10, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: tokens.spacing.lg,
            zIndex: 5000,
            opacity: isCountPopupVisible ? 1 : 0,
            transition: `opacity ${countPopupTransitionMs}ms ease`,
          }}
        >
          <div
            ref={countPopupRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 5001,
              width: "min(460px, 100%)",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "linear-gradient(160deg, #2f2722 0%, #241d1a 100%)",
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.colors.border}`,
              padding: "24px 26px",
              boxShadow: "0 18px 48px rgba(0, 0, 0, 0.45)",
              color: tokens.colors.text,
              transform: isCountPopupVisible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.98)",
              opacity: isCountPopupVisible ? 1 : 0,
              transition: `opacity ${countPopupTransitionMs}ms ease, transform ${countPopupTransitionMs}ms ease`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: tokens.spacing.md,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CoffeeIcon size={16} />
                <span
                  style={{
                    fontFamily: tokens.fonts.elegant,
                    fontSize: 15,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: tokens.colors.textSecondary,
                  }}
                >
                  Events
                </span>
              </div>
              <button
                type="button"
                onClick={closeCountPopup}
                style={{
                  border: "none",
                  background: "transparent",
                  color: tokens.colors.textSecondary,
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>
            <h4
              style={{
                margin: 0,
                marginBottom: tokens.spacing.md,
                fontSize: 22,
                fontFamily: tokens.fonts.elegant,
              }}
            >
              {countPopupTitle}
            </h4>

            {countPopupLoading && (
              <p
                style={{
                  margin: 0,
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.sans,
                }}
              >
                Loading events…
              </p>
            )}

            {countPopupError && (
              <p
                style={{
                  margin: 0,
                  color: tokens.colors.error,
                  fontFamily: tokens.fonts.sans,
                }}
              >
                {countPopupError}
              </p>
            )}

            {!countPopupLoading && !countPopupError && countPopupItems.length === 0 && (
              <p
                style={{
                  margin: 0,
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.sans,
                }}
              >
                No events scheduled.
              </p>
            )}

            {!countPopupLoading && !countPopupError && countPopupItems.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {countPopupItems.map((item) => (
                  <div
                    key={`${item.uid}-${item.dtstart}`}
                    style={{
                      zIndex: 200,
                      padding: "12px 14px",
                      borderRadius: tokens.radius.md,
                      border: `1px solid ${tokens.colors.borderLight}`,
                      backgroundColor: tokens.colors.surface,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: tokens.fonts.elegant,
                        fontSize: 16,
                        marginBottom: 6,
                      }}
                    >
                      {item.summary || "Untitled event"}
                    </div>
                    <div
                      style={{
                        fontFamily: tokens.fonts.sans,
                        fontSize: 13,
                        color: tokens.colors.textSecondary,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span>{formatEventTime(item)}</span>
                      {item.location && <span>{item.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        selectedCalendar={selectedCalendar}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}

// Helper components

function PopupHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 16px",
        borderBottom: `1px solid ${tokens.colors.border}`,
        background: `rgba(212, 165, 116, 0.05)`,
      }}
    >
      <CoffeeIcon size={14} />
      <span
        style={{
          fontFamily: tokens.fonts.elegant,
          fontSize: 13,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: tokens.colors.accent,
        }}
      >
        {title}
      </span>
    </div>
  );
}

function PopupFooter() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px",
        borderTop: `1px solid ${tokens.colors.border}`,
        color: tokens.colors.textMuted,
      }}
    >
      <div style={{ width: 24, height: 1, background: tokens.colors.border }} />
      <CoffeeIcon size={12} />
      <div style={{ width: 24, height: 1, background: tokens.colors.border }} />
    </div>
  );
}

function EventOptionButton({
  icon,
  title,
  subtitle,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  style,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: isHovered ? `rgba(212, 165, 116, 0.1)` : "transparent",
        border: "none",
        borderRadius: tokens.radius.md,
        color: isHovered ? tokens.colors.text : tokens.colors.textSecondary,
        fontFamily: tokens.fonts.elegant,
        fontSize: 15,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
        ...style,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: tokens.radius.sm,
          background: isHovered ? `rgba(212, 165, 116, 0.15)` : tokens.colors.surfaceSecondary,
          color: tokens.colors.accent,
          transition: "all 0.15s ease",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: tokens.colors.textMuted, marginTop: 2 }}>{subtitle}</div>
      </div>
    </button>
  );
}

function CalendarListItem({
  calendar,
  isSelected,
  isDefault,
  isHovered,
  isMoreHovered,
  onMouseEnter,
  onMouseLeave,
  onMoreMouseEnter,
  onMoreMouseLeave,
  onClick,
  onMoreClick,
}: {
  calendar: CalendarItem;
  isSelected: boolean;
  isDefault: boolean;
  isHovered: boolean;
  isMoreHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMoreMouseEnter: () => void;
  onMoreMouseLeave: () => void;
  onClick: () => void;
  onMoreClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "4px",
        borderRadius: tokens.radius.md,
        background: isSelected
          ? `rgba(212, 165, 116, 0.12)`
          : isHovered
            ? `rgba(212, 165, 116, 0.06)`
            : "transparent",
        transition: "all 0.15s ease",
      }}
    >
      <button
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderRadius: tokens.radius.sm,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: isSelected ? tokens.colors.accent : tokens.colors.borderLight,
            boxShadow: isSelected ? `0 0 8px ${tokens.colors.accent}66` : "none",
            transition: "all 0.2s ease",
          }}
        />
        <span
          style={{
            flex: 1,
            fontFamily: tokens.fonts.elegant,
            fontSize: 15,
            color: isSelected ? tokens.colors.text : tokens.colors.textSecondary,
            fontWeight: isSelected ? 500 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {calendar.name}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isDefault && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: tokens.radius.full,
                border: `1px solid rgba(212, 165, 116, 0.35)`,
                background: "rgba(212, 165, 116, 0.12)",
                color: tokens.colors.accent,
                fontFamily: tokens.fonts.elegant,
                fontSize: 11,
                letterSpacing: 0.5,
              }}
            >
              <StarIcon size={12} />
              Default
            </div>
          )}
          {isSelected && (
            <div style={{ color: tokens.colors.accent }}>
              <CheckIcon size={16} />
            </div>
          )}
        </div>
      </button>
      <button
        onClick={onMoreClick}
        onMouseEnter={onMoreMouseEnter}
        onMouseLeave={onMoreMouseLeave}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          padding: 0,
          background: isMoreHovered ? `rgba(212, 165, 116, 0.15)` : "transparent",
          border: "none",
          borderRadius: tokens.radius.sm,
          cursor: "pointer",
          color: isMoreHovered ? tokens.colors.text : tokens.colors.textMuted,
          opacity: isHovered || isMoreHovered ? 1 : 0,
          transition: "all 0.15s ease",
        }}
      >
        <MoreIcon size={14} />
      </button>
    </div>
  );
}

function AddCalendarButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: tokens.radius.md,
        border: `1px dashed rgba(212, 165, 116, 0.35)`,
        background:
          "linear-gradient(135deg, rgba(212, 165, 116, 0.16), rgba(111, 76, 55, 0.12))",
        color: tokens.colors.textSecondary,
        fontFamily: tokens.fonts.elegant,
        fontSize: 13,
        letterSpacing: 0.2,
        textTransform: "none",
        fontStyle: "italic",
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(212, 165, 116, 0.26), rgba(111, 76, 55, 0.18))";
        e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.55)";
        e.currentTarget.style.color = tokens.colors.text;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(212, 165, 116, 0.16), rgba(111, 76, 55, 0.12))";
        e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.35)";
        e.currentTarget.style.color = tokens.colors.textSecondary;
      }}
    >
      <PlusIcon size={14} />
      Add a new calendar
    </button>
  );
}

function ContextMenuItem({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "danger";
}) {
  const isDanger = variant === "danger";
  const baseColor = isDanger ? "#b06a5b" : tokens.colors.textSecondary;
  const hoverColor = isDanger ? "#d39b8b" : tokens.colors.text;
  const hoverBg = isDanger ? "rgba(176, 106, 91, 0.12)" : "rgba(212, 165, 116, 0.08)";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 12px",
        marginTop: 6,
        background: "transparent",
        border: "none",
        color: baseColor,
        fontFamily: tokens.fonts.elegant,
        fontSize: 14,
        textAlign: "left",
        cursor: "pointer",
        borderRadius: tokens.radius.sm,
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = baseColor;
      }}
    >
      {children}
    </button>
  );
}
