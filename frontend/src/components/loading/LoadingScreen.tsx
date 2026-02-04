// Startup loading screen with progress indicator

import { useEffect, useState, useRef } from "react";
import tokens from "../../tokens";
import MaiaAnimaBot from "../../assets/Maia_Avatars/1.0-1.x/1.0/Anima Bot.gif";
import { API_BASE_URL } from "../../api";

interface StartupEvent {
  label: string;
  done: boolean;
}

interface StartupStatus {
  total: number;
  completed: number;
  events: Record<string, StartupEvent>;
  finished: boolean;
}

interface LoadingScreenProps {
  onFinished: () => void;
}

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState("Connecting to backend...");
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        try {
          const res = await fetch(`${API_BASE_URL}/startup/status`);
          const data: StartupStatus = await res.json();

          if (cancelled) break;

          const pct = data.total > 0 ? data.completed / data.total : 0;
          setProgress(pct);

          // Show the label of the first event that hasn't finished yet
          const pending = Object.values(data.events).find((e) => !e.done);
          setStatusLabel(pending ? pending.label + "..." : "Ready!");

          if (data.finished) {
            setProgress(1);
            setStatusLabel("Ready!");
            // Brief pause so the user sees "Ready!" before fade-out
            await new Promise((r) => setTimeout(r, 400));
            if (!cancelled) {
              setFadeOut(true);
              setTimeout(() => {
                if (!cancelled) onFinishedRef.current();
              }, 800);
            }
            return;
          }
        } catch {
          // Backend not reachable yet
          setStatusLabel("Connecting to backend...");
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, []);

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

      {/* Status label */}
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
        {statusLabel}
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
            width: `${progress * 100}%`,
            borderRadius: 1,
            background: `linear-gradient(90deg, ${tokens.colors.accent}, ${tokens.colors.accentHover})`,
            transition: "width 0.4s ease-in-out",
          }}
        />
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes loadingAvatarPulse {
          0%, 100% { box-shadow: 0 0 60px ${tokens.colors.accent}22, 0 8px 32px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 80px ${tokens.colors.accent}35, 0 8px 32px rgba(0,0,0,0.4); }
        }
      `}</style>
    </div>
  );
}
