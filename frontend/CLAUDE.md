# Maia Frontend — Navigation Guide

Quick map of the frontend layout, architecture, and component interactions.
Intended for LLMs and developers navigating this codebase.

---

## Entry Points

- `src/main.tsx` — React entry point, renders `Root` wrapper with loading screen
- `src/App.tsx` — Main app container, page routing between chat and calendar

---

## Directory Structure

```
frontend/src/
├── main.tsx                    # React entry point, startup loading logic
├── App.tsx                     # Root app, page routing, layout
├── tokens.ts                   # Design system (colors, fonts, spacing, transitions)
├── App.css                     # Global styles, animations, scrollbar
├── index.css                   # Base CSS reset
├── vite-env.d.ts               # Vite type definitions
│
├── api/
│   └── index.ts                # Centralized API module (chat + calendar + startup)
│
├── hooks/
│   └── useAnimatedVisibility.ts  # Modal/popup animation state hook
│
├── components/
│   ├── shared/                 # Shared utilities across all components
│   │   ├── index.ts            # Barrel exports
│   │   ├── icons.tsx           # Centralized icon components
│   │   └── hooks.ts            # Shared hooks (useAnimatedVisibility, useHover, useClickOutside)
│   │
│   ├── calendar/               # Calendar module
│   │   ├── index.ts            # Barrel exports
│   │   ├── types.ts            # CalendarItem, PriorityCounts, EventCounts types
│   │   ├── constants.ts        # MONTH_LABELS, WEEKDAY_OPTIONS, etc.
│   │   ├── helpers.ts          # daysInMonth, formatDateKey, toOption, to24Hour
│   │   ├── hooks.ts            # useCalendarRange, useEventCounts
│   │   ├── calendarStyles.ts   # FullCalendar CSS-in-JS styles
│   │   ├── Dropdown.tsx        # Reusable dropdown select component
│   │   ├── CalendarManager.tsx # Main orchestrator, calendar state management
│   │   ├── CalendarView.tsx    # FullCalendar display, header, popups
│   │   ├── CreateCalendarModal.tsx  # Modal for creating calendars
│   │   └── CreateEventModal.tsx     # Modal for creating events
│   │
│   ├── chat/                   # Chat module
│   │   ├── index.ts            # Barrel exports
│   │   ├── types.ts            # Turn type definition
│   │   ├── markdown.tsx        # parseText, parseInlineMarkdown, MarkdownBlock, CodeBlock
│   │   ├── ChatWindow.tsx      # Main chat interface
│   │   ├── Message.tsx         # Message rendering with markdown
│   │   ├── EmptyState.tsx      # Empty state when no messages
│   │   └── InputBar.tsx        # Chat input with send button
│   │
│   ├── loading/                # Loading module
│   │   ├── index.ts            # Barrel exports
│   │   └── LoadingScreen.tsx   # Startup progress display
│   │
│   └── sidebar/                # Sidebar module
│       ├── index.ts            # Barrel exports
│       ├── types.ts            # Page type definition
│       └── Sidebar.tsx         # Left navigation
│
└── assets/
    ├── Maia_Avatars/           # Avatar images/GIFs
    └── Calendar_Icons/         # Calendar icons
```

---

## Design System

**File:** `tokens.ts`

### Colors (Warm Coffee Shop Theme)
```typescript
background: "#1c1816"      // Dark espresso
surface: "#2a2320"         // Medium brown
surfaceSecondary: "#3a322d"
accent: "#d4a574"          // Warm gold/caramel
accentHover: "#c4956a"
accentMuted: "rgba(212, 165, 116, 0.12)"
text: "#f5ebe0"            // Cream
textSecondary: "#c4b5a8"
textMuted: "#8a7b6d"
error: "#b06a5b"
```

### Fonts
```typescript
sans: '"Handlee", "Gochi Hand", cursive'
elegant: '"Cormorant Garamond", Georgia, serif'
mono: '"JetBrains Mono", "Fira Code", monospace'
```

### Spacing, Radius, Transitions, Shadows
```typescript
spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 }
transitions: { fast: 150, normal: 200, slow: 300, modal: 220 }
shadows: { sm, md, lg, xl }
```

---

## Shared Modules

### Icons (`components/shared/icons.tsx`)
Centralized icon components used across the app:
- `PlusIcon`, `ChatIcon`, `CalendarIcon`, `CalendarListIcon`
- `CoffeeIcon`, `RobotIcon`, `ChevronIcon`, `CheckIcon`
- `MoreIcon`, `EditIcon`, `StarIcon`, `UserIcon`, `SendIcon`, `CloseIcon`, `EventIcon`

