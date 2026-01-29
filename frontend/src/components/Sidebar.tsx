import { useState } from "react";
import tokens from "../tokens";

export type Page = "chat" | "calendar";

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
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
      <circle cx="8" cy="15" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

function RobotIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={tokens.colors.accent}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="8" width="14" height="10" rx="2" />
      <line x1="12" y1="8" x2="12" y2="4" />
      <circle cx="12" cy="3" r="1" fill={tokens.colors.accent} />
      <circle cx="9" cy="12" r="1.5" fill={tokens.colors.accent} />
      <circle cx="15" cy="12" r="1.5" fill={tokens.colors.accent} />
      <path d="M9 15.5c0 0 1.5 1 3 1s3-1 3-1" />
      <rect x="2" y="11" width="2" height="4" rx="0.5" />
      <rect x="20" y="11" width="2" height="4" rx="0.5" />
    </svg>
  );
}

// Shared styling for active vs inactive sidebar buttons
const activeStyle: React.CSSProperties = {
  backgroundColor: tokens.colors.accent,
  color: "#1c1816",
  borderTop: "1px solid rgba(255, 255, 255, 0.15)",
  borderBottom: "5px solid #a07a50",
};

const inactiveStyle: React.CSSProperties = {
  backgroundColor: "#332b25",
  color: tokens.colors.textSecondary,
  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
  borderBottom: "5px solid #241e19",
};

export default function Sidebar({
  currentPage,
  onNavigate,
  onCalendarOpen,
  hasConversation,
  onNewConversation,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onCalendarOpen: () => void;
  hasConversation: boolean;
  onNewConversation: () => void;
}) {
  const [chatHovered, setChatHovered] = useState(false);
  const [calendarHovered, setCalendarHovered] = useState(false);

  const chatActive = currentPage === "chat";
  const calendarActive = currentPage === "calendar";

  function handleConversationClick() {
    if (!chatActive) {
      onNavigate("chat");
    } else if (hasConversation) {
      onNewConversation();
    }
  }

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        backgroundColor: tokens.colors.sidebarBg,
        borderRight: `1px solid ${tokens.colors.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Top Buttons */}
      <div style={{ padding: tokens.spacing.md + 20, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Conversation Button */}
        <button
          onClick={handleConversationClick}
          onMouseEnter={(e) => {
            setChatHovered(true);
            e.currentTarget.style.borderBottomWidth = "4px";
            e.currentTarget.style.transform = "translateY(1px)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            setChatHovered(false);
            e.currentTarget.style.borderBottomWidth = "5px";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
          }}
          style={{
            width: "80%",
            aspectRatio: "1 / 0.8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            gap: 12,
            padding: tokens.spacing.lg,
            border: "none",
            borderRadius: tokens.radius.lg,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            transform: "translateY(0)",
            fontFamily: tokens.fonts.elegant,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.3px",
            cursor: "pointer",
            transition: "all 0.15s ease",
            ...(chatActive ? activeStyle : inactiveStyle),
            ...(!chatActive && chatHovered ? { color: tokens.colors.accent } : {}),
          }}
        >
          {chatActive && hasConversation ? <PlusIcon /> : <ChatIcon />}
          <span>{chatActive && hasConversation ? "New Conversation" : "Conversation"}</span>
        </button>

        {/* Calendar Button */}
        <button
          onClick={onCalendarOpen}
          onMouseEnter={(e) => {
            setCalendarHovered(true);
            e.currentTarget.style.borderBottomWidth = "4px";
            e.currentTarget.style.transform = "translateY(1px)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            setCalendarHovered(false);
            e.currentTarget.style.borderBottomWidth = "5px";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
          }}
          style={{
            width: "80%",
            aspectRatio: "1 / 0.8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: tokens.spacing.lg,
            alignSelf: "center",
            marginTop: tokens.spacing.sm,
            border: "none",
            borderRadius: tokens.radius.lg,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            transform: "translateY(0)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            ...(calendarActive ? activeStyle : inactiveStyle),
            ...(!calendarActive && calendarHovered ? { color: tokens.colors.accent } : {}),
          }}
        >
          <CalendarIcon size={34} />
          <span style={{ fontFamily: tokens.fonts.elegant, fontSize: 14, letterSpacing: "0.3px" }}>
            Calendar
          </span>
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Sidebar Footer */}
      <div
        style={{
          padding: tokens.spacing.md,
          borderTop: `1px solid ${tokens.colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.spacing.sm,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.radius.sm,
              backgroundColor: tokens.colors.surfaceSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RobotIcon />
          </div>
          <span
            style={{
              fontFamily: tokens.fonts.elegant,
              fontSize: 16,
              fontWeight: 500,
              color: tokens.colors.text,
            }}
          >
            Maia
          </span>
        </div>
      </div>
    </aside>
  );
}
