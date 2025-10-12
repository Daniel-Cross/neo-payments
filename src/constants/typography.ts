import { Platform } from "react-native";
import { TypographyVariant, TypographyWeight, TypographyAlign } from "./enums";

// Base font sizes (in pixels)
const FONT_SIZES = {
  displayLarge: 32,
  displayMedium: 28,
  displaySmall: 24,
  headlineLarge: 22,
  headlineMedium: 20,
  headlineSmall: 18,
  titleLarge: 16,
  titleMedium: 14,
  titleSmall: 12,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,
  labelLarge: 14,
  labelMedium: 12,
  labelSmall: 10,
  caption: 10,
  monospace: 14,
};

// Line heights (as multiplier of font size)
const LINE_HEIGHTS = {
  displayLarge: 1.2,
  displayMedium: 1.2,
  displaySmall: 1.3,
  headlineLarge: 1.3,
  headlineMedium: 1.3,
  headlineSmall: 1.4,
  titleLarge: 1.4,
  titleMedium: 1.4,
  titleSmall: 1.4,
  bodyLarge: 1.5,
  bodyMedium: 1.5,
  bodySmall: 1.4,
  labelLarge: 1.4,
  labelMedium: 1.4,
  labelSmall: 1.4,
  caption: 1.4,
  monospace: 1.4,
};

// Font weights
const FONT_WEIGHTS = {
  light: TypographyWeight.LIGHT,
  regular: TypographyWeight.REGULAR,
  medium: TypographyWeight.MEDIUM,
  semibold: TypographyWeight.SEMIBOLD,
  bold: TypographyWeight.BOLD,
  extrabold: TypographyWeight.EXTRABOLD,
};

// Font families - using system defaults for now
const FONT_FAMILIES = {
  system: undefined, // Use system default
  monospace: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};

