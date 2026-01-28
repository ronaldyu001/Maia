import { useState } from "react";
import axios from "axios";
import tokens from "../tokens";

function CalendarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CoffeeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

function PlusIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function Calendar() {
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5232/calendar/create");
      
    } catch {
      // backend endpoint not yet available — no-op for now
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: tokens.colors.textMuted,
        textAlign: "center",
        padding: tokens.spacing.xl,
        backgroundColor: tokens.colors.background,
      }}
    >
      {/* decorative divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: tokens.colors.borderLight,
          marginBottom: 40,
        }}
      >
        <div style={{ width: 40, height: 1, background: tokens.colors.border }} />
        <CoffeeIcon size={16} />
        <div style={{ width: 40, height: 1, background: tokens.colors.border }} />
      </div>

      {/* calendar icon */}
      <div
        style={{
          color: tokens.colors.accent,
          marginBottom: tokens.spacing.lg,
          opacity: 0.5,
        }}
      >
        <CalendarIcon size={72} />
      </div>

      {/* heading */}
      <h2
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: tokens.colors.text,
          margin: 0,
          marginBottom: tokens.spacing.sm,
          lineHeight: 1.3,
          fontFamily: tokens.fonts.elegant,
        }}
      >
        No calendar available
      </h2>

      {/* subtitle */}
      <p
        style={{
          fontSize: 18,
          color: tokens.colors.textSecondary,
          margin: 0,
          marginBottom: 48,
          fontFamily: tokens.fonts.elegant,
          fontStyle: "italic",
          fontWeight: 300,
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        Brew up a fresh calendar to keep your days warm and organized.
      </p>

      {/* create button */}
      <button
        onClick={handleCreate}
        disabled={loading}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "18px 48px",
          fontSize: 20,
          fontFamily: tokens.fonts.elegant,
          fontWeight: 500,
          color: tokens.colors.background,
          backgroundColor: hover
            ? tokens.colors.accentHover
            : tokens.colors.accent,
          border: "none",
          borderRadius: tokens.radius.lg,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "background-color 0.2s, transform 0.15s, box-shadow 0.2s",
          transform: hover && !loading ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hover && !loading
            ? `0 8px 24px ${tokens.colors.accent}33`
            : "none",
          letterSpacing: 0.5,
        }}
      >
        <PlusIcon size={22} />
        {loading ? "Creating..." : "Start New Calendar"}
      </button>

      {/* hint */}
      <p
        style={{
          fontSize: 13,
          color: tokens.colors.textMuted,
          margin: 0,
          marginTop: tokens.spacing.md,
          fontFamily: tokens.fonts.sans,
        }}
      >
        Creates a new .ics calendar file
      </p>
    </div>
  );
}
