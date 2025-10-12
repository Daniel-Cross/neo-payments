// Primary brand colors
export const COLORS = {
  PRIMARY_GREEN: "#00FF00",
  PRIMARY_GREEN_DARK: "#00CC00",
  PRIMARY_GREEN_LIGHT: "#33FF33",
  ACCENT_BLUE: "#0066FF",
  ACCENT_PURPLE: "#6600FF",
};

// Background colors
export const BACKGROUND = {
  NAVY: "#0A0F1E", // Top of gradient
  SOFT_BLACK: "#1A1A1A", // Bottom of gradient
  DARK_GREY: "#2A2A2A",
  CARD_DARK: "#1E1E1E",
  OVERLAY: "rgba(0, 0, 0, 0.5)",
};

// Text colors
export const TEXT = {
  SOFT_WHITE: "#EAEAEA",
  LIGHT_GREY: "#C8C8C8",
  LIGHT_WHITE: "#F5F7FA",
  DARK_GREY: "#888888",
  ERROR_RED: "#FF4444",
  SUCCESS_GREEN: "#00FF00",
  WARNING_ORANGE: "#FF8800",
};

// Status colors
export const STATUS = {
  SUCCESS: "#00FF00",
  ERROR: "#FF4444",
  WARNING: "#FF8800",
  INFO: "#0066FF",
};

// Gradient definitions
export const GRADIENTS = {
  PRIMARY: {
    colors: [BACKGROUND.NAVY, BACKGROUND.SOFT_BLACK],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  CARD: {
    colors: [BACKGROUND.CARD_DARK, BACKGROUND.DARK_GREY],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  BUTTON_PRIMARY: {
    colors: [COLORS.PRIMARY_GREEN, COLORS.PRIMARY_GREEN_DARK],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  BUTTON_SECONDARY: {
    colors: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  ACCENT: {
    colors: [COLORS.ACCENT_BLUE, COLORS.ACCENT_PURPLE],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Theme object
export const THEME = {
  colors: COLORS,
  background: BACKGROUND,
  text: TEXT,
  status: STATUS,
  gradients: GRADIENTS,

  // Common styles
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
