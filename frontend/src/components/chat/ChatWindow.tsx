// Main chat window component

import { useEffect, useRef, useState } from "react";
import { sendMessage } from "../../api";
import tokens from "../../tokens";
import { RobotIcon } from "../shared/icons";
import { EmptyState } from "./EmptyState";
import { InputBar } from "./InputBar";
import Message from "./Message";
import type { Turn } from "./types";
import MaiaAnimaBot from "../../assets/Maia_Avatars/1.0-1.x/1.0/Anima Bot.gif";

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
        <RobotIcon size={20} />
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

interface ChatWindowProps {
  onConversationChange?: (hasConversation: boolean) => void;
}

export default function ChatWindow({ onConversationChange }: ChatWindowProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Notify parent when conversation state changes
  useEffect(() => {
    onConversationChange?.(turns.length > 0);
  }, [turns.length > 0, onConversationChange]);

  // Keep the latest turn in view
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  // Auto-resize the input as the user types
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
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
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
