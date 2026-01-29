// Centralized API module for all backend communication
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface CalendarItem {
  name: string;
  url: string;
}

export interface ChatResponse {
  response: string;
}

export interface StartupStatus {
  total: number;
  completed: number;
  events: Record<string, { label: string; done: boolean }>;
  finished: boolean;
}

// Chat API
export async function sendMessage(message: string, sessionId: string): Promise<string> {
  const response = await api.post<ChatResponse>("/chat", {
    message,
    session_id: sessionId,
  });
  return response.data.response;
}

// Calendar API
export async function listCalendars(): Promise<CalendarItem[]> {
  const response = await api.get<{ calendars: CalendarItem[] }>("/calendar/list_calendars");
  return response.data.calendars ?? [];
}

export async function getDefaultCalendar(): Promise<string | null> {
  const response = await api.get<{ calendar_url: string | null }>("/calendar/get_default_calendar");
  return response.data.calendar_url;
}

export async function createCalendar(name: string): Promise<void> {
  await api.post("/calendar/create_calendar", { calendar_name: name });
}

export async function deleteCalendar(name: string): Promise<void> {
  await api.post("/calendar/delete_calendar", { calendar_name: name });
}

export async function setDefaultCalendar(url: string): Promise<void> {
  await api.post("/calendar/set_default_calendar", { calendar_url: url });
}

// Startup API
export async function getStartupStatus(): Promise<StartupStatus> {
  const response = await api.get<StartupStatus>("/startup/status");
  return response.data;
}

export default api;
