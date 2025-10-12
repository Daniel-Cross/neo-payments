import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { CardVariant } from "../constants/enums";

interface GradientCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
}

export const GradientCard = ({
  children,
  variant = CardVariant.DEFAULT,
  style,
}: GradientCardProps) => {
  const { theme } = useTheme();

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.xl,
    };

    switch (variant) {
      case CardVariant.ELEVATED:
        return {
          ...baseStyles,
          ...theme.shadows.medium,
        };
      case CardVariant.OUTLINED:
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
        };
      default:
        return baseStyles;
    }
  };

  const cardStyles = getCardStyles();

  return (
    <LinearGradient
      colors={theme.gradients.CARD.colors as [string, string, ...string[]]}
      start={theme.gradients.CARD.start}
      end={theme.gradients.CARD.end}
      style={[styles.container, cardStyles, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    // Additional styles can be added here
  },
});
