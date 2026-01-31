// Calendar module exports

// Main components
export { default as CalendarManager } from "./CalendarManager";
export { default as CalendarView } from "./CalendarView";

// Modal components
export { CreateCalendarModal } from "./CreateCalendarModal";
export { CreateEventModal } from "./CreateEventModal";

// UI components
export { Dropdown } from "./Dropdown";

// Hooks
export { useCalendarRange, useEventCounts, useRangeEvents } from "./hooks";

// Types
export type { CalendarItem, PriorityCounts, EventCounts, Priority } from "./types";

// Helpers and constants
export { daysInMonth, formatDateKey, toOption, to24Hour } from "./helpers";
export { MONTH_LABELS, WEEKDAY_OPTIONS, RECURRENCE_FREQ_OPTIONS } from "./constants";
