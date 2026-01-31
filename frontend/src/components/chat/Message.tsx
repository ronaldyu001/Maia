// Chat message component with markdown rendering

import { useMemo } from "react";
import tokens from "../../tokens";
import { UserIcon, RobotIcon } from "../shared/icons";
import { parseText } from "./markdown";

interface MessageProps {
  role: "user" | "maia";
  text: string;
}

export default function Message({ role, text }: MessageProps) {
  const isUser = role === "user";
  const parsedContent = useMemo(() => parseText(text), [text]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: tokens.spacing.sm,
        padding: `${tokens.spacing.md}px 0`,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ transform: "scale(1.15)" }}>
          {isUser ? <UserIcon size={25} /> : <RobotIcon size={25} />}
        </div>
      </div>

      {/* Message content */}
      <div
        style={{
          flex: 1,
          maxWidth: "calc(100% - 44px)",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        {/* Role label */}
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: tokens.colors.textSecondary,
            marginBottom: tokens.spacing.xs,
          }}
        >
          {isUser ? "Ronald" : "Maia"}
        </span>

        {/* Message bubble */}
        <div
          style={{
            backgroundColor: isUser ? tokens.colors.surfaceSecondary : tokens.colors.surface,
            borderRadius: tokens.radius.lg,
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            maxWidth: "85%",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 10,
              lineHeight: 1.8,
              letterSpacing: "2px",
              padding: `${tokens.spacing.sm}px ${tokens.spacing.sm}px`,
              color: tokens.colors.text,
              fontFamily: tokens.fonts.sans,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {parsedContent}
          </div>
        </div>
      </div>
    </div>
  );
}
