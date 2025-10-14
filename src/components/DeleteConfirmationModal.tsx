import { View, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";

interface DeleteConfirmationModalProps {
  visible: boolean;
  walletName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  visible,
  walletName,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const { theme } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.confirmationModal,
          { backgroundColor: theme.background.PURPLE_ACCENT },
        ]}
      >
        <Typography
          variant={TypographyVariant.TITLE_MEDIUM}
          color={theme.text.SOFT_WHITE}
          style={styles.confirmationTitle}
        >
          Delete Wallet
        </Typography>
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_GREY}
          style={styles.confirmationMessage}
        >
          Are you sure you want to delete "{walletName}"? This action cannot be
          undone.
        </Typography>
        <View style={styles.confirmationButtons}>
          <GradientButton
            title="Cancel"
            onPress={onCancel}
            variant={ButtonVariant.SECONDARY}
            style={styles.confirmationButton}
          />
          <GradientButton
            title="Delete"
            onPress={onConfirm}
            variant={ButtonVariant.PRIMARY}
            style={styles.confirmationButton}
          />
        </View>
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
  confirmationModal: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  confirmationTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  confirmationMessage: {
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmationButton: {
    flex: 1,
  },
});
