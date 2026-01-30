import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import tokens from "../tokens";

interface CalendarItem {
  name: string;
  url: string;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toOption(value: number | string) {
  const label = typeof value === "number" ? String(value).padStart(2, "0") : value;
  return { label, value };
}

function Dropdown({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string | number;
  options: Array<{ label: string; value: string | number }>;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const transitionMs = 160;
  const containerRef = useRef<HTMLDivElement>(null);

  function openMenu() {
    if (disabled) return;
    setIsOpen(true);
    requestAnimationFrame(() => setIsVisible(true));
  }

  function closeMenu() {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), transitionMs);
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (disabled && isOpen) {
      closeMenu();
    }
  }, [disabled, isOpen]);

  const selected = options.find((option) => option.value === value)?.label ?? String(value);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: tokens.radius.md,
          border: `1px solid ${tokens.colors.borderLight}`,
          backgroundColor: tokens.colors.surfaceSecondary,
          color: tokens.colors.text,
          fontFamily: tokens.fonts.elegant,
          fontSize: 14,
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          height: 40,
          lineHeight: "20px",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {selected}
      </button>
      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 5,
            maxHeight: 220,
            overflowY: "auto",
            backgroundColor: tokens.colors.surface,
            border: `1px solid ${tokens.colors.borderLight}`,
            borderRadius: tokens.radius.md,
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
            padding: 6,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-6px)",
            transition: `opacity ${transitionMs}ms ease, transform ${transitionMs}ms ease`,
            pointerEvents: isVisible ? "auto" : "none",
          }}
        >
          {options.map((option) => (
            <button
              key={`${option.value}`}
              type="button"
              onClick={() => {
                onChange(option.value);
                closeMenu();
              }}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: tokens.radius.sm,
                border: "none",
                backgroundColor:
                  option.value === value ? "rgba(212, 165, 116, 0.2)" : "transparent",
                color: option.value === value ? tokens.colors.accent : tokens.colors.text,
                fontFamily: tokens.fonts.elegant,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CoffeeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

function CalendarListIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="8" y1="18" x2="8" y2="18.01" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
    </svg>
  );
}

function ChevronIcon({ size = 16, direction = "down" }: { size?: number; direction?: "up" | "down" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: direction === "up" ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MoreIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EventIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function EditIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M12 3.5l2.47 5.02 5.54.8-4.01 3.9.95 5.53L12 16.8l-4.95 2.95.95-5.53-4.01-3.9 5.54-.8L12 3.5z" />
    </svg>
  );
}

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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isContextVisible, setIsContextVisible] = useState(false);
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [isEventsPopupVisible, setIsEventsPopupVisible] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreateEventVisible, setIsCreateEventVisible] = useState(false);
  const [tabHover, setTabHover] = useState(false);
  const [eventsTabHover, setEventsTabHover] = useState(false);
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null);
  const [hoveredMoreBtn, setHoveredMoreBtn] = useState<string | null>(null);
  const [hoveredEventOption, setHoveredEventOption] = useState<string | null>(null);
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [contextCalendar, setContextCalendar] = useState<CalendarItem | null>(null);
  const [contextPos, setContextPos] = useState({ right: 0, y: 0 });

  // Create event form state
  const [eventSummary, setEventSummary] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventPriority, setEventPriority] = useState<"low" | "medium" | "high">("low");
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [hoverCreateBtn, setHoverCreateBtn] = useState(false);
  const [hoverCancelBtn, setHoverCancelBtn] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);

  const initialTime = useMemo(() => {
    const base = new Date();
    base.setMinutes(0, 0, 0);
    base.setHours(base.getHours() + 1);
    const end = new Date(base);
    end.setHours(end.getHours() + 1);
    return { start: base, end };
  }, []);

  const [startMonth, setStartMonth] = useState(initialTime.start.getMonth());
  const [startDay, setStartDay] = useState(initialTime.start.getDate());
  const [startYear, setStartYear] = useState(initialTime.start.getFullYear());
  const [endMonth, setEndMonth] = useState(initialTime.end.getMonth());
  const [endDay, setEndDay] = useState(initialTime.end.getDate());
  const [endYear, setEndYear] = useState(initialTime.end.getFullYear());
  const [startHour, setStartHour] = useState(((initialTime.start.getHours() + 11) % 12) + 1);
  const [startMinute, setStartMinute] = useState(initialTime.start.getMinutes());
  const [startMeridiem, setStartMeridiem] = useState(
    initialTime.start.getHours() >= 12 ? "PM" : "AM"
  );
  const [endHour, setEndHour] = useState(((initialTime.end.getHours() + 11) % 12) + 1);
  const [endMinute, setEndMinute] = useState(initialTime.end.getMinutes());
  const [endMeridiem, setEndMeridiem] = useState(
    initialTime.end.getHours() >= 12 ? "PM" : "AM"
  );


  const popupRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const eventsPopupRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);
  const eventsTabRef = useRef<HTMLButtonElement>(null);
  const transitionMs = 200;
  const contextTransitionMs = 180;
  const modalTransitionMs = 220;

  const monthOptions = useMemo(
    () => MONTH_LABELS.map((label, index) => ({ label, value: index })),
    []
  );
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear + i).map((year) => ({
      label: String(year),
      value: year,
    }));
  }, []);
  const hourOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1).map(toOption),
    []
  );
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i).map(toOption),
    []
  );
  const meridiemOptions = useMemo(() => ["AM", "PM"].map(toOption), []);

  const startDayOptions = useMemo(() => {
    const max = daysInMonth(startYear, startMonth);
    return Array.from({ length: max }, (_, i) => i + 1).map(toOption);
  }, [startYear, startMonth]);

  const endDayOptions = useMemo(() => {
    const max = daysInMonth(endYear, endMonth);
    return Array.from({ length: max }, (_, i) => i + 1).map(toOption);
  }, [endYear, endMonth]);

  useEffect(() => {
    fetchCalendars();
  }, []);

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
    if (isCreateEventOpen) {
      requestAnimationFrame(() => setIsCreateEventVisible(true));
    } else {
      setIsCreateEventVisible(false);
    }
  }, [isCreateEventOpen]);

  useEffect(() => {
    const max = daysInMonth(startYear, startMonth);
    if (startDay > max) {
      setStartDay(max);
    }
  }, [startDay, startMonth, startYear]);

  useEffect(() => {
    const max = daysInMonth(endYear, endMonth);
    if (endDay > max) {
      setEndDay(max);
    }
  }, [endDay, endMonth, endYear]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Don't close popup if clicking on context menu
      if (contextRef.current?.contains(event.target as Node)) {
        return;
      }
      // Don't close on right-click (let context menu handle it)
      if (event.button === 2) {
        return;
      }
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
  }, [isPopupOpen]);

  useEffect(() => {
    function handleContextOutside(event: MouseEvent) {
      // Only close context menu on left-click outside
      if (event.button !== 0) {
        return;
      }
      if (contextRef.current && !contextRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    }

    if (isContextOpen) {
      document.addEventListener("mousedown", handleContextOutside);
    }
    return () => document.removeEventListener("mousedown", handleContextOutside);
  }, [isContextOpen]);

  useEffect(() => {
    function handleEventsClickOutside(event: MouseEvent) {
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
  }, [isEventsPopupOpen]);

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

  function openCreateEventModal() {
    setEventSummary("");
    setEventDescription("");
    setEventPriority("low");
    setEventError(null);
    setIsAllDay(false);
    setStartMonth(initialTime.start.getMonth());
    setStartDay(initialTime.start.getDate());
    setStartYear(initialTime.start.getFullYear());
    setEndMonth(initialTime.end.getMonth());
    setEndDay(initialTime.end.getDate());
    setEndYear(initialTime.end.getFullYear());
    setStartHour(((initialTime.start.getHours() + 11) % 12) + 1);
    setStartMinute(initialTime.start.getMinutes());
    setStartMeridiem(initialTime.start.getHours() >= 12 ? "PM" : "AM");
    setEndHour(((initialTime.end.getHours() + 11) % 12) + 1);
    setEndMinute(initialTime.end.getMinutes());
    setEndMeridiem(initialTime.end.getHours() >= 12 ? "PM" : "AM");
    setIsCreateEventOpen(true);
  }

  function closeCreateEventModal() {
    if (eventLoading) return;
    setIsCreateEventVisible(false);
    setTimeout(() => setIsCreateEventOpen(false), modalTransitionMs);
  }

  function to24Hour(hour: number, meridiem: string) {
    const normalized = hour % 12;
    return meridiem === "PM" ? normalized + 12 : normalized;
  }

  async function handleCreateEvent() {
    if (!eventSummary.trim()) {
      setEventError("Please enter an event title.");
      return;
    }

    const dtstart = new Date(startYear, startMonth, startDay);
    const dtend = new Date(endYear, endMonth, endDay);

    if (isAllDay) {
      dtstart.setHours(0, 0, 0, 0);
      dtend.setHours(23, 59, 59, 999);
    } else {
      dtstart.setHours(to24Hour(startHour, startMeridiem), startMinute, 0, 0);
      dtend.setHours(to24Hour(endHour, endMeridiem), endMinute, 0, 0);
    }

    if (dtend <= dtstart) {
      setEventError("End time must be after start time.");
      return;
    }

    setEventLoading(true);
    setEventError(null);

    const priorityMap = { high: 1, medium: 5, low: 9 };
    const priorityValue = priorityMap[eventPriority];

    try {
      await axios.post("http://127.0.0.1:8000/calendar/create_event", {
        calendar_url: selectedCalendar.url,
        summary: eventSummary.trim(),
        description: eventDescription.trim() || null,
        dtstart: dtstart.toISOString(),
        dtend: dtend.toISOString(),
        location: null,
        priority: priorityValue,
      });
      closeCreateEventModal();
    } catch (err) {
      console.error("Failed to create event:", err);
      setEventError("Could not create event. Please try again.");
    } finally {
      setEventLoading(false);
    }
  }

  function handleCalendarClick(calendar: CalendarItem) {
    onCalendarSelect(calendar);
    closePopup();
  }

  function openContextMenu(event: React.MouseEvent, calendar: CalendarItem) {
    event.preventDefault();
    event.stopPropagation();

    // Get position from the button element
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    const menuWidth = 210;
    const menuHeight = 140;
    const padding = 8;

    // Position menu to the left of the button using right-based positioning
    // Align menu's right edge with button's right edge
    const rightPos = window.innerWidth - rect.right;
    let y = rect.bottom + 8;

    // If menu would go off bottom, adjust upward
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    // If menu would go off top, adjust downward
    if (y < padding) {
      y = padding;
    }

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

  async function handleDeleteCalendar() {
    if (!contextCalendar) {
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/calendar/delete_calendar", {
        calendar_name: contextCalendar.name,
      });
      const updated = await fetchCalendars();
      if (defaultCalendarUrl && !updated.some((calendar) => calendar.url === defaultCalendarUrl)) {
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
    if (!contextCalendar) {
      return;
    }
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

  const calendarStyles = `
    .fc {
      --fc-border-color: ${tokens.colors.border};
      --fc-button-bg-color: ${tokens.colors.surface};
      --fc-button-border-color: ${tokens.colors.border};
      --fc-button-text-color: ${tokens.colors.text};
      --fc-button-hover-bg-color: ${tokens.colors.surfaceSecondary};
      --fc-button-hover-border-color: ${tokens.colors.borderLight};
      --fc-button-active-bg-color: ${tokens.colors.accent};
      --fc-button-active-border-color: ${tokens.colors.accent};
      --fc-page-bg-color: transparent;
      --fc-neutral-bg-color: ${tokens.colors.surface};
      --fc-today-bg-color: rgba(212, 165, 116, 0.08);
      --fc-event-bg-color: ${tokens.colors.accent};
      --fc-event-border-color: ${tokens.colors.accent};
      --fc-event-text-color: ${tokens.colors.background};
      --fc-now-indicator-color: ${tokens.colors.accent};
      font-family: ${tokens.fonts.elegant};
    }

    .fc .fc-toolbar-title {
      font-family: ${tokens.fonts.elegant};
      font-size: 1.5rem;
      font-weight: 500;
      color: ${tokens.colors.text};
    }

    .fc .fc-button {
      font-family: ${tokens.fonts.elegant};
      font-weight: 400;
      border-radius: ${tokens.radius.sm}px;
      padding: 8px 16px;
      transition: all 0.2s ease;
    }

    .fc .fc-button:focus {
      box-shadow: 0 0 0 2px ${tokens.colors.accent}44;
    }

    .fc .fc-button-primary:not(:disabled).fc-button-active,
    .fc .fc-button-primary:not(:disabled):active {
      background-color: ${tokens.colors.accent};
      border-color: ${tokens.colors.accent};
      color: ${tokens.colors.background};
    }

    .fc .fc-col-header-cell {
      background: ${tokens.colors.surface};
      border-color: ${tokens.colors.border};
    }

    .fc .fc-col-header-cell-cushion {
      font-family: ${tokens.fonts.elegant};
      font-weight: 500;
      color: ${tokens.colors.textSecondary};
      padding: 12px 4px;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 1px;
    }

    .fc .fc-daygrid-day {
      transition: background-color 0.15s ease;
    }

    .fc .fc-daygrid-day:hover {
      background-color: rgba(212, 165, 116, 0.04);
    }

    .fc .fc-daygrid-day-number {
      font-family: ${tokens.fonts.elegant};
      color: ${tokens.colors.text};
      padding: 8px 12px;
      font-size: 0.95rem;
    }

    .fc .fc-day-today .fc-daygrid-day-number {
      background: ${tokens.colors.accent};
      color: ${tokens.colors.background};
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .fc .fc-daygrid-day-top {
      justify-content: center;
    }

    .fc .fc-day-other .fc-daygrid-day-number {
      color: ${tokens.colors.textMuted};
    }

    .fc .fc-scrollgrid {
      border-radius: ${tokens.radius.lg}px;
      overflow: hidden;
      border: 1px solid ${tokens.colors.border};
    }

    .fc .fc-scrollgrid-section > * {
      border-color: ${tokens.colors.border};
    }

    .fc .fc-timegrid-slot {
      height: 48px;
    }

    .fc .fc-timegrid-slot-label-cushion {
      font-family: ${tokens.fonts.elegant};
      color: ${tokens.colors.textMuted};
      font-size: 0.8rem;
    }

    .fc .fc-timegrid-now-indicator-line {
      border-color: ${tokens.colors.accent};
    }

    .fc .fc-timegrid-now-indicator-arrow {
      border-color: ${tokens.colors.accent};
      border-top-color: transparent;
      border-bottom-color: transparent;
    }

    .fc .fc-event {
      border-radius: ${tokens.radius.sm}px;
      font-family: ${tokens.fonts.elegant};
      padding: 2px 6px;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .fc .fc-daygrid-event-dot {
      border-color: ${tokens.colors.accent};
    }

    .fc .fc-toolbar {
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 12px;
    }

    .fc .fc-toolbar-chunk {
      display: flex;
      align-items: center;
    }

    .fc-theme-standard td,
    .fc-theme-standard th {
      border-color: ${tokens.colors.border};
    }

    .fc .fc-popover {
      background: ${tokens.colors.surface};
      border: 1px solid ${tokens.colors.border};
      border-radius: ${tokens.radius.md}px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .fc .fc-popover-header {
      background: ${tokens.colors.surfaceSecondary};
      color: ${tokens.colors.text};
      font-family: ${tokens.fonts.elegant};
      padding: 8px 12px;
    }

    .fc .fc-more-link {
      color: ${tokens.colors.accent};
      font-family: ${tokens.fonts.elegant};
    }

    .fc .fc-more-link:hover {
      color: ${tokens.colors.accentHover};
    }
  `;

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

      {/* Header with calendar tab */}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: tokens.colors.accent,
          }}
        >
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

        {/* Calendar name - centered, aligned with calendar date */}
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

        {/* Header right section with Events and Calendar selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Events button */}
          <div style={{ position: "relative" }}>
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
                background: eventsTabHover || isEventsPopupOpen
                  ? `linear-gradient(135deg, ${tokens.colors.surfaceSecondary} 0%, ${tokens.colors.surface} 100%)`
                  : tokens.colors.surface,
                border: `1px solid ${isEventsPopupOpen ? tokens.colors.accent : tokens.colors.border}`,
                borderRadius: tokens.radius.md,
                color: tokens.colors.text,
                fontFamily: tokens.fonts.elegant,
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: eventsTabHover || isEventsPopupOpen
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
                  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 165, 116, 0.1)",
                  overflow: "hidden",
                  zIndex: 50,
                  opacity: isEventsPopupVisible ? 1 : 0,
                  transform: isEventsPopupVisible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.98)",
                  transition: `all ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                }}
              >
                {/* Popup header */}
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
                    Event Actions
                  </span>
                </div>

                {/* Event options */}
                <div style={{ padding: "8px" }}>
                  <button
                    onClick={() => {
                      closeEventsPopup();
                      openCreateEventModal();
                    }}
                    onMouseEnter={() => setHoveredEventOption("create")}
                    onMouseLeave={() => setHoveredEventOption(null)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      background: hoveredEventOption === "create"
                        ? `rgba(212, 165, 116, 0.1)`
                        : "transparent",
                      border: "none",
                      borderRadius: tokens.radius.md,
                      color: hoveredEventOption === "create"
                        ? tokens.colors.text
                        : tokens.colors.textSecondary,
                      fontFamily: tokens.fonts.elegant,
                      fontSize: 15,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
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
                        background: hoveredEventOption === "create"
                          ? `rgba(212, 165, 116, 0.15)`
                          : tokens.colors.surfaceSecondary,
                        color: tokens.colors.accent,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <PlusIcon size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>Create Event</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: tokens.colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        Add a new event
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      closeEventsPopup();
                      // TODO: Open edit event modal/view
                      console.log("Edit event clicked");
                    }}
                    onMouseEnter={() => setHoveredEventOption("edit")}
                    onMouseLeave={() => setHoveredEventOption(null)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      marginTop: 4,
                      background: hoveredEventOption === "edit"
                        ? `rgba(212, 165, 116, 0.1)`
                        : "transparent",
                      border: "none",
                      borderRadius: tokens.radius.md,
                      color: hoveredEventOption === "edit"
                        ? tokens.colors.text
                        : tokens.colors.textSecondary,
                      fontFamily: tokens.fonts.elegant,
                      fontSize: 15,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
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
                        background: hoveredEventOption === "edit"
                          ? `rgba(212, 165, 116, 0.15)`
                          : tokens.colors.surfaceSecondary,
                        color: tokens.colors.accent,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <EditIcon size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>Edit Event</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: tokens.colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        Modify existing events
                      </div>
                    </div>
                  </button>
                </div>

                {/* Decorative footer */}
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
                background: tabHover || isPopupOpen
                  ? `linear-gradient(135deg, ${tokens.colors.surfaceSecondary} 0%, ${tokens.colors.surface} 100%)`
                  : tokens.colors.surface,
                border: `1px solid ${isPopupOpen ? tokens.colors.accent : tokens.colors.border}`,
                borderRadius: tokens.radius.md,
                color: tokens.colors.text,
                fontFamily: tokens.fonts.elegant,
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: tabHover || isPopupOpen
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
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 165, 116, 0.1)",
                overflow: "hidden",
                zIndex: 50,
                opacity: isPopupVisible ? 1 : 0,
                transform: isPopupVisible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.98)",
                transition: `all ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
              }}
            >
              {/* Popup header */}
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
                  My Calendars
                </span>
              </div>

              {/* Calendar list */}
              <div
                style={{
                  padding: "8px",
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
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
                    <span style={{ marginTop: 8, fontStyle: "italic" }}>
                      No calendars yet
                    </span>
                  </div>
                ) : (
                  calendars.map((calendar) => {
                    const isSelected = calendar.url === selectedCalendar.url;
                    const isHovered = hoveredCalendar === calendar.url;
                    const isDefault = calendar.url === defaultCalendarUrl;
                    const isMoreHovered = hoveredMoreBtn === calendar.url;

                    return (
                      <div
                        key={calendar.url}
                        onMouseEnter={() => setHoveredCalendar(calendar.url)}
                        onMouseLeave={() => {
                          setHoveredCalendar(null);
                          setHoveredMoreBtn(null);
                        }}
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
                        {/* Main clickable area */}
                        <button
                          onClick={() => handleCalendarClick(calendar)}
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
                          {/* Calendar indicator dot */}
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: isSelected
                                ? tokens.colors.accent
                                : tokens.colors.borderLight,
                              boxShadow: isSelected
                                ? `0 0 8px ${tokens.colors.accent}66`
                                : "none",
                              transition: "all 0.2s ease",
                            }}
                          />

                          {/* Calendar name */}
                          <span
                            style={{
                              flex: 1,
                              fontFamily: tokens.fonts.elegant,
                              fontSize: 15,
                              color: isSelected
                                ? tokens.colors.text
                                : tokens.colors.textSecondary,
                              fontWeight: isSelected ? 500 : 400,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {calendar.name}
                          </span>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
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

                        {/* More button */}
                        <button
                          onClick={(event) => openContextMenu(event, calendar)}
                          onMouseEnter={() => setHoveredMoreBtn(calendar.url)}
                          onMouseLeave={() => setHoveredMoreBtn(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            padding: 0,
                            background: isMoreHovered
                              ? `rgba(212, 165, 116, 0.15)`
                              : "transparent",
                            border: "none",
                            borderRadius: tokens.radius.sm,
                            cursor: "pointer",
                            color: isMoreHovered
                              ? tokens.colors.text
                              : tokens.colors.textMuted,
                            opacity: isHovered || isMoreHovered ? 1 : 0,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <MoreIcon size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ padding: "4px 12px 12px" }}>
                <button
                  onClick={() => {
                    closePopup();
                    onAddCalendar();
                  }}
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
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(212, 165, 116, 0.26), rgba(111, 76, 55, 0.18))";
                    event.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.55)";
                    event.currentTarget.style.color = tokens.colors.text;
                    event.currentTarget.style.boxShadow =
                      "inset 0 1px 0 rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(212, 165, 116, 0.16), rgba(111, 76, 55, 0.12))";
                    event.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.35)";
                    event.currentTarget.style.color = tokens.colors.textSecondary;
                    event.currentTarget.style.boxShadow =
                      "inset 0 1px 0 rgba(255, 255, 255, 0.04)";
                  }}
                >
                  <PlusIcon size={14} />
                  Add a new calendar
                </button>
              </div>

              {/* Decorative footer */}
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
            </div>
          )}
          </div>
        </div>
      </div>

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
            zIndex: 60,
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
          <button
            onClick={handleSetDefaultCalendar}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginTop: 6,
              background: "transparent",
              border: "none",
              color: tokens.colors.textSecondary,
              fontFamily: tokens.fonts.elegant,
              fontSize: 14,
              textAlign: "left",
              cursor: "pointer",
              borderRadius: tokens.radius.sm,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(212, 165, 116, 0.08)";
              event.currentTarget.style.color = tokens.colors.text;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
              event.currentTarget.style.color = tokens.colors.textSecondary;
            }}
          >
            Set as default
          </button>
          <button
            onClick={handleDeleteCalendar}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginTop: 4,
              background: "transparent",
              border: "none",
              color: "#b06a5b",
              fontFamily: tokens.fonts.elegant,
              fontSize: 14,
              textAlign: "left",
              cursor: "pointer",
              borderRadius: tokens.radius.sm,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(176, 106, 91, 0.12)";
              event.currentTarget.style.color = "#d39b8b";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
              event.currentTarget.style.color = "#b06a5b";
            }}
          >
            Delete calendar
          </button>
        </div>
      )}

      {/* FullCalendar container */}
      <div
        style={{
          flex: 1,
          padding: tokens.spacing.lg,
          overflow: "auto",
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="100%"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          events={[]}
          eventClick={(info) => {
            console.log("Event clicked:", info.event);
          }}
          select={(info) => {
            console.log("Date selected:", info.startStr, "to", info.endStr);
          }}
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

      {/* Create Event Modal */}
      {isCreateEventOpen && (
        <div
          onClick={closeCreateEventModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(16, 12, 10, 0.72)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: tokens.spacing.lg,
            zIndex: 100,
            opacity: isCreateEventVisible ? 1 : 0,
            transition: `opacity ${modalTransitionMs}ms ease`,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "linear-gradient(160deg, #2f2722 0%, #241d1a 100%)",
              borderRadius: tokens.radius.xl,
              border: `1px solid ${tokens.colors.border}`,
              padding: "30px 34px",
              boxShadow: "0 22px 60px rgba(0, 0, 0, 0.45)",
              color: tokens.colors.text,
              transform: isCreateEventVisible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
              opacity: isCreateEventVisible ? 1 : 0,
              transition: `opacity ${modalTransitionMs}ms ease, transform ${modalTransitionMs}ms ease`,
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: tokens.colors.accent,
                marginBottom: tokens.spacing.lg,
              }}
            >
              <CoffeeIcon size={18} />
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontFamily: tokens.fonts.sans,
                }}
              >
                New Event
              </span>
            </div>

            <h3
              style={{
                fontSize: 28,
                fontFamily: tokens.fonts.elegant,
                margin: 0,
                marginBottom: tokens.spacing.lg,
              }}
            >
              Create an Event
            </h3>

            {/* Event Title */}
            <div style={{ marginBottom: tokens.spacing.md }}>
              <label
                style={{
                  display: "block",
                  marginBottom: tokens.spacing.xs,
                  fontSize: 14,
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.elegant,
                }}
              >
                Title *
              </label>
              <input
                value={eventSummary}
                onChange={(e) => {
                  setEventSummary(e.target.value);
                  if (eventError) setEventError(null);
                }}
                placeholder="Event title"
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.colors.borderLight}`,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.text,
                  fontSize: 16,
                  fontFamily: tokens.fonts.elegant,
                  outline: "none",
                }}
              />
            </div>

            {/* Date Range */}
            <div style={{ marginBottom: tokens.spacing.md }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: tokens.spacing.sm,
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: tokens.colors.textSecondary,
                    fontFamily: tokens.fonts.elegant,
                  }}
                >
                  Date Range
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAllDay((prev) => !prev);
                    if (eventError) setEventError(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: `1px solid ${isAllDay ? tokens.colors.accent : tokens.colors.borderLight}`,
                    backgroundColor: isAllDay ? "rgba(212, 165, 116, 0.2)" : tokens.colors.surfaceSecondary,
                    color: isAllDay ? tokens.colors.accent : tokens.colors.textSecondary,
                    fontFamily: tokens.fonts.sans,
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  All day
                  <span
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 999,
                      backgroundColor: isAllDay ? tokens.colors.accent : tokens.colors.borderLight,
                      position: "relative",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: tokens.colors.background,
                        transform: isAllDay ? "translateX(16px)" : "translateX(0)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </span>
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: tokens.spacing.md,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: tokens.colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      marginBottom: 8,
                      fontFamily: tokens.fonts.sans,
                    }}
                  >
                    Start
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 0.9fr 1fr",
                      gap: 8,
                      padding: "10px",
                      borderRadius: tokens.radius.lg,
                      border: `1px solid ${tokens.colors.borderLight}`,
                      backgroundColor: tokens.colors.surface,
                    }}
                  >
                    <Dropdown
                      value={startMonth}
                      options={monthOptions}
                      onChange={(value) => {
                        setStartMonth(Number(value));
                        if (eventError) setEventError(null);
                      }}
                    />
                    <Dropdown
                      value={startDay}
                      options={startDayOptions}
                      onChange={(value) => {
                        setStartDay(Number(value));
                        if (eventError) setEventError(null);
                      }}
                    />
                    <Dropdown
                      value={startYear}
                      options={yearOptions}
                      onChange={(value) => {
                        setStartYear(Number(value));
                        if (eventError) setEventError(null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: tokens.colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      marginBottom: 8,
                      fontFamily: tokens.fonts.sans,
                    }}
                  >
                    End
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 0.9fr 1fr",
                      gap: 8,
                      padding: "10px",
                      borderRadius: tokens.radius.lg,
                      border: `1px solid ${tokens.colors.borderLight}`,
                      backgroundColor: tokens.colors.surface,
                    }}
                  >
                    <Dropdown
                      value={endMonth}
                      options={monthOptions}
                      onChange={(value) => {
                        setEndMonth(Number(value));
                        if (eventError) setEventError(null);
                      }}
                    />
                    <Dropdown
                      value={endDay}
                      options={endDayOptions}
                      onChange={(value) => {
                        setEndDay(Number(value));
                        if (eventError) setEventError(null);
                      }}
                    />
                    <Dropdown
                      value={endYear}
                      options={yearOptions}
                      onChange={(value) => {
                        setEndYear(Number(value));
                        if (eventError) setEventError(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Time Range */}
            <div
              style={{
                marginBottom: tokens.spacing.md,
                opacity: isAllDay ? 0.45 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: tokens.spacing.sm,
                  fontSize: 14,
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.elegant,
                }}
              >
                Time Range
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: tokens.spacing.md,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: tokens.colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      marginBottom: 8,
                      fontFamily: tokens.fonts.sans,
                    }}
                  >
                    Start
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                      padding: "10px",
                      borderRadius: tokens.radius.lg,
                      border: `1px solid ${tokens.colors.borderLight}`,
                      backgroundColor: tokens.colors.surface,
                    }}
                  >
                    <Dropdown
                      value={startHour}
                      options={hourOptions}
                      onChange={(value) => {
                        setStartHour(Number(value));
                        if (eventError) setEventError(null);
                      }}
                      disabled={isAllDay}
                    />
                    <Dropdown
                      value={startMinute}
                      options={minuteOptions}
                      onChange={(value) => {
                        setStartMinute(Number(value));
                        if (eventError) setEventError(null);
                      }}
                      disabled={isAllDay}
                    />
                    <Dropdown
                      value={startMeridiem}
                      options={meridiemOptions}
                      onChange={(value) => {
                        setStartMeridiem(String(value));
                        if (eventError) setEventError(null);
                      }}
                      disabled={isAllDay}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: tokens.colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      marginBottom: 8,
                      fontFamily: tokens.fonts.sans,
                    }}
                  >
                    End
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                      padding: "10px",
                      borderRadius: tokens.radius.lg,
                      border: `1px solid ${tokens.colors.borderLight}`,
                      backgroundColor: tokens.colors.surface,
                    }}
                  >
                    <Dropdown
                      value={endHour}
                      options={hourOptions}
                      onChange={(value) => {
                        setEndHour(Number(value));
                        if (eventError) setEventError(null);
                      }}
                      disabled={isAllDay}
                    />
                    <Dropdown
                      value={endMinute}
                      options={minuteOptions}
                      onChange={(value) => {
                        setEndMinute(Number(value));
                        if (eventError) setEventError(null);
                      }}
                      disabled={isAllDay}
                    />
                    <Dropdown
                      value={endMeridiem}
                      options={meridiemOptions}
                      onChange={(value) => {
                        setEndMeridiem(String(value));
                        if (eventError) setEventError(null);
                      }}
                      disabled={isAllDay}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: tokens.spacing.md }}>
              <label
                style={{
                  display: "block",
                  marginBottom: tokens.spacing.xs,
                  fontSize: 14,
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.elegant,
                }}
              >
                Priority
              </label>
              <div style={{ display: "flex", gap: tokens.spacing.sm }}>
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setEventPriority(p)}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: tokens.radius.md,
                      border: `1px solid ${eventPriority === p ? tokens.colors.accent : tokens.colors.borderLight}`,
                      backgroundColor: eventPriority === p
                        ? `rgba(212, 165, 116, 0.15)`
                        : tokens.colors.surface,
                      color: eventPriority === p ? tokens.colors.accent : tokens.colors.textSecondary,
                      fontSize: 14,
                      fontFamily: tokens.fonts.elegant,
                      fontWeight: eventPriority === p ? 500 : 400,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: tokens.spacing.lg }}>
              <label
                style={{
                  display: "block",
                  marginBottom: tokens.spacing.xs,
                  fontSize: 14,
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.elegant,
                }}
              >
                Description
              </label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Add description (optional)"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.colors.borderLight}`,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.text,
                  fontSize: 16,
                  fontFamily: tokens.fonts.elegant,
                  outline: "none",
                  resize: "vertical",
                  minHeight: 80,
                }}
              />
            </div>

            {/* Error message */}
            {eventError && (
              <p
                style={{
                  margin: 0,
                  marginBottom: tokens.spacing.md,
                  color: tokens.colors.error,
                  fontSize: 14,
                  fontFamily: tokens.fonts.sans,
                }}
              >
                {eventError}
              </p>
            )}

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                onClick={closeCreateEventModal}
                onMouseEnter={() => setHoverCancelBtn(true)}
                onMouseLeave={() => setHoverCancelBtn(false)}
                disabled={eventLoading}
                style={{
                  padding: "12px 22px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.colors.border}`,
                  backgroundColor: hoverCancelBtn ? tokens.colors.surfaceSecondary : "transparent",
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.elegant,
                  fontSize: 16,
                  cursor: eventLoading ? "not-allowed" : "pointer",
                  opacity: eventLoading ? 0.6 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                onMouseEnter={() => setHoverCreateBtn(true)}
                onMouseLeave={() => setHoverCreateBtn(false)}
                disabled={eventLoading || !eventSummary.trim()}
                style={{
                  padding: "12px 26px",
                  borderRadius: tokens.radius.md,
                  border: "none",
                  backgroundColor:
                    hoverCreateBtn && eventSummary.trim()
                      ? tokens.colors.accentHover
                      : tokens.colors.accent,
                  color: tokens.colors.background,
                  fontFamily: tokens.fonts.elegant,
                  fontSize: 16,
                  cursor: eventLoading || !eventSummary.trim() ? "not-allowed" : "pointer",
                  opacity: eventLoading || !eventSummary.trim() ? 0.6 : 1,
                  boxShadow:
                    hoverCreateBtn && eventSummary.trim()
                      ? `0 10px 24px ${tokens.colors.accent}33`
                      : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {eventLoading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
