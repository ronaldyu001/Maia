import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { sendMessage } from "../api/chat";

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
  },
  fonts: {
    sans: '"Kalam", "Patrick Hand", cursive',
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

// Send icon component
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

export default function ChatWindow() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    sessionIdRef.current = crypto.randomUUID();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || isLoading) { setInput(""); return; }
    const next = [...turns, { role: "user" as const, text: msg }];
    setTurns(next);
    setInput("");
    setIsLoading(true);
    try {
      const reply = await sendMessage(msg, String(sessionIdRef.current));
      setTurns([...next, { role: "maia" as const, text: reply }]);
    } catch (e) {
      setTurns([...next, { role: "maia" as const, text: "I apologize, but I encountered an error. Please try again." }]);
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

  const canSend = input.trim() && !isLoading;

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
        flexDirection: "column",
        overflow: "hidden",
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
            maxWidth: 768,
            margin: "0 auto",
            padding: `${tokens.spacing.lg}px ${tokens.spacing.md}px`,
          }}
        >
          {turns.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                color: tokens.colors.textMuted,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: tokens.radius.md,
                  background: tokens.colors.surfaceSecondary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  marginBottom: tokens.spacing.md,
                }}
              >
                🤖
              </div>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 400,
                  color: tokens.colors.text,
                  margin: 0,
                  marginBottom: tokens.spacing.sm,
                }}
              >
                Hello there...
              </h2>
              <p
                style={{
                  fontSize: 18,
                  color: tokens.colors.textSecondary,
                  margin: 0,
                }}
              >
                What's on your mind?
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
            {turns.map((t, i) => (
              <Message key={i} role={t.role} text={t.text} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
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
                    background: tokens.colors.surfaceSecondary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🤖
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
            )}
          </div>
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
            maxWidth: 768,
            margin: "0 auto",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
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
          <p
            style={{
              fontSize: 13,
              color: tokens.colors.textMuted,
              textAlign: "center",
              margin: `${tokens.spacing.sm}px 0 0 0`,
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: "italic",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            Maia can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>

      {/* CSS for loading animation and fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

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
