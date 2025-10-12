import { Text, TextProps, TextStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { TypographyVariant, TypographyAlign } from "../constants/enums";
import {
  getTypographyStyle,
  createTypographyStyle,
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

  // Get base typography style
  const baseStyle = getTypographyStyle(variant);

  // Create custom style with overrides
  const customStyle = createTypographyStyle(variant, {
    color: color || theme.text.SOFT_WHITE,
    textAlign,
    fontWeight: weight as any,
    fontSize: size,
    lineHeight,
    letterSpacing,
  });

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
