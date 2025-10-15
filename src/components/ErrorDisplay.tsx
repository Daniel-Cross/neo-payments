import { View, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";

interface ErrorDisplayProps {
  error: string | null;
  style?: any;
}

export default function ErrorDisplay({ error, style }: ErrorDisplayProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!error) {
    return null;
  }

  return (
    <View style={[styles.errorContainer, style]}>
      <Typography
        variant={TypographyVariant.BODY_SMALL}
        color={theme.text.ERROR_RED}
        style={styles.errorText}
      >
        {error}
      </Typography>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    errorContainer: {
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "rgba(255, 115, 125, 0.1)",
      borderWidth: 1,
      borderColor: theme.text.ERROR_RED,
    },
    errorText: {
      textAlign: "center",
      lineHeight: 18,
    },
  });
