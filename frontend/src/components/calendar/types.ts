// Calendar-related type definitions

export interface CalendarItem {
  name: string;
  url: string;
}

export interface PriorityCounts {
  high: number;
  medium: number;
  low: number;
}

export type EventCounts = Record<string, PriorityCounts>;

export type Priority = "low" | "medium" | "high";

export interface EventListItem {
  uid: string;
  summary: string;
  description?: string | null;
  dtstart: string;
  dtend: string;
  timestart?: string | null;
  timeend?: string | null;
  location?: string | null;
  priority?: number | null;
  url: string;
  rrule_freq?: string | null;
  rrule_byweekday?: string[] | null;
}
