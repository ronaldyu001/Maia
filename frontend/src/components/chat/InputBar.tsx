// Chat input bar with send button

import tokens from "../../tokens";
import { SendIcon } from "../shared/icons";

interface InputBarProps {
  value: string;
  onChange: (next: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  canSend: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function InputBar({
  value,
  onChange,
  onKeyDown,
  onSend,
  canSend,
  textareaRef,
}: InputBarProps) {
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
        <SendIcon size={18} active={canSend} />
      </button>
    </form>
  );
}
