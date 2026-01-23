import { useMemo } from "react";

type Props = { role: "user" | "maia"; text: string };

// Design tokens matching ChatWindow (cozy coffee shop theme)
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
    userBubble: "#3a322d",
    codeBackground: "#1c1816",
    codeText: "#e8dfd4",
    inlineCodeBg: "#3a322d",
    inlineCodeText: "#f5ebe0",
  },
  fonts: {
    sans: '"Kalam", "Patrick Hand", cursive',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};

// User avatar icon
function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c4b5a8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// Simple markdown-like text parser
function parseText(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Split by code blocks first
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  const getKey = () => `part-${keyIndex++}`;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      elements.push(...parseInlineElements(beforeText, getKey));
    }

    // Add code block
    const language = match[1] || "";
    const code = match[2].trim();
    elements.push(
      <CodeBlock key={getKey()} code={code} language={language} />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    elements.push(...parseInlineElements(remainingText, getKey));
  }

  return elements;
}

// Parse inline elements (inline code, bold, etc.)
function parseInlineElements(text: string, getKey: () => string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Split by inline code
  const parts = text.split(/(`[^`]+`)/g);

  for (const part of parts) {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      // Inline code
      const code = part.slice(1, -1);
      elements.push(
        <code
          key={getKey()}
          style={{
            backgroundColor: tokens.colors.inlineCodeBg,
            color: tokens.colors.inlineCodeText,
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: "0.9em",
            fontFamily: tokens.fonts.mono,
          }}
        >
          {code}
        </code>
      );
    } else if (part) {
      // Regular text - preserve line breaks
      const lines = part.split("\n");
      lines.forEach((line, i) => {
        if (i > 0) {
          elements.push(<br key={getKey()} />);
        }
        if (line) {
          elements.push(<span key={getKey()}>{line}</span>);
        }
      });
    }
  }

  return elements;
}

// Code block component
function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div
      style={{
        margin: `${tokens.spacing.md}px 0`,
        borderRadius: tokens.radius.sm,
        overflow: "hidden",
        backgroundColor: tokens.colors.codeBackground,
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      {language && (
        <div
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            backgroundColor: tokens.colors.surface,
            fontSize: 12,
            color: tokens.colors.textSecondary,
            fontFamily: tokens.fonts.mono,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          {language}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: tokens.spacing.md,
          overflow: "auto",
          fontSize: 13,
          lineHeight: 1.5,
          fontFamily: tokens.fonts.mono,
          color: tokens.colors.codeText,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Message({ role, text }: Props) {
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
          width: 28,
          height: 28,
          borderRadius: tokens.radius.sm,
          backgroundColor: tokens.colors.surfaceSecondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: isUser ? 12 : 16,
        }}
      >
        {isUser ? <UserIcon /> : "🤖"}
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
          {isUser ? "You" : "Maia"}
        </span>

        {/* Message bubble */}
        <div
          style={{
            backgroundColor: isUser ? tokens.colors.userBubble : tokens.colors.surface,
            borderRadius: tokens.radius.lg,
            padding: `${tokens.spacing.sm + 4}px ${tokens.spacing.md}px`,
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              fontSize: 18,
              lineHeight: 1.5,
              color: tokens.colors.text,
              fontFamily: tokens.fonts.sans,
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {parsedContent}
          </div>
        </div>
      </div>
    </div>
  );
}
