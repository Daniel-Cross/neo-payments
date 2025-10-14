import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { EDGE_MARGIN, BASE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";

interface ImportWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ImportWalletModal({
  visible,
  onClose,
}: ImportWalletModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { importWallet, importWalletFromSeedPhrase, wallets } =
    useWalletStore();
  const [inputText, setInputText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSeedPhrase = (text: string) => {
    const words = text.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  };

  const checkForDuplicateWallet = async (
    input: string
  ): Promise<string | null> => {
    try {
      // For now, we'll need to derive the public key to check for duplicates
      // This is a simplified check - in a real implementation, you'd want to
      // derive the public key from the private key/seed phrase
      const trimmedInput = input.trim();

      // Check if any existing wallet has the same input (this is a basic check)
      // In a real implementation, you'd derive the public key and compare
      const existingWallet = wallets.find(
        (wallet) =>
          wallet.publicKey === trimmedInput ||
          wallet.name.toLowerCase().includes(trimmedInput.toLowerCase())
      );

      if (existingWallet) {
        return `A wallet with this key already exists: ${existingWallet.name}`;
      }

      return null;
    } catch (error) {
      return "Unable to validate wallet. Please check your input and try again.";
    }
  };

  const handleImportWallet = async () => {
    if (!inputText.trim()) return;

    setIsImporting(true);
    setError(null);

    try {
      // Check for duplicate wallet first
      const duplicateError = await checkForDuplicateWallet(inputText.trim());
      if (duplicateError) {
        setError(duplicateError);
        setIsImporting(false);
        return;
      }

      const success = isSeedPhrase(inputText)
        ? await importWalletFromSeedPhrase(inputText.trim())
        : await importWallet(inputText.trim());

      if (success) {
        setInputText("");
        setError(null);
        onClose();
      } else {
        setError(
          "Failed to import wallet. Please check your input and try again."
        );
      }
    } catch (error) {
      console.error("Import failed:", error);
      setError(
        "An error occurred while importing the wallet. Please try again."
      );
    } finally {
      setIsImporting(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.DARK_PURPLE },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Typography
                variant={TypographyVariant.TITLE_LARGE}
                color={theme.text.SOFT_WHITE}
                style={styles.title}
              >
                Import Wallet
              </Typography>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.text.SOFT_WHITE}
                />
              </TouchableOpacity>
            </View>
            <Typography
              variant={TypographyVariant.BODY_MEDIUM}
              color={theme.text.LIGHT_GREY}
              style={styles.subtitle}
            >
              Enter your private key or seed phrase
            </Typography>
          </View>

          <View style={styles.inputCard}>
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
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                if (error) setError(null); // Clear error when user starts typing
              }}
              placeholder="Paste your private key or seed phrase here..."
              placeholderTextColor={theme.text.LIGHT_GREY}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              secureTextEntry={true}
            />
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Typography
                variant={TypographyVariant.BODY_SMALL}
                color={theme.text.ERROR_RED}
                style={styles.errorText}
              >
                {error}
              </Typography>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <GradientButton
              title={isImporting ? "Importing..." : "Import Wallet"}
              onPress={handleImportWallet}
              variant={ButtonVariant.PRIMARY}
              disabled={isImporting || !inputText.trim()}
              loading={isImporting}
              style={styles.importButton}
            />
          </View>

          <View style={styles.infoCard}>
            <Typography
              variant={TypographyVariant.TITLE_MEDIUM}
              color={theme.text.SOFT_WHITE}
              style={styles.infoTitle}
            >
              📋 How to find your credentials:
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.infoText}
            >
              • From Phantom: Settings → Show Secret Recovery Phrase
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.infoText}
            >
              • From Solflare: Settings → Export Private Key or Seed Phrase
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.infoText}
            >
              • From other wallets: Look for "Export" or "Recovery Phrase" in
              settings
            </Typography>
          </View>

          <View style={styles.warningCard}>
            <Typography
              variant={TypographyVariant.TITLE_MEDIUM}
              color={theme.text.WARNING_ORANGE}
              style={styles.warningTitle}
            >
              ⚠️ Security Warning
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.warningText}
            >
              • Never share your private key with anyone
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.warningText}
            >
              • Make sure you're in a secure environment
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.warningText}
            >
              • Your private key will be encrypted and stored securely
            </Typography>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
    },
    scrollContent: {
      paddingHorizontal: EDGE_MARGIN,
      paddingBottom: 20,
    },
    header: {
      marginBottom: 24,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    title: {
      flex: 1,
      textAlign: "left",
    },
    closeButton: {
      padding: 8,
      marginLeft: 16,
    },
    subtitle: {
      textAlign: "center",
      lineHeight: 20,
    },
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
    buttonContainer: {
      marginBottom: 24,
    },
    importButton: {
      width: "100%",
    },
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
