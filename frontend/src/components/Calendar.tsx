import { useEffect, useRef, useState } from "react";
import axios from "axios";
import tokens from "../tokens";
import CalendarView from "./CalendarView";

interface CalendarItem {
  name: string;
  url: string;
}

interface CalendarProps {
  refreshToken: number;
}

function CalendarIcon({ size = 18 }: { size?: number }) {
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
    </svg>
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

function PlusIcon({ size = 24 }: { size?: number }) {
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

export default function Calendar({ refreshToken }: CalendarProps) {
  const [loading, setLoading] = useState(false);
  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverCreate, setHoverCreate] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [calendarName, setCalendarName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarItem | null>(null);
  const [defaultCalendarUrl, setDefaultCalendarUrl] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeView, setActiveView] = useState<"calendar" | "empty">("empty");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const isValidName = calendarName.trim().length > 0;
  const closeTimerRef = useRef<number | null>(null);
  const lastCalendarRef = useRef<CalendarItem | null>(null);
  const modalTransitionMs = 220;
  const viewTransitionMs = 240;

  useEffect(() => {
    let isActive = true;

    const loadCalendars = async () => {
      const defaultUrl = await fetchDefaultCalendar();
      const calendarList = await fetchCalendars();
      if (!isActive) {
        return;
      }
      if (defaultUrl) {
        const match = calendarList.find((calendar) => calendar.url === defaultUrl);
        if (match) {
          setSelectedCalendar(match);
          return;
        }
      }
      if (calendarList.length > 0) {
        setSelectedCalendar((prev) => prev ?? calendarList[0]);
      }
    };

    loadCalendars();
    return () => {
      isActive = false;
    };
  }, [refreshToken]);

  useEffect(() => {
    if (selectedCalendar) {
      lastCalendarRef.current = selectedCalendar;
    }
  }, [selectedCalendar]);

  async function fetchCalendars() {
    try {
      const response = await axios.get("http://127.0.0.1:8000/calendar/list_calendars");
      const calendarList: CalendarItem[] = response.data.calendars;
      setCalendars(calendarList);
      if (calendarList.length > 0 && !selectedCalendar) {
        setSelectedCalendar(calendarList[0]);
      }
      return calendarList;
    } catch {
      console.error("Failed to fetch calendars");
      return [] as CalendarItem[];
    } finally {
      setInitialLoading(false);
    }
  }

  async function fetchDefaultCalendar() {
    try {
      const response = await axios.get("http://127.0.0.1:8000/calendar/get_default_calendar");
      const calendarUrl = response.data?.calendar_url ?? null;
      setDefaultCalendarUrl(calendarUrl);
      return calendarUrl as string | null;
    } catch {
      console.error("Failed to fetch default calendar");
      setDefaultCalendarUrl(null);
      return null;
    }
  }

  useEffect(() => {
    if (initialLoading) {
      return;
    }
    const nextView = selectedCalendar ? "calendar" : "empty";
    if (nextView === activeView) {
      return;
    }
    setIsFadingOut(true);
    const timeout = window.setTimeout(() => {
      setActiveView(nextView);
      setIsFadingOut(false);
    }, viewTransitionMs);
    return () => window.clearTimeout(timeout);
  }, [activeView, initialLoading, selectedCalendar, viewTransitionMs]);

  useEffect(() => {
    if (isModalOpen) {
      requestAnimationFrame(() => setIsModalVisible(true));
      return;
    }
    setIsModalVisible(false);
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  async function handleCreate() {
    const trimmedName = calendarName.trim();
    if (!trimmedName) {
      setError("Please give your calendar a name.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post("http://127.0.0.1:8000/calendar/create_calendar", {
        calendar_name: trimmedName,
      });
      setIsModalOpen(false);
      setCalendarName("");
      // Refresh calendars and select the new one
      const response = await axios.get("http://127.0.0.1:8000/calendar/list_calendars");
      const calendarList: CalendarItem[] = response.data.calendars;
      setCalendars(calendarList);
      const newCalendar = calendarList.find((c) => c.name === trimmedName);
      if (newCalendar) {
        setSelectedCalendar(newCalendar);
      }
    } catch {
      setError("Could not create the calendar. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setCalendarName("");
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (loading) {
      return;
    }
    setIsModalVisible(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsModalOpen(false);
      closeTimerRef.current = null;
    }, modalTransitionMs);
    setError(null);
  }

  function handleCalendarSelect(calendar: CalendarItem | null) {
    setSelectedCalendar(calendar);
  }

  // Show loading spinner during initial load
  if (initialLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: tokens.colors.textMuted,
          backgroundColor: tokens.colors.background,
          gap: tokens.spacing.md,
        }}
      >
        <CoffeeIcon size={32} />
        <span
          style={{
            fontFamily: tokens.fonts.elegant,
            fontStyle: "italic",
            fontSize: 16,
          }}
        >
          Warming up your calendars...
        </span>
      </div>
    );
  }

  const calendarToShow = selectedCalendar ?? lastCalendarRef.current;

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: tokens.colors.background,
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? "translateY(8px)" : "translateY(0)",
        transition: `opacity ${viewTransitionMs}ms ease, transform ${viewTransitionMs}ms ease`,
      }}
    >
      {activeView === "calendar" && calendarToShow ? (
        <CalendarView
          selectedCalendar={calendarToShow}
          onCalendarSelect={handleCalendarSelect}
          onAddCalendar={openModal}
          defaultCalendarUrl={defaultCalendarUrl}
          onDefaultCalendarChange={setDefaultCalendarUrl}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: tokens.colors.textMuted,
            textAlign: "center",
            padding: tokens.spacing.xl,
          }}
        >
          {/* decorative divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: tokens.colors.borderLight,
              marginBottom: 40,
            }}
          >
            <div style={{ width: 40, height: 1, background: tokens.colors.border }} />
            <CoffeeIcon size={16} />
            <div style={{ width: 40, height: 1, background: tokens.colors.border }} />
          </div>

          {/* calendar icon */}
          <div
            style={{
              color: tokens.colors.accent,
              marginBottom: tokens.spacing.lg,
              opacity: 0.5,
            }}
          >
            <CalendarIcon size={72} />
          </div>

          {/* heading */}
          <h2
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: tokens.colors.text,
              margin: 0,
              marginBottom: tokens.spacing.sm,
              lineHeight: 1.3,
              fontFamily: tokens.fonts.elegant,
            }}
          >
            No calendar available
          </h2>

          {/* subtitle */}
          <p
            style={{
              fontSize: 18,
              color: tokens.colors.textSecondary,
              margin: 0,
              marginBottom: 48,
              fontFamily: tokens.fonts.elegant,
              fontStyle: "italic",
              fontWeight: 300,
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            Brew up a fresh calendar to keep your days warm and organized.
          </p>

          {/* create button */}
          <button
            onClick={openModal}
            onMouseEnter={() => setHoverPrimary(true)}
            onMouseLeave={() => setHoverPrimary(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "18px 48px",
              fontSize: 20,
              fontFamily: tokens.fonts.elegant,
              fontWeight: 500,
              color: tokens.colors.background,
              backgroundColor: hoverPrimary
                ? tokens.colors.accentHover
                : tokens.colors.accent,
              border: "none",
              borderRadius: tokens.radius.lg,
              cursor: "pointer",
              transition: "background-color 0.2s, transform 0.15s, box-shadow 0.2s",
              transform: hoverPrimary ? "translateY(-2px)" : "translateY(0)",
              boxShadow: hoverPrimary
                ? `0 8px 24px ${tokens.colors.accent}33`
                : "none",
              letterSpacing: 0.5,
            }}
          >
            <PlusIcon size={22} />
            Start New Calendar
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(16, 12, 10, 0.72)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: tokens.spacing.lg,
            zIndex: 40,
            opacity: isModalVisible ? 1 : 0,
            transition: `opacity ${modalTransitionMs}ms ease`,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              background:
                "linear-gradient(160deg, #2f2722 0%, #241d1a 100%)",
              borderRadius: tokens.radius.xl,
              border: `1px solid ${tokens.colors.border}`,
              padding: "30px 34px",
              boxShadow: "0 22px 60px rgba(0, 0, 0, 0.45)",
              color: tokens.colors.text,
              transform: isModalVisible
                ? "translateY(0)"
                : "translateY(12px)",
              opacity: isModalVisible ? 1 : 0,
              transition: `opacity ${modalTransitionMs}ms ease, transform ${modalTransitionMs}ms ease`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: tokens.colors.accent,
                marginBottom: tokens.spacing.sm + 30,
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
                New calendar
              </span>
            </div>

            <h3
              style={{
                fontSize: 28,
                fontFamily: tokens.fonts.elegant,
                margin: 0,
                marginBottom: tokens.spacing.xs,
              }}
            >
              Name your calendar
            </h3>

            <p
              style={{
                margin: 0,
                marginBottom: tokens.spacing.lg,
                color: tokens.colors.textSecondary,
                fontSize: 16,
                lineHeight: 1.5,
                fontFamily: tokens.fonts.elegant,
                fontStyle: "italic",
              }}
            >
              Something warm and memorable, like “Morning Espresso” or “Cozy
              Plans”.
            </p>

            <input
              value={calendarName}
              onChange={(event) => {
                setCalendarName(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && isValidName) {
                  handleCreate();
                }
                if (event.key === "Escape") {
                  closeModal();
                }
              }}
              autoFocus
              placeholder="Calendar name"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.colors.borderLight}`,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.text,
                fontSize: 16,
                fontFamily: tokens.fonts.elegant,
                outline: "none",
                marginBottom: error ? tokens.spacing.sm : tokens.spacing.lg,
              }}
            />

            {error && (
              <p
                style={{
                  margin: 0,
                  marginBottom: tokens.spacing.lg,
                  color: tokens.colors.accent,
                  fontSize: 14,
                  fontFamily: tokens.fonts.sans,
                }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                onClick={closeModal}
                onMouseEnter={() => setHoverCancel(true)}
                onMouseLeave={() => setHoverCancel(false)}
                style={{
                  padding: "12px 22px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.colors.border}`,
                  backgroundColor: hoverCancel
                    ? tokens.colors.surfaceSecondary
                    : "transparent",
                  color: tokens.colors.textSecondary,
                  fontFamily: tokens.fonts.elegant,
                  fontSize: 16,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                onMouseEnter={() => setHoverCreate(true)}
                onMouseLeave={() => setHoverCreate(false)}
                disabled={loading || !isValidName}
                style={{
                  padding: "12px 26px",
                  borderRadius: tokens.radius.md,
                  border: "none",
                  backgroundColor: hoverCreate && isValidName
                    ? tokens.colors.accentHover
                    : tokens.colors.accent,
                  color: tokens.colors.background,
                  fontFamily: tokens.fonts.elegant,
                  fontSize: 16,
                  cursor:
                    loading || !isValidName ? "not-allowed" : "pointer",
                  opacity: loading || !isValidName ? 0.6 : 1,
                  boxShadow: hoverCreate && isValidName
                    ? `0 10px 24px ${tokens.colors.accent}33`
                    : "none",
                }}
              >
                {loading ? "Brewing..." : "Create Calendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
