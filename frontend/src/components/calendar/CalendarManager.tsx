// Calendar orchestration component
// Manages calendar state, selection, and loading

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import tokens from "../../tokens";
import { API_BASE_URL } from "../../api";
import { CoffeeIcon, CalendarIcon, PlusIcon } from "../shared/icons";
import { CreateCalendarModal } from "./CreateCalendarModal";
import CalendarView from "./CalendarView";
import type { CalendarItem } from "./types";

interface CalendarManagerProps {
  refreshToken: number;
}

export default function CalendarManager({ refreshToken }: CalendarManagerProps) {
  const [, setCalendars] = useState<CalendarItem[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarItem | null>(null);
  const [defaultCalendarUrl, setDefaultCalendarUrl] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverPrimary, setHoverPrimary] = useState(false);

  // View transition state
  const [activeView, setActiveView] = useState<"calendar" | "empty">("empty");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const lastCalendarRef = useRef<CalendarItem | null>(null);
  const viewTransitionMs = 240;

  // Load calendars on mount and refresh
  useEffect(() => {
    let isActive = true;

    const loadCalendars = async () => {
      const defaultUrl = await fetchDefaultCalendar();
      const calendarList = await fetchCalendars();
      if (!isActive) return;

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

  // Track last selected calendar for fade transitions
  useEffect(() => {
    if (selectedCalendar) {
      lastCalendarRef.current = selectedCalendar;
    }
  }, [selectedCalendar]);

  // Handle view transitions
  useEffect(() => {
    if (initialLoading) return;

    const nextView = selectedCalendar ? "calendar" : "empty";
    if (nextView === activeView) return;

    setIsFadingOut(true);
    const timeout = window.setTimeout(() => {
      setActiveView(nextView);
      setIsFadingOut(false);
    }, viewTransitionMs);

    return () => window.clearTimeout(timeout);
  }, [activeView, initialLoading, selectedCalendar, viewTransitionMs]);

  async function fetchCalendars() {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/list_calendars`);
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
      const response = await axios.get(`${API_BASE_URL}/calendar/get_default_calendar`);
      const calendarUrl = response.data?.calendar_url ?? null;
      setDefaultCalendarUrl(calendarUrl);
      return calendarUrl as string | null;
    } catch {
      console.error("Failed to fetch default calendar");
      setDefaultCalendarUrl(null);
      return null;
    }
  }

  function handleCalendarSelect(calendar: CalendarItem | null) {
    setSelectedCalendar(calendar);
  }

  function handleCalendarCreated(calendar: CalendarItem) {
    setCalendars((prev) => [...prev, calendar]);
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
          onAddCalendar={() => setIsModalOpen(true)}
          defaultCalendarUrl={defaultCalendarUrl}
          onDefaultCalendarChange={setDefaultCalendarUrl}
        />
      ) : (
        <EmptyState onCreateClick={() => setIsModalOpen(true)} hoverPrimary={hoverPrimary} setHoverPrimary={setHoverPrimary} />
      )}

      <CreateCalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCalendarCreated={handleCalendarCreated}
      />
    </div>
  );
}

// Empty state when no calendars exist
function EmptyState({
  onCreateClick,
  hoverPrimary,
  setHoverPrimary,
}: {
  onCreateClick: () => void;
  hoverPrimary: boolean;
  setHoverPrimary: (value: boolean) => void;
}) {
  return (
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
      {/* Decorative divider */}
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

      {/* Calendar icon */}
      <div
        style={{
          color: tokens.colors.accent,
          marginBottom: tokens.spacing.lg,
          opacity: 0.5,
        }}
      >
        <CalendarIcon size={72} />
      </div>

      {/* Heading */}
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

      {/* Subtitle */}
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

      {/* Create button */}
      <button
        onClick={onCreateClick}
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
          backgroundColor: hoverPrimary ? tokens.colors.accentHover : tokens.colors.accent,
          border: "none",
          borderRadius: tokens.radius.lg,
          cursor: "pointer",
          transition: "background-color 0.2s, transform 0.15s, box-shadow 0.2s",
          transform: hoverPrimary ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hoverPrimary ? `0 8px 24px ${tokens.colors.accent}33` : "none",
          letterSpacing: 0.5,
        }}
      >
        <PlusIcon size={22} />
        Start New Calendar
      </button>
    </div>
  );
}
