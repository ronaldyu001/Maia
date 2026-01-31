// Empty state displayed when there are no messages

import tokens from "../../tokens";
import { CoffeeIcon } from "../shared/icons";
import MaiaAnimaBot from "../../assets/Maia_Avatars/1.0-1.x/1.0/Anima Bot.gif";

export function EmptyState() {
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
          color: tokens.colors.accent,
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
          color: tokens.colors.accent,
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
