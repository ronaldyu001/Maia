import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { sendMessage } from "../api/chat";
import MaiaAnimaBot from "../assets/Maia_Avatars/1.0-1.x/1.0/Anima Bot.gif";

type Turn = { role: "user" | "maia"; text: string };

// Design tokens for consistent styling (cozy coffee shop theme)
const tokens = {
  colors: {
    background: "#1c1816",
    surface: "#2a2320",
    surfaceSecondary: "#3a322d",
    border: "#4a3f38",
    borderLight: "#5a4d44",
    text: "#f5ebe0",
    textSecondary: "#c4b5a8",
    textMuted: "#8a7b6d",
    accent: "#d4a574",
    accentHover: "#c4956a",
    userBubble: "#3a322d",
    assistantBubble: "#2a2320",
    sidebarBg: "#211e1b",
  },
  fonts: {
    sans: '"Handlee", "Gochi Hand", cursive',
    elegant: '"Cormorant Garamond", Georgia, serif',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

const dateGroups = ["Today", "Yesterday", "3 days ago", "1 week ago"];

// Dummy conversation history for sidebar
const dummyConversations = [
  { id: "1", title: "Planning the garden", date: "Today" },
  { id: "2", title: "Recipe ideas for dinner", date: "Today" },
  { id: "3", title: "Book recommendations", date: "Yesterday" },
  { id: "4", title: "Travel plans for summer", date: "Yesterday" },
  { id: "5", title: "Learning to paint", date: "3 days ago" },
  { id: "6", title: "Meditation techniques", date: "1 week ago" },
];

// Icons
function SendIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#ffffff" : tokens.colors.textMuted}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

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
      width="16"
      height="16"
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
      {/* Head */}
      <rect x="5" y="8" width="14" height="10" rx="2" />
      {/* Antenna */}
      <line x1="12" y1="8" x2="12" y2="4" />
      <circle cx="12" cy="3" r="1" fill={tokens.colors.accent} />
      {/* Eyes */}
      <circle cx="9" cy="12" r="1.5" fill={tokens.colors.accent} />
      <circle cx="15" cy="12" r="1.5" fill={tokens.colors.accent} />
      {/* Smile */}
      <path d="M9 15.5c0 0 1.5 1 3 1s3-1 3-1" />
      {/* Ears */}
      <rect x="2" y="11" width="2" height="4" rx="0.5" />
      <rect x="20" y="11" width="2" height="4" rx="0.5" />
    </svg>
  );
}

