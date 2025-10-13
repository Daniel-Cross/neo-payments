import { Text, TextProps, TextStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { TypographyVariant, TypographyAlign } from "../constants/enums";
import {
  HEADER_TEXT,
  SUB_HEADER_TEXT,
  BUTTON_TEXT,
  BODY_TEXT,
  SMALL_TEXT,
  FONT_SIZE_32,
  FONT_SIZE_28,
  FONT_SIZE_24,
  FONT_SIZE_18,
  FONT_SIZE_16,
  FONT_SIZE_14,
} from "../constants/typography";

interface TypographyProps extends Omit<TextProps, "style"> {
  variant?: TypographyVariant;
  color?: string;
  textAlign?: TypographyAlign;
  weight?: string;
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
  style?: TextStyle;
  children: React.ReactNode;
}

export const Typography = ({
  variant = TypographyVariant.BODY_MEDIUM,
  color,
  textAlign,
  weight,
  size,
  lineHeight,
  letterSpacing,
  style,
  children,
  ...textProps
}: TypographyProps) => {
  const { theme } = useTheme();

  // Get base typography style based on variant
  const getBaseStyle = () => {
    switch (variant) {
      case TypographyVariant.DISPLAY_LARGE:
        return {
          fontFamily: "KanitBold",
          fontSize: FONT_SIZE_32,
          lineHeight: FONT_SIZE_32 * 1.2,
          fontWeight: "bold" as const,
        };
      case TypographyVariant.DISPLAY_MEDIUM:
        return {
          fontFamily: "KanitBold",
          fontSize: FONT_SIZE_28,
          lineHeight: FONT_SIZE_28 * 1.2,
          fontWeight: "bold" as const,
        };
      case TypographyVariant.DISPLAY_SMALL:
        return {
          fontFamily: "KanitBold",
          fontSize: FONT_SIZE_24,
          lineHeight: FONT_SIZE_24 * 1.2,
          fontWeight: "bold" as const,
        };
      case TypographyVariant.HEADLINE_LARGE:
        return HEADER_TEXT.font;
      case TypographyVariant.HEADLINE_MEDIUM:
        return SUB_HEADER_TEXT.font;
      case TypographyVariant.HEADLINE_SMALL:
        return {
          fontFamily: "KanitBold",
          fontSize: FONT_SIZE_16,
          lineHeight: FONT_SIZE_16 * 1.3,
          fontWeight: "bold" as const,
        };
      case TypographyVariant.TITLE_LARGE:
        return {
          fontFamily: "KanitBold",
          fontSize: FONT_SIZE_18,
          lineHeight: FONT_SIZE_18 * 1.3,
          fontWeight: "bold" as const,
        };
      case TypographyVariant.TITLE_MEDIUM:
        return {
          fontFamily: "Kanit",
          fontSize: FONT_SIZE_16,
          lineHeight: FONT_SIZE_16 * 1.3,
          fontWeight: "600" as const,
        };
      case TypographyVariant.TITLE_SMALL:
        return {
          fontFamily: "Kanit",
          fontSize: FONT_SIZE_14,
          lineHeight: FONT_SIZE_14 * 1.3,
          fontWeight: "600" as const,
        };
      case TypographyVariant.BODY_LARGE:
        return {
          ...BODY_TEXT,
          fontSize: FONT_SIZE_18,
        };
      case TypographyVariant.BODY_MEDIUM:
        return BODY_TEXT;
      case TypographyVariant.BODY_SMALL:
        return {
          ...BODY_TEXT,
          fontSize: FONT_SIZE_14,
        };
      case TypographyVariant.LABEL_LARGE:
        return BUTTON_TEXT;
      case TypographyVariant.LABEL_MEDIUM:
        return {
          fontFamily: "Kanit",
          fontSize: FONT_SIZE_14,
          lineHeight: FONT_SIZE_14 * 1.2,
          fontWeight: "600" as const,
        };
      case TypographyVariant.LABEL_SMALL:
        return SMALL_TEXT.font;
      default:
        return BODY_TEXT;
    }
  };

  const baseStyle = getBaseStyle();

  // Create custom style with overrides
  const customStyle = {
    color: color || theme.text.SOFT_WHITE,
    textAlign,
    fontWeight: weight as any,
    fontSize: size,
    lineHeight,
    letterSpacing,
  };

  return (
    <Text
      style={[baseStyle, customStyle, style]}
      allowFontScaling={false}
      {...textProps}
    >
      {children}
    </Text>
  );
};

// Convenience components for common typography variants
export const DisplayLarge = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.DISPLAY_LARGE} {...props} />
);

export const DisplayMedium = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.DISPLAY_MEDIUM} {...props} />
);

export const DisplaySmall = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.DISPLAY_SMALL} {...props} />
);

export const HeadlineLarge = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.HEADLINE_LARGE} {...props} />
);

export const HeadlineMedium = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.HEADLINE_MEDIUM} {...props} />
);

export const HeadlineSmall = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.HEADLINE_SMALL} {...props} />
);

export const TitleLarge = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.TITLE_LARGE} {...props} />
);

export const TitleMedium = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.TITLE_MEDIUM} {...props} />
);

export const TitleSmall = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.TITLE_SMALL} {...props} />
);

export const BodyLarge = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.BODY_LARGE} {...props} />
);

export const BodyMedium = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.BODY_MEDIUM} {...props} />
);

export const BodySmall = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.BODY_SMALL} {...props} />
);

export const LabelLarge = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.LABEL_LARGE} {...props} />
);

export const LabelMedium = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.LABEL_MEDIUM} {...props} />
);

export const LabelSmall = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.LABEL_SMALL} {...props} />
);

export const Caption = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.CAPTION} {...props} />
);

export const Monospace = (props: Omit<TypographyProps, "variant">) => (
  <Typography variant={TypographyVariant.MONOSPACE} {...props} />
);
