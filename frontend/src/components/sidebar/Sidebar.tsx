// Sidebar navigation component

import { useState } from "react";
import tokens from "../../tokens";
import { PlusIcon, ChatIcon, CalendarIcon, RobotIcon } from "../shared/icons";
import type { Page } from "./types";

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

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onCalendarOpen: () => void;
  hasConversation: boolean;
  onNewConversation: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  onCalendarOpen,
  hasConversation,
  onNewConversation,
}: SidebarProps) {
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
      <div
        style={{
          padding: tokens.spacing.md + 20,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
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
          {chatActive && hasConversation ? <PlusIcon size={18} /> : <ChatIcon size={18} />}
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
            <RobotIcon size={20} />
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
