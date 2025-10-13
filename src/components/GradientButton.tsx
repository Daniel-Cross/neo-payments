import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import {
  ButtonVariant,
  ButtonSize,
  TypographyVariant,
} from "../constants/enums";
import { TEXT } from "../constants/colours";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton = ({
  title,
  onPress,
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MEDIUM,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: GradientButtonProps) => {
  const { theme } = useTheme();

  const getGradientConfig = () => {
    switch (variant) {
      case ButtonVariant.PRIMARY:
        return theme.gradients.BUTTON_PRIMARY;
      case ButtonVariant.SECONDARY:
        return theme.gradients.BUTTON_SECONDARY;
      default:
        return theme.gradients.BUTTON_PRIMARY;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case ButtonSize.SMALL:
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.small,
        };
      case ButtonSize.LARGE:
        return {
          paddingVertical: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xxxl,
          borderRadius: theme.borderRadius.large,
        };
      default: // medium
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.borderRadius.medium,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case ButtonVariant.PRIMARY:
        return TEXT.SOFT_WHITE;
      case ButtonVariant.SECONDARY:
        return theme.text.SOFT_WHITE;
      default:
        return TEXT.SOFT_WHITE;
    }
  };

  const gradientConfig = getGradientConfig();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

  // For secondary buttons, use outline style instead of gradient
  if (variant === ButtonVariant.SECONDARY) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[style]}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.button,
            styles.outlineButton,
            sizeStyles,
            { borderColor: theme.colors.NEON_PINK },
            disabled && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <Typography
              variant={TypographyVariant.LABEL_LARGE}
              color={textColor}
              style={textStyle}
            >
              {title}
            </Typography>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // For primary buttons, use gradient
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientConfig.colors as [string, string, ...string[]]}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={[styles.button, sizeStyles, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Typography
            variant={TypographyVariant.LABEL_LARGE}
            color={textColor}
            style={textStyle}
          >
            {title}
          </Typography>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 8,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    // Use negative margin to compensate for border width
    margin: -2,
  },
  // Typography component handles font styling
  disabled: {
    opacity: 0.5,
  },
});