// Typography styles configuration
export const TYPOGRAPHY_STYLES = {
  // Display styles - for large headings and hero text
  displayLarge: {
    fontSize: FONT_SIZES.displayLarge,
    lineHeight: FONT_SIZES.displayLarge * LINE_HEIGHTS.displayLarge,
    fontWeight: FONT_WEIGHTS.bold,
  },
  displayMedium: {
    fontSize: FONT_SIZES.displayMedium,
    lineHeight: FONT_SIZES.displayMedium * LINE_HEIGHTS.displayMedium,
    fontWeight: FONT_WEIGHTS.bold,
  },
  displaySmall: {
    fontSize: FONT_SIZES.displaySmall,
    lineHeight: FONT_SIZES.displaySmall * LINE_HEIGHTS.displaySmall,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Headline styles - for section headers
  headlineLarge: {
    fontSize: FONT_SIZES.headlineLarge,
    lineHeight: FONT_SIZES.headlineLarge * LINE_HEIGHTS.headlineLarge,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  headlineMedium: {
    fontSize: FONT_SIZES.headlineMedium,
    lineHeight: FONT_SIZES.headlineMedium * LINE_HEIGHTS.headlineMedium,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  headlineSmall: {
    fontSize: FONT_SIZES.headlineSmall,
    lineHeight: FONT_SIZES.headlineSmall * LINE_HEIGHTS.headlineSmall,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Title styles - for card titles and important text
  titleLarge: {
    fontSize: FONT_SIZES.titleLarge,
    lineHeight: FONT_SIZES.titleLarge * LINE_HEIGHTS.titleLarge,
    fontWeight: FONT_WEIGHTS.medium,
  },
  titleMedium: {
    fontSize: FONT_SIZES.titleMedium,
    lineHeight: FONT_SIZES.titleMedium * LINE_HEIGHTS.titleMedium,
    fontWeight: FONT_WEIGHTS.medium,
  },
  titleSmall: {
    fontSize: FONT_SIZES.titleSmall,
    lineHeight: FONT_SIZES.titleSmall * LINE_HEIGHTS.titleSmall,
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Body styles - for main content
  bodyLarge: {
    fontSize: FONT_SIZES.bodyLarge,
    lineHeight: FONT_SIZES.bodyLarge * LINE_HEIGHTS.bodyLarge,
    fontWeight: FONT_WEIGHTS.regular,
  },
  bodyMedium: {
    fontSize: FONT_SIZES.bodyMedium,
    lineHeight: FONT_SIZES.bodyMedium * LINE_HEIGHTS.bodyMedium,
    fontWeight: FONT_WEIGHTS.regular,
  },
  bodySmall: {
    fontSize: FONT_SIZES.bodySmall,
    lineHeight: FONT_SIZES.bodySmall * LINE_HEIGHTS.bodySmall,
    fontWeight: FONT_WEIGHTS.regular,
  },

  // Label styles - for form labels and small text
  labelLarge: {
    fontSize: FONT_SIZES.labelLarge,
    lineHeight: FONT_SIZES.labelLarge * LINE_HEIGHTS.labelLarge,
    fontWeight: FONT_WEIGHTS.medium,
  },
  labelMedium: {
    fontSize: FONT_SIZES.labelMedium,
    lineHeight: FONT_SIZES.labelMedium * LINE_HEIGHTS.labelMedium,
    fontWeight: FONT_WEIGHTS.medium,
  },
  labelSmall: {
    fontSize: FONT_SIZES.labelSmall,
    lineHeight: FONT_SIZES.labelSmall * LINE_HEIGHTS.labelSmall,
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Caption style - for very small text
  caption: {
    fontSize: FONT_SIZES.caption,
    lineHeight: FONT_SIZES.caption * LINE_HEIGHTS.caption,
    fontWeight: FONT_WEIGHTS.regular,
  },

  // Monospace style - for code, addresses, etc.
  monospace: {
    fontSize: FONT_SIZES.monospace,
    lineHeight: FONT_SIZES.monospace * LINE_HEIGHTS.monospace,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONT_FAMILIES.monospace,
  },
};

// Helper function to get typography style by variant
export const getTypographyStyle = (variant: TypographyVariant) => {
  return TYPOGRAPHY_STYLES[variant];
};

// Helper function to create custom typography style
export const createTypographyStyle = (
  variant: TypographyVariant,
  overrides: {
    color?: string;
    textAlign?: TypographyAlign;
    fontWeight?: TypographyWeight;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
  } = {}
) => {
  const baseStyle = getTypographyStyle(variant);
  return {
    ...baseStyle,
    ...overrides,
  };
};

// Predefined text styles for common use cases
export const TEXT_STYLES = {
  // Screen titles
  screenTitle: createTypographyStyle(TypographyVariant.DISPLAY_SMALL, {
    fontWeight: FONT_WEIGHTS.bold,
  }),

  // Card titles
  cardTitle: createTypographyStyle(TypographyVariant.HEADLINE_SMALL, {
    fontWeight: FONT_WEIGHTS.semibold,
  }),

  // Balance display
  balance: createTypographyStyle(TypographyVariant.DISPLAY_MEDIUM, {
    fontWeight: FONT_WEIGHTS.bold,
  }),

  // Wallet address
  walletAddress: createTypographyStyle(TypographyVariant.MONOSPACE, {
    fontWeight: FONT_WEIGHTS.regular,
  }),

  // Button text
  buttonText: createTypographyStyle(TypographyVariant.TITLE_MEDIUM, {
    fontWeight: FONT_WEIGHTS.semibold,
  }),

  // Form labels
  formLabel: createTypographyStyle(TypographyVariant.LABEL_MEDIUM, {
    fontWeight: FONT_WEIGHTS.medium,
  }),

  // Error text
  error: createTypographyStyle(TypographyVariant.BODY_SMALL, {
    fontWeight: FONT_WEIGHTS.regular,
  }),

  // Success text
  success: createTypographyStyle(TypographyVariant.BODY_SMALL, {
    fontWeight: FONT_WEIGHTS.regular,
  }),

  // Caption text
  caption: createTypographyStyle(TypographyVariant.CAPTION, {
    fontWeight: FONT_WEIGHTS.regular,
  }),
};

// Export font configuration for reference
export const FONT_CONFIG = {
  sizes: FONT_SIZES,
  weights: FONT_WEIGHTS,
  families: FONT_FAMILIES,
  lineHeights: LINE_HEIGHTS,
};
