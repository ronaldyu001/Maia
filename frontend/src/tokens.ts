// Design tokens for consistent styling (cozy coffee shop theme)
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
    accentHover: "#c4956a",
    accentMuted: "rgba(212, 165, 116, 0.12)",
    accentSubtle: "rgba(212, 165, 116, 0.06)",
    userBubble: "#3a322d",
    assistantBubble: "#2a2320",
    sidebarBg: "#211e1b",
    error: "#b06a5b",
    errorHover: "#d39b8b",
  },
  fonts: {
    sans: '"Handlee", "Gochi Hand", cursive',
    elegant: '"Cormorant Garamond", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  transitions: {
    fast: 150,
    normal: 200,
    slow: 300,
    modal: 220,
  },
  shadows: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.1)",
    md: "0 4px 12px rgba(0, 0, 0, 0.2)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.3)",
    xl: "0 16px 48px rgba(0, 0, 0, 0.4)",
  },
};

export default tokens;
