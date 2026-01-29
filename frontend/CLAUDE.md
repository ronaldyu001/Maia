# Maia Frontend — Navigation Guide

Quick map of the frontend layout, architecture, and component interactions.
Intended for LLMs and developers navigating this codebase.

---

## Entry Points

- `src/main.tsx` — React entry point, renders `Root` wrapper with loading screen
- `src/components/App.tsx` — Main app container, page routing between chat and calendar

---

## Directory Structure

```
frontend/src/
├── main.tsx                    # React entry point, startup loading logic
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
│   ├── icons.tsx               # Centralized icon components
│   ├── App.tsx                 # Root app, page routing, layout
│   ├── Sidebar.tsx             # Left navigation (Chat/Calendar buttons)
│   ├── ChatWindow.tsx          # Chat interface, message handling
│   ├── Message.tsx             # Message rendering with markdown support
│   ├── Calendar.tsx            # Calendar management, create modal
│   ├── CalendarView.tsx        # FullCalendar display, calendar selector
│   └── LoadingScreen.tsx       # Startup progress display
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

### Icons (`components/icons.tsx`)
Centralized icon components used across the app:
- `PlusIcon`, `ChatIcon`, `CalendarIcon`, `CalendarListIcon`
- `CoffeeIcon`, `RobotIcon`, `ChevronIcon`, `CheckIcon`
- `MoreIcon`, `StarIcon`, `UserIcon`, `SendIcon`

All icons accept a `size` prop.

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

### Hooks (`hooks/useAnimatedVisibility.ts`)
Custom hook for modal/popup animation state:

```typescript
const { isOpen, isVisible, open, close, toggle } = useAnimatedVisibility({
  exitDuration: 200
});
```

Handles the common pattern of `isOpen` (DOM presence) + `isVisible` (CSS transition state).

---

## Component Architecture

### App.tsx — Root Container
- Manages `currentPage` state ("chat" | "calendar")
- Slide animation between pages (400ms)
- Fixed sidebar (260px) + flexible content

### Sidebar.tsx — Navigation
- Chat and Calendar navigation buttons
- Shows "New Conversation" when chat has messages

### ChatWindow.tsx — Chat Interface
- Session management with UUID
- Auto-scroll, auto-resize textarea
- Markdown message rendering

### Message.tsx — Rich Text Rendering
- Code blocks with syntax highlighting
- Markdown: headers, lists, blockquotes, bold, italic, links

### Calendar.tsx — Calendar Management
- Fetches and manages calendar list
- Create calendar modal
- Default calendar preference

### CalendarView.tsx — FullCalendar Display
- FullCalendar with dayGrid, timeGrid, interaction
- Calendar selector dropdown with context menu
- Set default / delete calendar actions

### LoadingScreen.tsx — Startup Display
- Polls `/startup/status`
- Progress bar with current step label

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
| `/startup/status` | GET | Get startup progress |

---

## Dependencies

**Core:**
- `react@19.1.0`, `react-dom@19.1.0`
- `axios@1.11.0`

**Calendar:**
- `@fullcalendar/react`, `core`, `daygrid`, `timegrid`, `interaction`

**Build:**
- `vite@7.1.3`, `typescript~5.8.3`, `@tauri-apps/cli@2.9.6`

---

## Quick Reference

| I want to... | Go to |
|--------------|-------|
| Add/modify an icon | `components/icons.tsx` |
| Change theme colors | `tokens.ts` |
| Add API endpoint | `api/index.ts` |
| Modify chat UI | `components/ChatWindow.tsx` |
| Edit message rendering | `components/Message.tsx` |
| Update calendar features | `components/Calendar.tsx`, `CalendarView.tsx` |
| Add animated dialog | `hooks/useAnimatedVisibility.ts` |
| Change navigation | `components/Sidebar.tsx` |
| Modify page routing | `components/App.tsx` |