// Sidebar component
function Sidebar({ onNewConversation }: { onNewConversation: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
      {/* New Conversation Button */}
      <div style={{ padding: tokens.spacing.md }}>
        <button
          onClick={onNewConversation}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: tokens.spacing.sm,
            padding: `${tokens.spacing.sm + 4}px ${tokens.spacing.md}px`,
            backgroundColor: tokens.colors.accent,
            color: "#1c1816",
            border: "none",
            borderRadius: tokens.radius.md,
            fontFamily: tokens.fonts.elegant,
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.accentHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.accent;
          }}
        >
          <PlusIcon />
          New Conversation
        </button>
      </div>

      {/* Conversation List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `0 ${tokens.spacing.sm}px`,
        }}
      >
        {dateGroups.map((dateGroup) => {
          const conversations = dummyConversations.filter(
            (c) => c.date === dateGroup
          );
          if (conversations.length === 0) return null;

          return (
            <div key={dateGroup} style={{ marginBottom: tokens.spacing.md }}>
              <div
                style={{
                  padding: `${tokens.spacing.sm}px ${tokens.spacing.sm}px`,
                  fontSize: 11,
                  fontFamily: tokens.fonts.elegant,
                  fontWeight: 400,
                  color: tokens.colors.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {dateGroup}
              </div>
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.spacing.sm,
                    padding: `${tokens.spacing.sm}px ${tokens.spacing.sm}px`,
                    backgroundColor:
                      hoveredId === conversation.id
                        ? tokens.colors.surfaceSecondary
                        : "transparent",
                    color: tokens.colors.textSecondary,
                    border: "none",
                    borderRadius: tokens.radius.sm,
                    fontFamily: tokens.fonts.sans,
                    fontSize: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: 0.6 }}>
                    <ChatIcon />
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {conversation.title}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

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

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: tokens.colors.textMuted,
        textAlign: "center",
        padding: tokens.spacing.lg,
      }}
    >
      <img
        src={MaiaAnimaBot}
        alt="Maia"
        style={{
          width: 120,
          height: 120,
          borderRadius: tokens.radius.xl,
          objectFit: "cover",
          marginBottom: tokens.spacing.lg,
        }}
      />
      <h2
        style={{
          fontSize: 34,
          fontWeight: 400,
          color: tokens.colors.text,
          margin: 0,
          marginBottom: tokens.spacing.md,
          lineHeight: 1.3,
        }}
      >
        Hey, Ronald!
      </h2>
      <p
        style={{
          fontSize: 22,
          color: tokens.colors.textSecondary,
          margin: 0,
          fontFamily: tokens.fonts.elegant,
          fontStyle: "italic",
          fontWeight: 300,
        }}
      >
        What shall we explore together today?
      </p>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: tokens.spacing.sm,
        padding: `${tokens.spacing.md}px 0`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: tokens.radius.sm,
          backgroundColor: tokens.colors.surfaceSecondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <RobotIcon />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: `${tokens.spacing.sm}px 0`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: tokens.colors.textMuted,
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: tokens.colors.textMuted,
            animation: "pulse 1.4s ease-in-out 0.2s infinite",
          }}
        />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: tokens.colors.textMuted,
            animation: "pulse 1.4s ease-in-out 0.4s infinite",
          }}
        />
      </div>
    </div>
  );
}

function MessageList({ turns, isLoading }: { turns: Turn[]; isLoading: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
      {turns.map((turn, index) => (
        <Message key={index} role={turn.role} text={turn.text} />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  );
}

function InputBar({
  value,
  onChange,
  onKeyDown,
  onSend,
  canSend,
  textareaRef,
}: {
  value: string;
  onChange: (next: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  canSend: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      autoComplete="off"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: tokens.spacing.sm,
        padding: `${tokens.spacing.sm}px ${tokens.spacing.sm}px ${tokens.spacing.sm}px ${tokens.spacing.md}px`,
        backgroundColor: tokens.colors.surfaceSecondary,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.colors.borderLight}`,
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write something..."
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          color: tokens.colors.text,
          fontSize: 18,
          lineHeight: 1.5,
          padding: `${tokens.spacing.sm}px 0`,
          fontFamily: tokens.fonts.sans,
          maxHeight: 200,
        }}
      />
      <button
        type="submit"
        disabled={!canSend}
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: tokens.radius.sm,
          border: "none",
          backgroundColor: canSend ? tokens.colors.accent : tokens.colors.borderLight,
          cursor: canSend ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (canSend) {
            e.currentTarget.style.backgroundColor = tokens.colors.accentHover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = canSend
            ? tokens.colors.accent
            : tokens.colors.borderLight;
        }}
      >
        <SendIcon active={canSend} />
      </button>
    </form>
  );
}

export default function ChatWindow() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Keep the latest turn in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  // Auto-resize the input as the user types.
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 200) + "px";
  }, [input]);

  function handleNewConversation() {
    setTurns([]);
    setInput("");
    setSessionId(crypto.randomUUID());
    setIsLoading(false);
  }

  async function handleSend() {
    const msg = input.trim();
    if (!msg || isLoading) {
      setInput("");
      return;
    }

    const next = [...turns, { role: "user" as const, text: msg }];
    setTurns(next);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendMessage(msg, sessionId);
      setTurns([...next, { role: "maia" as const, text: reply }]);
    } catch (e) {
      setTurns([
        ...next,
        {
          role: "maia" as const,
          text: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: tokens.colors.background,
        fontFamily: tokens.fonts.sans,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Sidebar onNewConversation={handleNewConversation} />

      {/* Main Chat Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Messages area */}
        <main
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: `${tokens.spacing.lg}px ${tokens.spacing.md}px`,
            }}
          >
            {turns.length === 0 ? <EmptyState /> : null}
            <MessageList turns={turns} isLoading={isLoading} />
          </div>
        </main>

        {/* Input area */}
        <footer
          style={{
            flexShrink: 0,
            backgroundColor: tokens.colors.background,
            padding: `${tokens.spacing.md}px ${tokens.spacing.md}px ${tokens.spacing.lg}px`,
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            <InputBar
              value={input}
              onChange={setInput}
              onKeyDown={handleKey}
              onSend={handleSend}
              canSend={canSend}
              textareaRef={textareaRef}
            />
            <p
              style={{
                fontSize: 13,
                color: tokens.colors.textMuted,
                textAlign: "center",
                margin: `${tokens.spacing.sm}px 0 0 0`,
                fontFamily: tokens.fonts.elegant,
                fontStyle: "italic",
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              Maia can make mistakes. Consider checking important information.
            </p>
          </div>
        </footer>

        {/* Maia avatar in bottom left when conversation is active */}
        {turns.length > 0 && (
          <img
            src={MaiaAnimaBot}
            alt="Maia"
            style={{
              position: "absolute",
              bottom: tokens.spacing.lg,
              left: tokens.spacing.lg,
              width: 88,
              height: 88,
              borderRadius: tokens.radius.lg,
              objectFit: "cover",
              opacity: 0.9,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* CSS for loading animation and fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Handlee&family=Gochi+Hand&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }

        ::placeholder {
          color: #8a7b6d;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #4a3f38;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #5a4d44;
        }
      `}</style>
    </div>
  );
}
