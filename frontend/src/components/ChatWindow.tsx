import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { sendMessage } from "../api";
import tokens from "../tokens";
import MaiaAnimaBot from "../assets/Maia_Avatars/1.0-1.x/1.0/Anima Bot.gif";

type Turn = { role: "user" | "maia"; text: string };

// Icons
function SendIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
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

function CoffeeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={tokens.colors.accent}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M6 2v2" />
      <path d="M10 2v2" />
      <path d="M14 2v2" />
    </svg>
  );
}

function RobotIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        color: tokens.colors.textMuted,
        textAlign: "center",
        padding: tokens.spacing.xl,
        position: "relative",
      }}
    >
      {/* Decorative coffee steam accents */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "20%",
          opacity: 0.06,
          transform: "rotate(-15deg)",
        }}
      >
        <CoffeeIcon size={48} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "18%",
          opacity: 0.06,
          transform: "rotate(15deg)",
        }}
      >
        <CoffeeIcon size={36} />
      </div>

      {/* Avatar container with glow effect */}
      <div
        style={{
          position: "relative",
          marginBottom: tokens.spacing.xl,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${tokens.colors.accentMuted} 0%, transparent 70%)`,
            filter: "blur(12px)",
          }}
        />
        <img
          src={MaiaAnimaBot}
          alt="Maia"
          style={{
            position: "relative",
            width: 140,
            height: 140,
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${tokens.colors.accent}`,
            boxShadow: tokens.shadows.lg,
          }}
        />
      </div>

      {/* Greeting text */}
      <h2
        style={{
          fontSize: 38,
          fontWeight: 400,
          color: tokens.colors.text,
          margin: 0,
          marginBottom: tokens.spacing.sm,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        Hey, Ronald!
      </h2>

      {/* Decorative divider */}
      <div
        style={{
          width: 60,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${tokens.colors.accent}, transparent)`,
          borderRadius: tokens.radius.full,
          margin: `${tokens.spacing.md}px 0`,
        }}
      />

      {/* Subtitle */}
      <p
        style={{
          fontSize: 20,
          color: tokens.colors.textSecondary,
          margin: 0,
          fontFamily: tokens.fonts.elegant,
          fontStyle: "italic",
          fontWeight: 300,
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        What shall we explore together today?
      </p>

      {/* Suggestion chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: tokens.spacing.sm,
          marginTop: tokens.spacing.xl,
          maxWidth: 500,
        }}
      >
        {["Ask me anything", "Let's brainstorm", "Help me plan"].map((text) => (
          <span
            key={text}
            style={{
              padding: `${tokens.spacing.xs + 2}px ${tokens.spacing.md}px`,
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.textSecondary,
              fontSize: 14,
              borderRadius: tokens.radius.full,
              border: `1px solid ${tokens.colors.borderLight}`,
              fontFamily: tokens.fonts.elegant,
              letterSpacing: "0.02em",
            }}
          >
            {text}
          </span>
        ))}
      </div>
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

export default function ChatWindow({
  onConversationChange,
}: {
  onConversationChange?: (hasConversation: boolean) => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Notify parent when conversation state changes.
  useEffect(() => {
    onConversationChange?.(turns.length > 0);
  }, [turns.length > 0]);

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
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: tokens.colors.background,
        fontFamily: tokens.fonts.sans,
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
  );
}
