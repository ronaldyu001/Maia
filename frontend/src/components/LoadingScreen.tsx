import { useEffect, useState } from "react";
import MaiaAnimaBot from "../assets/Maia_Avatars/1.0-1.x/1.0/Anima Bot.gif";

const tokens = {
  colors: {
    background: "#1c1816",
    accent: "#d4a574",
    accentHover: "#c4956a",
    text: "#f5ebe0",
    textSecondary: "#c4b5a8",
    textMuted: "#8a7b6d",
  },
  fonts: {
    sans: '"Handlee", "Gochi Hand", cursive',
    elegant: '"Cormorant Garamond", Georgia, serif',
  },
};

export default function LoadingScreen({ onFinished }: { onFinished: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2400);
    const doneTimer = setTimeout(() => onFinished(), 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinished]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 40%, #2a2320 0%, ${tokens.colors.background} 70%)`,
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.8s ease-in-out",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow behind avatar */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tokens.colors.accent}18 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Avatar */}
      <div
        style={{
          position: "relative",
          width: 140,
          height: 140,
          borderRadius: "50%",
          overflow: "hidden",
          marginBottom: 32,
          boxShadow: `0 0 60px ${tokens.colors.accent}22, 0 8px 32px rgba(0,0,0,0.4)`,
          border: `2px solid ${tokens.colors.accent}30`,
          animation: "loadingAvatarPulse 3s ease-in-out infinite",
        }}
      >
        <img
          src={MaiaAnimaBot}
          alt="Maia"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Brand name */}
      <h1
        style={{
          fontFamily: tokens.fonts.elegant,
          fontSize: 42,
          fontWeight: 400,
          fontStyle: "italic",
          color: tokens.colors.text,
          margin: 0,
          marginBottom: 8,
          letterSpacing: 6,
          opacity: 0.95,
        }}
      >
        Maia
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontFamily: tokens.fonts.sans,
          fontSize: 14,
          color: tokens.colors.textMuted,
          margin: 0,
          marginBottom: 48,
          letterSpacing: 1,
        }}
      >
        warming up...
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: 160,
          height: 2,
          borderRadius: 1,
          background: `${tokens.colors.textMuted}30`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 1,
            background: `linear-gradient(90deg, ${tokens.colors.accent}, ${tokens.colors.accentHover})`,
            animation: "loadingProgress 2.4s ease-in-out forwards",
          }}
        />
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes loadingProgress {
          0% { width: 0%; }
          20% { width: 15%; }
          50% { width: 55%; }
          80% { width: 85%; }
          100% { width: 100%; }
        }
        @keyframes loadingAvatarPulse {
          0%, 100% { box-shadow: 0 0 60px ${tokens.colors.accent}22, 0 8px 32px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 80px ${tokens.colors.accent}35, 0 8px 32px rgba(0,0,0,0.4); }
        }
      `}</style>
    </div>
  );
}
