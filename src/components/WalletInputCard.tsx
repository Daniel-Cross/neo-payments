import { View, StyleSheet, TextInput } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";

interface WalletInputCardProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

export default function WalletInputCard({
  value,
  onChangeText,
  placeholder = "Paste your private key or seed phrase here...",
  style,
}: WalletInputCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.inputCard, style]}>
      <Typography
        variant={TypographyVariant.BODY_LARGE}
        color={theme.text.SOFT_WHITE}
        style={styles.inputLabel}
      >
        Private Key or Seed Phrase
      </Typography>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: theme.background.PURPLE_LIGHTER,
            color: theme.text.SOFT_WHITE,
            borderColor: theme.background.PURPLE_HOVER,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.text.LIGHT_GREY}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        secureTextEntry={true}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    inputCard: {
      marginBottom: 24,
    },
    inputLabel: {
      marginBottom: 12,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      minHeight: 100,
      fontFamily: "monospace",
    },
  });
