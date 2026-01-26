import { useMemo } from "react";

type Props = { role: "user" | "maia"; text: string };

// Design tokens matching ChatWindow (cozy coffee shop theme)
const tokens = {
  colors: {
    background: "#1c1816",
    surface: "#2a2320",
    surfaceSecondary: "#221a14",
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
    sans: '"Handlee", "Gochi Hand", cursive',
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

const markdownFontFamily = '"Cormorant Garamond", "Garamond", "Georgia", serif';

// User avatar icon
function UserIcon() {
  return (
    <span role="img" aria-label="user" style={{ fontSize: 25 }}>
      🧑🏻
    </span>
  );
}

// Robot avatar icon for Maia
function RobotIcon() {
  return (
    <svg
      width="25"
      height="25"
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

// Code fences must start at line start.
const codeBlockRegex = /(^|\n)```([a-zA-Z0-9_-]*)\n([\s\S]*?)\n```(?=\n|$)/g;

function parseText(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  let sawMarkdown = false;
  const getKey = () => `part-${keyIndex++}`;

  // Markdown starts at a header or any list item.
  const firstMarkdownStartIndex = (segment: string) => {
    const match = segment.match(/(^|\n)(#{1,6}\s+|\s*[-*+]\s+|\s*\d+\.\s+)/);
    if (!match || match.index == null) return null;
    return match.index + (match[1] ? match[1].length : 0);
  };
  const firstMarkdownStopMatch = (segment: string) => {
    const lines = segment.split("\n");
    let offset = 0;

    const isMarkdownStartLine = (line: string) =>
      /^#{1,6}\s+/.test(line) ||
      /^\s*[-*+]\s+/.test(line) ||
      /^\s*\d+\.\s+/.test(line) ||
      /^\s*>\s?/.test(line) ||
      /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const lineLength = line.length;
      const lineStart = offset;
      const lineEnd = offset + lineLength;

      if (!line.trim()) {
        let j = i + 1;
        let nextOffset = lineEnd + 1;
        while (j < lines.length && !lines[j].trim()) {
          nextOffset += lines[j].length + 1;
          j += 1;
        }

        if (j >= lines.length) {
          return { index: lineStart, length: segment.length - lineStart };
        }

        if (!isMarkdownStartLine(lines[j])) {
          return { index: lineStart, length: nextOffset - lineStart };
        }
      }

      offset = lineEnd + 1;
    }

    return null;
  };

  const pushTextSegment = (segment: string) => {
    if (!segment.trim()) return;
    if (sawMarkdown) {
      const stop = firstMarkdownStopMatch(segment);
      if (!stop) {
        out.push(<MarkdownBlock key={getKey()} text={segment} />);
        return;
      }
      const before = segment.slice(0, stop.index);
      const after = segment.slice(stop.index + stop.length);
      if (before.trim()) {
        out.push(<MarkdownBlock key={getKey()} text={before} />);
      }
      sawMarkdown = false;
      if (after.trim()) {
        out.push(...parseInlineMarkdown(after, getKey));
      }
      return;
    }

    const startAt = firstMarkdownStartIndex(segment);
    if (startAt == null) {
      out.push(...parseInlineMarkdown(segment, getKey));
      return;
    }

    const before = segment.slice(0, startAt);
    const after = segment.slice(startAt);
    if (before.trim()) {
      out.push(...parseInlineMarkdown(before, getKey));
    }
    if (after.trim()) {
      sawMarkdown = true;
      pushTextSegment(after);
    }
  };

  for (const match of text.matchAll(codeBlockRegex)) {
    const matchIndex = match.index ?? 0;

    // Text before the code block
    if (matchIndex > lastIndex) {
      pushTextSegment(text.slice(lastIndex, matchIndex));
    }

    const language = (match[2] || "").trim();
    const code = match[3] ?? "";
    out.push(<CodeBlock key={getKey()} code={code} language={language} />);
    lastIndex = matchIndex + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    pushTextSegment(text.slice(lastIndex));
  }

  return out;
}

function parseInlineMarkdown(text: string, getKey: () => string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;

  const patterns = [
    { type: "code", regex: /`([^\n`]+?)`/ },
    { type: "link", regex: /\[([^\]]+?)\]\(([^)]+?)\)/ },
    { type: "bold", regex: /\*\*([^*]+?)\*\*|__([^_]+?)__/ },
    { type: "italic", regex: /\*([^*]+?)\*|_([^_]+?)_/ },
  ];

  while (remaining.length) {
    let bestMatch: { type: string; match: RegExpMatchArray; index: number } | null = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && (bestMatch === null || (match.index ?? 0) < bestMatch.index)) {
        bestMatch = { type: pattern.type, match, index: match.index ?? 0 };
      }
    }

    if (!bestMatch) {
      nodes.push(<span key={getKey()}>{remaining}</span>);
      break;
    }

    if (bestMatch.index > 0) {
      nodes.push(<span key={getKey()}>{remaining.slice(0, bestMatch.index)}</span>);
    }

    const { type, match } = bestMatch;
    if (type === "code") {
      const code = match[1] ?? "";
      nodes.push(
        <code
          key={getKey()}
          style={{
            backgroundColor: tokens.colors.inlineCodeBg,
            color: tokens.colors.accent,
            padding: "2px 7px",
            borderRadius: 4,
            fontSize: "0.88em",
            fontFamily: tokens.fonts.mono,
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          {code}
        </code>
      );
    } else if (type === "link") {
      const label = match[1] ?? "";
      const url = match[2] ?? "";
      nodes.push(
        <a
          key={getKey()}
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: tokens.colors.accent,
            textDecoration: "none",
            borderBottom: `1px solid rgba(212, 165, 116, 0.4)`,
            transition: "border-color 0.2s",
          }}
        >
          {label}
        </a>
      );
    } else if (type === "bold") {
      const content = match[1] ?? match[2] ?? "";
      nodes.push(
        <strong key={getKey()} style={{ fontWeight: 600, color: tokens.colors.text }}>
          {content}
        </strong>
      );
    } else if (type === "italic") {
      const content = match[1] ?? match[2] ?? "";
      nodes.push(
        <em key={getKey()} style={{ color: tokens.colors.textSecondary }}>
          {content}
        </em>
      );
    }

    remaining = remaining.slice(bestMatch.index + match[0].length);
  }

  return nodes;
}

function MarkdownBlock({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const getKey = (() => {
    let i = 0;
    return () => `md-${i++}`;
  })();

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  const isListItem = (line: string) => /^\s*[-*+]\s+/.test(line);
  const isOrderedItem = (line: string) => /^\s*\d+\.\s+/.test(line);
  const isNestedListItem = (line: string) =>
    /^\s+[-*+]\s+/.test(line) || /^\s+\d+\.\s+/.test(line);
  const isHeading = (line: string) => /^#{1,6}\s+/.test(line);
  const isBlockquote = (line: string) => /^\s*>\s?/.test(line);
  const isHr = (line: string) => /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);
  const isBlockStart = (line: string) =>
    isHeading(line) || isBlockquote(line) || isListItem(line) || isOrderedItem(line) || isHr(line);

  // Shared list item styles
  const listItemStyle: React.CSSProperties = {
    paddingLeft: 4,
    marginBottom: 4,
  };

  const buildNestedLists = (nested: string[]) => {
    const nodes: React.ReactNode[] = [];
    let j = 0;

    while (j < nested.length) {
      const current = nested[j];
      if (!current.trim()) {
        j += 1;
        continue;
      }

      if (isListItem(current)) {
        const items: React.ReactNode[] = [];
        while (j < nested.length && isListItem(nested[j])) {
          const itemText = nested[j].replace(/^\s*[-*+]\s+/, "");
          items.push(
            <li key={getKey()} style={listItemStyle}>
              {parseInlineMarkdown(itemText, getKey)}
            </li>
          );
          j += 1;
        }
        nodes.push(
          <ul
            key={getKey()}
            style={{
              margin: 0,
              paddingLeft: 20,
              color: tokens.colors.text,
              listStyleType: "circle",
              lineHeight: 1.75,
            }}
          >
            {items}
          </ul>
        );
        continue;
      }

      if (isOrderedItem(current)) {
        const items: React.ReactNode[] = [];
        while (j < nested.length && isOrderedItem(nested[j])) {
          const itemText = nested[j].replace(/^\s*\d+\.\s+/, "");
          items.push(
            <li key={getKey()} style={listItemStyle}>
              {parseInlineMarkdown(itemText, getKey)}
            </li>
          );
          j += 1;
        }
        nodes.push(
          <ol
            key={getKey()}
            style={{
              margin: 0,
              paddingLeft: 20,
              color: tokens.colors.text,
              listStyleType: "decimal",
              lineHeight: 1.75,
            }}
          >
            {items}
          </ol>
        );
        continue;
      }

      j += 1;
    }

    return nodes;
  };

  const pushParagraph = (paragraphLines: string[]) => {
    const content = paragraphLines.join("\n").trim();
    if (!content) return;
    blocks.push(
      <p
        key={getKey()}
        style={{
          margin: `6px 0`,
          lineHeight: 1.7,
          color: tokens.colors.text,
          letterSpacing: "0.2px",
        }}
      >
        {parseInlineMarkdown(content, getKey)}
      </p>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (isHr(line)) {
      blocks.push(
        <div
          key={getKey()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: `16px 0`,
          }}
        >
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${tokens.colors.borderLight})` }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: tokens.colors.accent, opacity: 0.5 }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${tokens.colors.borderLight})` }} />
        </div>
      );
      i += 1;
      continue;
    }

    if (isHeading(line)) {
      const level = line.match(/^#{1,6}/)?.[0].length ?? 1;
      const content = line.replace(/^#{1,6}\s+/, "");
      const sizes = [24, 21, 19, 17, 15, 14];
      const weights = [700, 650, 600, 600, 500, 500];
      const isLarge = level <= 2;
      blocks.push(
        <div key={getKey()} style={{ marginTop: level === 1 ? 4 : 2, marginBottom: isLarge ? 8 : 4 }}>
          <div
            style={{
              fontSize: sizes[level - 1],
              fontWeight: weights[level - 1],
              color: level <= 2 ? tokens.colors.accent : tokens.colors.text,
              letterSpacing: level <= 2 ? "0.5px" : "0.2px",
              lineHeight: 1.4,
            }}
          >
            {parseInlineMarkdown(content, getKey)}
          </div>
          {level === 1 && (
            <div
              style={{
                marginTop: 6,
                height: 2,
                width: 40,
                borderRadius: 1,
                background: `linear-gradient(to right, ${tokens.colors.accent}, transparent)`,
              }}
            />
          )}
        </div>
      );
      i += 1;
      continue;
    }

    if (isBlockquote(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && isBlockquote(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      const content = quoteLines.join("\n").trim();
      blocks.push(
        <blockquote
          key={getKey()}
          style={{
            margin: `8px 0`,
            padding: `10px 16px`,
            borderLeft: `3px solid ${tokens.colors.accent}`,
            backgroundColor: "rgba(212, 165, 116, 0.06)",
            borderRadius: `0 ${tokens.radius.sm}px ${tokens.radius.sm}px 0`,
            color: tokens.colors.textSecondary,
            fontStyle: "italic",
            lineHeight: 1.7,
          }}
        >
          {parseInlineMarkdown(content, getKey)}
        </blockquote>
      );
      continue;
    }

    if (isListItem(line)) {
      const items: React.ReactNode[] = [];
      let currentText: string | null = null;
      let nestedLines: string[] = [];

      const flushItem = () => {
        if (currentText == null) return;
        const nestedNodes = buildNestedLists(nestedLines);
        items.push(
          <li key={getKey()} style={listItemStyle}>
            <div>{parseInlineMarkdown(currentText, getKey)}</div>
            {nestedNodes.length ? (
              <div style={{ marginTop: tokens.spacing.xs }}>{nestedNodes}</div>
            ) : null}
          </li>
        );
        currentText = null;
        nestedLines = [];
      };

      while (i < lines.length) {
        const current = lines[i];
        if (!current.trim()) {
          i += 1;
          if (i < lines.length && (isListItem(lines[i]) || isNestedListItem(lines[i]))) continue;
          break;
        }
        if (isListItem(current)) {
          flushItem();
          currentText = current.replace(/^\s*[-*+]\s+/, "");
          i += 1;
          continue;
        }
        if (isNestedListItem(current)) {
          nestedLines.push(current.trimStart());
          i += 1;
          continue;
        }
        break;
      }
      flushItem();

      blocks.push(
        <ul
          key={getKey()}
          style={{
            margin: `4px 0`,
            paddingLeft: 22,
            color: tokens.colors.text,
            lineHeight: 1.75,
          }}
        >
          {items}
        </ul>
      );
      continue;
    }

    if (isOrderedItem(line)) {
      const items: React.ReactNode[] = [];
      let currentText: string | null = null;
      let nestedLines: string[] = [];

      const flushItem = () => {
        if (currentText == null) return;
        const nestedNodes = buildNestedLists(nestedLines);
        items.push(
          <li key={getKey()} style={listItemStyle}>
            <div>{parseInlineMarkdown(currentText, getKey)}</div>
            {nestedNodes.length ? (
              <div style={{ marginTop: tokens.spacing.xs }}>{nestedNodes}</div>
            ) : null}
          </li>
        );
        currentText = null;
        nestedLines = [];
      };

      while (i < lines.length) {
        const current = lines[i];
        if (!current.trim()) {
          i += 1;
          if (i < lines.length && (isOrderedItem(lines[i]) || isNestedListItem(lines[i]))) continue;
          break;
        }
        if (isOrderedItem(current)) {
          flushItem();
          currentText = current.replace(/^\s*\d+\.\s+/, "");
          i += 1;
          continue;
        }
        if (isNestedListItem(current)) {
          nestedLines.push(current.trimStart());
          i += 1;
          continue;
        }
        break;
      }
      flushItem();

      blocks.push(
        <ol
          key={getKey()}
          style={{
            margin: `4px 0`,
            paddingLeft: 22,
            color: tokens.colors.text,
            listStyleType: "decimal",
            lineHeight: 1.75,
          }}
        >
          {items}
        </ol>
      );
      continue;
    }

    const paragraphLines: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paragraphLines.push(lines[i]);
      i += 1;
    }
    pushParagraph(paragraphLines);
  }

  if (!blocks.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: `20px 24px`,
        margin: `12px 0`,
        backgroundColor: tokens.colors.surfaceSecondary,
        borderRadius: tokens.radius.md,
        borderLeft: `3px solid rgba(212, 165, 116, 0.25)`,
        fontFamily: markdownFontFamily,
        fontSize: 15,
        lineHeight: 1.7,
      }}
    >
      {blocks}
    </div>
  );
}

// Code block component
function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div
      style={{
        margin: `12px 0`,
        borderRadius: tokens.radius.sm,
        overflow: "hidden",
        backgroundColor: tokens.colors.codeBackground,
        border: `1px solid ${tokens.colors.border}`,
        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`,
      }}
    >
      {language && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: `6px 14px`,
            backgroundColor: tokens.colors.surface,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: tokens.colors.accent,
              opacity: 0.6,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: tokens.colors.textMuted,
              fontFamily: tokens.fonts.mono,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {language}
          </span>
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: `14px 16px`,
          overflow: "auto",
          fontSize: 13,
          lineHeight: 1.6,
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
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ transform: "scale(1.15)" }}>
          {isUser ? <UserIcon /> : <RobotIcon />}
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
            backgroundColor: isUser ? tokens.colors.userBubble : tokens.colors.surface,
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
