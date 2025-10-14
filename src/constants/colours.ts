// New Electric Theme - Primary brand colors
export const COLORS = {
  ELECTRIC_BLUE: "#00E5FF",
  NEON_PINK: "#FF007F",
  VIBRANT_PURPLE: "#9B00FF",
  WHITE: "#F5F5F5",
  BLACK: "#101012",
};

// Background colors - Electric Purple Theme
export const BACKGROUND = {
  DARK_PURPLE: "#2B003B", // Main app background
  PURPLE_ACCENT: "#4C006B", // Lighter purple for cards
  PURPLE_LIGHTER: "#6B009B", // Even lighter purple for buttons
  PURPLE_HOVER: "#8B00CB", // Hover states
  OVERLAY: "rgba(0, 0, 0, 0.5)",
  SEMI_TRANSPARENT_WHITE: "rgba(255, 255, 255, 0.05)", // Subtle white overlay for cards/inputs
};

// Text colors
export const TEXT = {
  SOFT_WHITE: "#F5F5F5",
  LIGHT_GREY: "#C4C4C8",
  LIGHT_WHITE: "#FFFFFF",
  DARK_GREY: "#727277",
  ERROR_RED: "#FF737D",
  SUCCESS_GREEN: "#00C589",
  WARNING_ORANGE: "#FFE082",
};

// Status colors
export const STATUS = {
  SUCCESS: "#00C589",
  ERROR: "#FF737D",
  WARNING: "#FFE082",
  INFO: "#00E5FF",
};

// Toast colors
export const TOAST = {
  SUCCESS: "#00C589",
  ERROR: "#FF737D",
  WARNING: "#FFE082",
  INFO: "#00E5FF",
};

// Gradient definitions - Electric Theme
export const GRADIENTS = {
  PRIMARY: {
    colors: [BACKGROUND.DARK_PURPLE, BACKGROUND.DARK_PURPLE], // Solid purple background
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  CARD: {
    colors: [BACKGROUND.PURPLE_ACCENT, BACKGROUND.PURPLE_ACCENT], // Solid purple accent for cards
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  BUTTON_PRIMARY: {
    colors: [COLORS.NEON_PINK, COLORS.VIBRANT_PURPLE],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  BUTTON_SECONDARY: {
    colors: ["transparent", "transparent"], // Transparent for outline secondary buttons
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
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
