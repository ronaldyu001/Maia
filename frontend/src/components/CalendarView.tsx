import { useEffect, useRef, useState } from "react";
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
  const [tabHover, setTabHover] = useState(false);
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null);
  const [hoveredMoreBtn, setHoveredMoreBtn] = useState<string | null>(null);
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [contextCalendar, setContextCalendar] = useState<CalendarItem | null>(null);
  const [contextPos, setContextPos] = useState({ right: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);
  const transitionMs = 200;
  const contextTransitionMs = 180;

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
            <span style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedCalendar.name}
            </span>
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
    </div>
  );
}
