// Modal for creating a new calendar

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import tokens from "../../tokens";
import { CoffeeIcon } from "../shared/icons";
import type { CalendarItem } from "./types";

interface CreateCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalendarCreated: (calendar: CalendarItem) => void;
}

export function CreateCalendarModal({
  isOpen,
  onClose,
  onCalendarCreated,
}: CreateCalendarModalProps) {
  const [calendarName, setCalendarName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoverCreate, setHoverCreate] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const modalTransitionMs = 220;

  const isValidName = calendarName.trim().length > 0;

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function handleClose() {
    if (loading) return;
    setIsVisible(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
      setCalendarName("");
      setError(null);
      closeTimerRef.current = null;
    }, modalTransitionMs);
  }

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
      const response = await axios.get("http://127.0.0.1:8000/calendar/list_calendars");
      const calendarList: CalendarItem[] = response.data.calendars;
      const newCalendar = calendarList.find((c) => c.name === trimmedName);
      if (newCalendar) {
        onCalendarCreated(newCalendar);
      }
      handleClose();
    } catch {
      setError("Could not create the calendar. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
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
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${modalTransitionMs}ms ease`,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          background: "linear-gradient(160deg, #2f2722 0%, #241d1a 100%)",
          borderRadius: tokens.radius.xl,
          border: `1px solid ${tokens.colors.border}`,
          padding: "30px 34px",
          boxShadow: "0 22px 60px rgba(0, 0, 0, 0.45)",
          color: tokens.colors.text,
          transform: isVisible ? "translateY(0)" : "translateY(12px)",
          opacity: isVisible ? 1 : 0,
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
          Something warm and memorable, like "Morning Espresso" or "Cozy Plans".
        </p>

        <input
          value={calendarName}
          onChange={(event) => {
            setCalendarName(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && isValidName) handleCreate();
            if (event.key === "Escape") handleClose();
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
            onClick={handleClose}
            onMouseEnter={() => setHoverCancel(true)}
            onMouseLeave={() => setHoverCancel(false)}
            disabled={loading}
            style={{
              padding: "12px 22px",
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.colors.border}`,
              backgroundColor: hoverCancel ? tokens.colors.surfaceSecondary : "transparent",
              color: tokens.colors.textSecondary,
              fontFamily: tokens.fonts.elegant,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
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
              backgroundColor:
                hoverCreate && isValidName ? tokens.colors.accentHover : tokens.colors.accent,
              color: tokens.colors.background,
              fontFamily: tokens.fonts.elegant,
              fontSize: 16,
              cursor: loading || !isValidName ? "not-allowed" : "pointer",
              opacity: loading || !isValidName ? 0.6 : 1,
              boxShadow:
                hoverCreate && isValidName ? `0 10px 24px ${tokens.colors.accent}33` : "none",
            }}
          >
            {loading ? "Brewing..." : "Create Calendar"}
          </button>
        </div>
      </div>
    </div>
  );
}
