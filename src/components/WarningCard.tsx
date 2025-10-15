import { View, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";

interface WarningCardProps {
  title: string;
  items: string[];
  style?: any;
}

export default function WarningCard({ title, items, style }: WarningCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.warningCard, style]}>
      <Typography
        variant={TypographyVariant.TITLE_MEDIUM}
        color={theme.text.WARNING_ORANGE}
        style={styles.warningTitle}
      >
        {title}
      </Typography>
      {items.map((item, index) => (
        <Typography
          key={index}
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.LIGHT_GREY}
          style={styles.warningText}
        >
          {item}
        </Typography>
      ))}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    warningCard: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(255, 193, 7, 0.1)",
      borderWidth: 1,
      borderColor: theme.text.WARNING_ORANGE,
    },
    warningTitle: {
      marginBottom: 12,
    },
    warningText: {
      marginBottom: 4,
      lineHeight: 18,
    },
  });
