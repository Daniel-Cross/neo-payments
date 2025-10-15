import { View, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";

interface InfoCardProps {
  title: string;
  items: string[];
  style?: any;
}

export default function InfoCard({ title, items, style }: InfoCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.infoCard, style]}>
      <Typography
        variant={TypographyVariant.TITLE_MEDIUM}
        color={theme.text.SOFT_WHITE}
        style={styles.infoTitle}
      >
        {title}
      </Typography>
      {items.map((item, index) => (
        <Typography
          key={index}
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.LIGHT_GREY}
          style={styles.infoText}
        >
          {item}
        </Typography>
      ))}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    infoCard: {
      marginBottom: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
    },
    infoTitle: {
      marginBottom: 12,
    },
    infoText: {
      marginBottom: 4,
      lineHeight: 18,
    },
  });
