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
      <circle cx="8" cy="15" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Calendar() {
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
        padding: tokens.spacing.lg,
        backgroundColor: tokens.colors.background,
      }}
    >
      <div
        style={{
          color: tokens.colors.accent,
          marginBottom: tokens.spacing.lg,
          opacity: 0.7,
        }}
      >
        <CalendarIcon size={80} />
      </div>
      <h2
        style={{
          fontSize: 34,
          fontWeight: 400,
          color: tokens.colors.text,
          margin: 0,
          marginBottom: tokens.spacing.md,
          lineHeight: 1.3,
          fontFamily: tokens.fonts.elegant,
        }}
      >
        Calendar
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
        Coming soon...
      </p>
    </div>
  );
}
