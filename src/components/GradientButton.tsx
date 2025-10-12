import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { ButtonVariant, ButtonSize } from "../constants/enums";

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
      case ButtonVariant.ACCENT:
        return theme.gradients.ACCENT;
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
        return "#000";
      case ButtonVariant.SECONDARY:
        return theme.text.SOFT_WHITE;
      case ButtonVariant.ACCENT:
        return theme.text.SOFT_WHITE;
      default:
        return "#000";
    }
  };

  const gradientConfig = getGradientConfig();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

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
          <Text style={[styles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
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
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
});
