// Modal for creating a new calendar event

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import tokens from "../../tokens";
import { CoffeeIcon } from "../shared/icons";
import { Dropdown } from "./Dropdown";
import { MONTH_LABELS, WEEKDAY_OPTIONS, RECURRENCE_FREQ_OPTIONS } from "./constants";
import { daysInMonth, toOption, to24Hour } from "./helpers";
import type { CalendarItem, EventListItem, Priority } from "./types";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCalendar: CalendarItem;
  onEventCreated?: () => void;
  mode?: "create" | "edit";
  initialEvent?: EventListItem | null;
  onEventUpdated?: () => void;
}

export function CreateEventModal({
  isOpen,
  onClose,
  selectedCalendar,
  onEventCreated,
  mode = "create",
  initialEvent = null,
  onEventUpdated,
}: CreateEventModalProps) {
  const isEditMode = mode === "edit";
  const initialTime = useMemo(() => {
    const base = new Date();
    base.setMinutes(0, 0, 0);
    base.setHours(base.getHours() + 1);
    const end = new Date(base);
    end.setHours(end.getHours() + 1);
    return { start: base, end };
  }, []);

  const [isVisible, setIsVisible] = useState(false);
  const [eventSummary, setEventSummary] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventPriority, setEventPriority] = useState<Priority>("low");
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [hoverCreateBtn, setHoverCreateBtn] = useState(false);
  const [hoverCancelBtn, setHoverCancelBtn] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState("weekly");
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);

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
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const max = daysInMonth(startYear, startMonth);
    if (startDay > max) setStartDay(max);
  }, [startDay, startMonth, startYear]);

  useEffect(() => {
    const max = daysInMonth(endYear, endMonth);
    if (endDay > max) setEndDay(max);
  }, [endDay, endMonth, endYear]);

  const weekdayMap = useMemo(() => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], []);

  function parseDateTime(value?: string | null) {
    if (!value) return null;
    let normalized = value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      normalized = `${normalized}T00:00:00`;
    } else if (/^\d{4}-\d{2}-\d{2} /.test(normalized)) {
      normalized = normalized.replace(" ", "T");
    }
    let parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    if (!normalized.endsWith("Z")) {
      parsed = new Date(`${normalized}Z`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  }

  function to12Hour(hour24: number) {
    const meridiem = hour24 >= 12 ? "PM" : "AM";
    const hour = ((hour24 + 11) % 12) + 1;
    return { hour, meridiem };
  }

  function mapPriorityToLabel(value?: number | null): Priority {
    if (value === 1) return "high";
    if (value === 5) return "medium";
    if (value === 9) return "low";
    if (value != null) {
      if (value <= 3) return "high";
      if (value <= 6) return "medium";
    }
    return "low";
  }

  function resetForm() {
    setEventSummary("");
    setEventDescription("");
    setEventPriority("low");
    setEventError(null);
    setIsAllDay(false);
    setIsRecurring(false);
    setRecurrenceFreq("weekly");
    setRecurrenceDays([weekdayMap[initialTime.start.getDay()]]);
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
  }

  useEffect(() => {
    if (!isOpen) return;
    if (!isEditMode || !initialEvent) {
      if (!isEditMode) resetForm();
      return;
    }

    const start = parseDateTime(initialEvent.dtstart) ?? initialTime.start;
    const end = parseDateTime(initialEvent.dtend) ?? initialTime.end;
    const hasTimeFields = Boolean(initialEvent.timestart || initialEvent.timeend);
    const allDayCandidate =
      !hasTimeFields &&
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      ((end.getHours() === 23 && end.getMinutes() >= 59) ||
        (end.getHours() === 0 && end.getMinutes() === 0 && end > start));

    setEventSummary(initialEvent.summary ?? "");
    setEventDescription(initialEvent.description ?? "");
    setEventPriority(mapPriorityToLabel(initialEvent.priority));
    setEventError(null);
    setIsAllDay(allDayCandidate);
    setIsRecurring(Boolean(initialEvent.rrule_freq));
    setRecurrenceFreq(initialEvent.rrule_freq ?? "weekly");
    setRecurrenceDays(
      initialEvent.rrule_byweekday?.length
        ? initialEvent.rrule_byweekday
        : [weekdayMap[start.getDay()]]
    );

    setStartMonth(start.getMonth());
    setStartDay(start.getDate());
    setStartYear(start.getFullYear());
    setEndMonth(end.getMonth());
    setEndDay(end.getDate());
    setEndYear(end.getFullYear());

    if (initialEvent.timestart) {
      const [hour, minute] = initialEvent.timestart.split(":").map((part) => Number(part));
      const { hour: hour12, meridiem } = to12Hour(Number.isNaN(hour) ? 0 : hour);
      setStartHour(hour12);
      setStartMinute(Number.isNaN(minute) ? 0 : minute);
      setStartMeridiem(meridiem);
    } else {
      const { hour, meridiem } = to12Hour(start.getHours());
      setStartHour(hour);
      setStartMinute(start.getMinutes());
      setStartMeridiem(meridiem);
    }

    if (initialEvent.timeend) {
      const [hour, minute] = initialEvent.timeend.split(":").map((part) => Number(part));
      const { hour: hour12, meridiem } = to12Hour(Number.isNaN(hour) ? 0 : hour);
      setEndHour(hour12);
      setEndMinute(Number.isNaN(minute) ? 0 : minute);
      setEndMeridiem(meridiem);
    } else {
      const { hour, meridiem } = to12Hour(end.getHours());
      setEndHour(hour);
      setEndMinute(end.getMinutes());
      setEndMeridiem(meridiem);
    }
  }, [initialEvent, initialTime, isEditMode, isOpen, weekdayMap]);

  function handleClose() {
    if (eventLoading) return;
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      resetForm();
    }, modalTransitionMs);
  }

  function toLocalISOString(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join("-")
      + "T"
      + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(":");
  }

  async function handleSubmit() {
    if (!eventSummary.trim()) {
      setEventError("Please enter an event title.");
      return;
    }

    if (isRecurring && recurrenceFreq === "weekly" && recurrenceDays.length === 0) {
      setEventError("Select at least one day for weekly recurrence.");
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
      if (isEditMode) {
        if (!initialEvent?.url) {
          setEventError("Missing event reference for editing.");
          return;
        }
        await axios.post("http://127.0.0.1:8000/calendar/edit_event", {
          event_url: initialEvent.url,
          calendar_url: selectedCalendar.url,
          summary: eventSummary.trim(),
          description: eventDescription.trim() || null,
          dtstart: toLocalISOString(dtstart),
          dtend: toLocalISOString(dtend),
          location: null,
          priority: priorityValue,
          rrule_freq: isRecurring ? recurrenceFreq : null,
          rrule_byweekday: isRecurring ? recurrenceDays : null,
        });
        onEventUpdated?.();
      } else {
        await axios.post("http://127.0.0.1:8000/calendar/create_event", {
          calendar_url: selectedCalendar.url,
          summary: eventSummary.trim(),
          description: eventDescription.trim() || null,
          dtstart: toLocalISOString(dtstart),
          dtend: toLocalISOString(dtend),
          location: null,
          priority: priorityValue,
          rrule_freq: isRecurring ? recurrenceFreq : null,
          rrule_byweekday: isRecurring ? recurrenceDays : null,
        });
        onEventCreated?.();
      }
      handleClose();
    } catch (err) {
      console.error(isEditMode ? "Failed to edit event:" : "Failed to create event:", err);
      setEventError(isEditMode ? "Could not update event. Please try again." : "Could not create event. Please try again.");
    } finally {
      setEventLoading(false);
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
        zIndex: 7000,
        opacity: isVisible ? 1 : 0,
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
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
          opacity: isVisible ? 1 : 0,
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
            {isEditMode ? "Edit Event" : "New Event"}
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
          {isEditMode ? "Update Event Details" : "Create an Event"}
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
            <ToggleSwitch
              label="All day"
              isOn={isAllDay}
              onToggle={() => {
                setIsAllDay((prev) => !prev);
                if (eventError) setEventError(null);
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: tokens.spacing.md,
            }}
          >
            <DatePickerGroup
              label="Start"
              month={startMonth}
              day={startDay}
              year={startYear}
              monthOptions={monthOptions}
              dayOptions={startDayOptions}
              yearOptions={yearOptions}
              onMonthChange={(v) => {
                setStartMonth(Number(v));
                if (eventError) setEventError(null);
              }}
              onDayChange={(v) => {
                setStartDay(Number(v));
                if (eventError) setEventError(null);
              }}
              onYearChange={(v) => {
                setStartYear(Number(v));
                if (eventError) setEventError(null);
              }}
            />
            <DatePickerGroup
              label="End"
              month={endMonth}
              day={endDay}
              year={endYear}
              monthOptions={monthOptions}
              dayOptions={endDayOptions}
              yearOptions={yearOptions}
              onMonthChange={(v) => {
                setEndMonth(Number(v));
                if (eventError) setEventError(null);
              }}
              onDayChange={(v) => {
                setEndDay(Number(v));
                if (eventError) setEventError(null);
              }}
              onYearChange={(v) => {
                setEndYear(Number(v));
                if (eventError) setEventError(null);
              }}
            />
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
            <TimePickerGroup
              label="Start"
              hour={startHour}
              minute={startMinute}
              meridiem={startMeridiem}
              hourOptions={hourOptions}
              minuteOptions={minuteOptions}
              meridiemOptions={meridiemOptions}
              disabled={isAllDay}
              onHourChange={(v) => {
                setStartHour(Number(v));
                if (eventError) setEventError(null);
              }}
              onMinuteChange={(v) => {
                setStartMinute(Number(v));
                if (eventError) setEventError(null);
              }}
              onMeridiemChange={(v) => {
                setStartMeridiem(String(v));
                if (eventError) setEventError(null);
              }}
            />
            <TimePickerGroup
              label="End"
              hour={endHour}
              minute={endMinute}
              meridiem={endMeridiem}
              hourOptions={hourOptions}
              minuteOptions={minuteOptions}
              meridiemOptions={meridiemOptions}
              disabled={isAllDay}
              onHourChange={(v) => {
                setEndHour(Number(v));
                if (eventError) setEventError(null);
              }}
              onMinuteChange={(v) => {
                setEndMinute(Number(v));
                if (eventError) setEventError(null);
              }}
              onMeridiemChange={(v) => {
                setEndMeridiem(String(v));
                if (eventError) setEventError(null);
              }}
            />
          </div>
        </div>

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
              Recurrence
            </label>
            <ToggleSwitch
              label="Repeat"
              isOn={isRecurring}
              onToggle={() => {
                setIsRecurring((prev) => !prev);
                if (eventError) setEventError(null);
              }}
            />
          </div>

          {isRecurring && (
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
                  Day
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    padding: "10px",
                    borderRadius: tokens.radius.lg,
                    border: `1px solid ${tokens.colors.borderLight}`,
                    backgroundColor: tokens.colors.surface,
                  }}
                >
                  {WEEKDAY_OPTIONS.map((option) => {
                    const isActive = recurrenceDays.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setRecurrenceDays((prev) =>
                            prev.includes(option.value)
                              ? prev.filter((day) => day !== option.value)
                              : [...prev, option.value]
                          );
                          if (eventError) setEventError(null);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: `1px solid ${isActive ? tokens.colors.accent : tokens.colors.borderLight}`,
                          backgroundColor: isActive
                            ? "rgba(212, 165, 116, 0.2)"
                            : tokens.colors.surfaceSecondary,
                          color: isActive ? tokens.colors.accent : tokens.colors.textSecondary,
                          fontFamily: tokens.fonts.elegant,
                          fontSize: 12,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
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
                  Freq
                </div>
                <div
                  style={{
                    padding: "10px",
                    borderRadius: tokens.radius.lg,
                    border: `1px solid ${tokens.colors.borderLight}`,
                    backgroundColor: tokens.colors.surface,
                  }}
                >
                  <Dropdown
                    value={recurrenceFreq}
                    options={RECURRENCE_FREQ_OPTIONS}
                    onChange={(value) => {
                      setRecurrenceFreq(String(value));
                      if (eventError) setEventError(null);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
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
                  backgroundColor:
                    eventPriority === p ? `rgba(212, 165, 116, 0.15)` : tokens.colors.surface,
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
            onClick={handleClose}
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
            onClick={handleSubmit}
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
            {eventLoading ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper components

function ToggleSwitch({
  label,
  isOn,
  onToggle,
}: {
  label: string;
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${isOn ? tokens.colors.accent : tokens.colors.borderLight}`,
        backgroundColor: isOn ? "rgba(212, 165, 116, 0.2)" : tokens.colors.surfaceSecondary,
        color: isOn ? tokens.colors.accent : tokens.colors.textSecondary,
        fontFamily: tokens.fonts.sans,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {label}
      <span
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          backgroundColor: isOn ? tokens.colors.accent : tokens.colors.borderLight,
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
            transform: isOn ? "translateX(16px)" : "translateX(0)",
            transition: "transform 0.2s ease",
          }}
        />
      </span>
    </button>
  );
}

function DatePickerGroup({
  label,
  month,
  day,
  year,
  monthOptions,
  dayOptions,
  yearOptions,
  onMonthChange,
  onDayChange,
  onYearChange,
}: {
  label: string;
  month: number;
  day: number;
  year: number;
  monthOptions: { label: string; value: number }[];
  dayOptions: { label: string; value: string | number }[];
  yearOptions: { label: string; value: number }[];
  onMonthChange: (v: string | number) => void;
  onDayChange: (v: string | number) => void;
  onYearChange: (v: string | number) => void;
}) {
  return (
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
        {label}
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
        <Dropdown value={month} options={monthOptions} onChange={onMonthChange} />
        <Dropdown value={day} options={dayOptions} onChange={onDayChange} />
        <Dropdown value={year} options={yearOptions} onChange={onYearChange} />
      </div>
    </div>
  );
}

function TimePickerGroup({
  label,
  hour,
  minute,
  meridiem,
  hourOptions,
  minuteOptions,
  meridiemOptions,
  disabled,
  onHourChange,
  onMinuteChange,
  onMeridiemChange,
}: {
  label: string;
  hour: number;
  minute: number;
  meridiem: string;
  hourOptions: { label: string; value: string | number }[];
  minuteOptions: { label: string; value: string | number }[];
  meridiemOptions: { label: string; value: string | number }[];
  disabled?: boolean;
  onHourChange: (v: string | number) => void;
  onMinuteChange: (v: string | number) => void;
  onMeridiemChange: (v: string | number) => void;
}) {
  return (
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
        {label}
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
        <Dropdown value={hour} options={hourOptions} onChange={onHourChange} disabled={disabled} />
        <Dropdown
          value={minute}
          options={minuteOptions}
          onChange={onMinuteChange}
          disabled={disabled}
        />
        <Dropdown
          value={meridiem}
          options={meridiemOptions}
          onChange={onMeridiemChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
