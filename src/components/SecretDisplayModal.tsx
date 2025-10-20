import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import CloseButton from "./CloseButton";

interface SecretDisplayModalProps {
  visible: boolean;
  secretType: "privateKey" | "seedPhrase" | null;
  secretValue: string;
  onClose: () => void;
  onCopy: () => void;
}

export default function SecretDisplayModal({
  visible,
  secretType,
  secretValue,
  onClose,
  onCopy,
}: SecretDisplayModalProps) {
  const { theme } = useTheme();

  if (!visible || !secretType || !secretValue) {
    return null;
  }

  const handleCopySecret = async () => {
    await Clipboard.setStringAsync(secretValue);
    onCopy();
  };

  const getWarningMessage = () => {
    return secretType === "privateKey"
      ? "Keep your private key secure and never share it with anyone."
      : "Write down your seed phrase and store it in a safe place. Anyone with this phrase can access your wallet.";
  };

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.secretModal,
          { backgroundColor: theme.background.PURPLE_ACCENT },
        ]}
      >
        <View style={styles.secretModalHeader}>
          <Typography
            variant={TypographyVariant.TITLE_MEDIUM}
            color={theme.text.SOFT_WHITE}
            style={styles.secretModalTitle}
          >
            {secretType === "privateKey" ? "Private Key" : "Seed Phrase"}
          </Typography>
          <CloseButton onPress={onClose} />
        </View>

        <Typography
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.LIGHT_GREY}
          style={styles.secretWarning}
        >
          {getWarningMessage()}
        </Typography>

        <TouchableOpacity
          onPress={handleCopySecret}
          style={styles.secretContainer}
        >
          <Typography
            variant={TypographyVariant.BODY_SMALL}
            color={theme.text.SOFT_WHITE}
            style={styles.secretText}
          >
            {secretValue}
          </Typography>
          <MaterialCommunityIcons
            name="content-copy"
            size={20}
            color={theme.text.LIGHT_GREY}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  secretModal: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  secretModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  secretModalTitle: {
    flex: 1,
  },
  secretWarning: {
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },
  secretContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  secretText: {
    flex: 1,
    fontFamily: "monospace",
    lineHeight: 20,
  },
});
