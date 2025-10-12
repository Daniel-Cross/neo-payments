import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { GradientType } from "../constants/enums";

interface GradientBackgroundProps {
  children: React.ReactNode;
  gradient?: GradientType;
  style?: ViewStyle;
}

export const GradientBackground = ({
  children,
  gradient = GradientType.PRIMARY,
  style,
}: GradientBackgroundProps) => {
  const { theme } = useTheme();

  const getGradientConfig = () => {
    switch (gradient) {
      case GradientType.PRIMARY:
        return theme.gradients.PRIMARY;
      case GradientType.CARD:
        return theme.gradients.CARD;
      case GradientType.BUTTON:
        return theme.gradients.BUTTON_PRIMARY;
      case GradientType.ACCENT:
        return theme.gradients.ACCENT;
      default:
        return theme.gradients.PRIMARY;
    }
  };

  const gradientConfig = getGradientConfig();

  return (
    <LinearGradient
      colors={gradientConfig.colors as [string, string, ...string[]]}
      start={gradientConfig.start}
      end={gradientConfig.end}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