All icons accept a `size` prop.

### Shared Hooks (`components/shared/hooks.ts`)
- `useAnimatedVisibility({ exitDuration })` — Modal/popup animation state
- `useHover()` — Simple hover state management
- `useClickOutside(ref, handler, enabled)` — Click outside detection

### API (`api/index.ts`)
Centralized API module with typed functions:

```typescript
// Chat
sendMessage(message, sessionId): Promise<string>

// Calendar
listCalendars(): Promise<CalendarItem[]>
getDefaultCalendar(): Promise<string | null>
createCalendar(name): Promise<void>
deleteCalendar(name): Promise<void>
setDefaultCalendar(url): Promise<void>

// Startup
getStartupStatus(): Promise<StartupStatus>
```

---

## Module Architecture

### Calendar Module (`components/calendar/`)

**CalendarManager** — Main orchestrator
- Manages calendar list, selection, and loading states
- Handles view transitions between empty state and calendar view
- Creates calendars via modal

**CalendarView** — FullCalendar display
- FullCalendar with dayGrid, timeGrid, interaction, rrule plugins
- Calendar selector dropdown with context menu
- Events popup with create/edit options
- Set default / delete calendar actions

**CreateCalendarModal** — Calendar creation
**CreateEventModal** — Event creation with date/time pickers, recurrence, priority

**Hooks:**
- `useCalendarRange()` — Tracks current calendar view range
- `useEventCounts()` — Fetches event counts for month view

### Chat Module (`components/chat/`)

**ChatWindow** — Main interface
- Session management with UUID
- Auto-scroll, auto-resize textarea
- Message list with loading indicator

**Message** — Rich text rendering
- Code blocks with syntax highlighting
- Markdown: headers, lists, blockquotes, bold, italic, links

**EmptyState** — Welcome screen with suggestions
**InputBar** — Chat input with send button

### Loading Module (`components/loading/`)

**LoadingScreen** — Startup display
- Polls `/startup/status`
- Progress bar with current step label
- Fade-out transition when complete

### Sidebar Module (`components/sidebar/`)

**Sidebar** — Navigation
- Chat and Calendar navigation buttons
- Shows "New Conversation" when chat has messages
- Maia avatar footer

---

## API Integration

**Base URL:** `http://127.0.0.1:8000`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat` | POST | Send chat message |
| `/calendar/list_calendars` | GET | Get all calendars |
| `/calendar/get_default_calendar` | GET | Get default calendar URL |
| `/calendar/create_calendar` | POST | Create new calendar |
| `/calendar/delete_calendar` | POST | Delete calendar |
| `/calendar/set_default_calendar` | POST | Set default calendar |
| `/calendar/create_event` | POST | Create calendar event |
| `/calendar/get_event_counts` | POST | Get event counts by priority |
| `/startup/status` | GET | Get startup progress |

---

## Dependencies

**Core:**
- `react@19.1.0`, `react-dom@19.1.0`
- `axios@1.11.0`

**Calendar:**
- `@fullcalendar/react`, `core`, `daygrid`, `timegrid`, `interaction`, `rrule`

**Build:**
- `vite@7.1.3`, `typescript~5.8.3`, `@tauri-apps/cli@2.9.6`

---

## Quick Reference

| I want to... | Go to |
|--------------|-------|
| Add/modify an icon | `components/shared/icons.tsx` |
| Add shared hook | `components/shared/hooks.ts` |
| Change theme colors | `tokens.ts` |
| Add API endpoint | `api/index.ts` |
| Modify chat UI | `components/chat/ChatWindow.tsx` |
| Edit message rendering | `components/chat/Message.tsx`, `markdown.tsx` |
| Update calendar view | `components/calendar/CalendarView.tsx` |
| Modify event creation | `components/calendar/CreateEventModal.tsx` |
| Change calendar management | `components/calendar/CalendarManager.tsx` |
| Add calendar hooks | `components/calendar/hooks.ts` |
| Change navigation | `components/sidebar/Sidebar.tsx` |
| Modify page routing | `src/App.tsx` |
| Update loading screen | `components/loading/LoadingScreen.tsx` |

---

## Import Examples

```typescript
// Import from module barrel exports
import { Sidebar, type Page } from "./components/sidebar";
import { ChatWindow, Message } from "./components/chat";
import { CalendarManager, CalendarView } from "./components/calendar";
import { LoadingScreen } from "./components/loading";

// Import shared utilities
import { PlusIcon, CoffeeIcon, useAnimatedVisibility } from "./components/shared";
```
