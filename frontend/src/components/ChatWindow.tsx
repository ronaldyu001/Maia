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
