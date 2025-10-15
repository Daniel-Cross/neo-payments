import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { EDGE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState, useEffect, useCallback } from "react";
import { derivePublicKeyFromInput, isSeedPhrase } from "../utils/keyDerivation";

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
  const { importWallet, importWalletFromSeedPhrase, wallets, isLoading } =
    useWalletStore();
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationPassed, setValidationPassed] = useState(false);

  const checkForDuplicateWallet = async (
    input: string
  ): Promise<string | null> => {
    try {
      const trimmedInput = input.trim();

      // Derive the public key from the input (private key or seed phrase)
      const derivedPublicKey = await derivePublicKeyFromInput(trimmedInput);

      // Check if any existing wallet has the same public key
      const existingWallet = wallets.find(
        (wallet) => wallet.publicKey === derivedPublicKey
      );

      if (existingWallet) {
        return `A wallet with this key already exists: ${existingWallet.name}`;
      }

      return null;
    } catch (error) {
      // If key derivation fails, it means the input is invalid
      return "Invalid private key or seed phrase format";
    }
  };

  // Check if input looks like it could be valid (basic length check)
  const looksLikeValidInput = (input: string): boolean => {
    const trimmed = input.trim();
    if (!trimmed) return false;
    
    // Check if it looks like a seed phrase (12 or 24 words)
    const words = trimmed.split(/\s+/);
    if (words.length === 12 || words.length === 24) {
      return true;
    }
    
    // Check if it looks like a private key (base58 or hex)
    // Base58 private keys are typically 88 characters, hex are 128 characters
    // But we'll be more lenient and check for reasonable lengths
    if (trimmed.length >= 32) {
      return true;
    }
    
    return false;
  };

  // Debounced validation function
  const validateInput = useCallback(async (input: string) => {
    if (!input.trim()) {
      setError(null);
      setValidationPassed(false);
      return;
    }

    // Only validate if input looks like it could be valid
    if (!looksLikeValidInput(input)) {
      setError(null);
      setValidationPassed(false);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Add a minimum loading time to make the spinner visible
      const [duplicateError] = await Promise.all([
        checkForDuplicateWallet(input.trim()),
        new Promise(resolve => setTimeout(resolve, 800)) // Minimum 800ms loading time
      ]);
      
      if (duplicateError) {
        setError(duplicateError);
        setValidationPassed(false);
      } else {
        setError(null);
        setValidationPassed(true);
      }
    } catch (error) {
      setError("Failed to validate input. Please check your input and try again.");
      setValidationPassed(false);
    } finally {
      setIsValidating(false);
    }
  }, [wallets]);

  // Debounced effect for real-time validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText.trim()) {
        validateInput(inputText);
      } else {
        setError(null);
        setValidationPassed(false);
        setIsValidating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputText, validateInput]);

  const handleImportWallet = async () => {
    if (!inputText.trim() || !validationPassed) return;

    try {
      const success = isSeedPhrase(inputText)
        ? await importWalletFromSeedPhrase(inputText.trim())
        : await importWallet(inputText.trim());

      if (success) {
        setInputText("");
        setError(null);
        setValidationPassed(false);
        onClose();
      } else {
        setError("Failed to import wallet. Please check your input and try again.");
      }
    } catch (error) {
      console.error("Import wallet error:", error);
      setError("Failed to import wallet. Please check your input and try again.");
    }
  };

  const handleClose = () => {
    setInputText("");
    setError(null);
    setValidationPassed(false);
    setIsValidating(false);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Typography
                variant={TypographyVariant.TITLE_LARGE}
                color={theme.text.SOFT_WHITE}
                style={styles.title}
              >
                Import Wallet
              </Typography>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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
              Import an existing wallet using your private key or seed phrase
            </Typography>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Typography
              variant={TypographyVariant.BODY_MEDIUM}
              color={theme.text.SOFT_WHITE}
              style={styles.instructionsText}
            >
              Enter your private key or seed phrase below. Make sure you're in a secure location and no one can see your screen.
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
                // Clear validation state when user starts typing
                if (error) setError(null);
                if (validationPassed) setValidationPassed(false);
              }}
              placeholder="Paste your private key or seed phrase here..."
              placeholderTextColor={theme.text.LIGHT_GREY}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              secureTextEntry={true}
            />
          </View>

          {/* Validation Loading Indicator */}
          {isValidating && looksLikeValidInput(inputText) && (
            <View style={styles.validationContainer}>
              <ActivityIndicator 
                size="small" 
                color={theme.colors.ELECTRIC_BLUE || theme.text.SOFT_WHITE} 
              />
              <Typography
                variant={TypographyVariant.BODY_SMALL}
                color={theme.text.LIGHT_GREY}
                style={styles.validationText}
              >
                {isSeedPhrase(inputText) 
                  ? "Validating seed phrase and checking for duplicates..."
                  : "Validating private key and checking for duplicates..."
                }
              </Typography>
            </View>
          )}

          {/* Input Hint */}
          {inputText.trim() && !isValidating && !looksLikeValidInput(inputText) && !error && (
            <View style={styles.hintContainer}>
              <Typography
                variant={TypographyVariant.BODY_SMALL}
                color={theme.text.LIGHT_GREY}
                style={styles.hintText}
              >
                {inputText.trim().split(/\s+/).length < 12 
                  ? "Enter a complete private key (64+ characters) or seed phrase (12/24 words)"
                  : "Enter a complete seed phrase (12 or 24 words)"
                }
              </Typography>
            </View>
          )}

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

          {/* Success Display */}
          {validationPassed && !error && (
            <View style={[styles.errorContainer, { backgroundColor: "rgba(34, 197, 94, 0.1)", borderColor: theme.text.SUCCESS_GREEN || "#22c55e" }]}>
              <Typography
                variant={TypographyVariant.BODY_SMALL}
                color={theme.text.SUCCESS_GREEN || "#22c55e"}
                style={styles.errorText}
              >
                ✓ Valid input - ready to import
              </Typography>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <GradientButton
              title={
                isValidating
                  ? "Validating..."
                  : isLoading
                    ? "Importing..."
                    : validationPassed
                      ? "Import Wallet ✓"
                      : "Import Wallet"
              }
              onPress={handleImportWallet}
              variant={ButtonVariant.PRIMARY}
              disabled={isLoading || isValidating || !inputText.trim() || !validationPassed}
              loading={isLoading || isValidating}
              style={styles.importButton}
            />
          </View>

          {/* Security Warning */}
          <View style={styles.warningContainer}>
            <MaterialCommunityIcons
              name="shield-alert"
              size={20}
              color={theme.text.WARNING_ORANGE}
              style={styles.warningIcon}
            />
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.WARNING_ORANGE}
              style={styles.warningText}
            >
              Never share your private key or seed phrase with anyone. Neo Payments will never ask for this information.
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
      marginBottom: 32,
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
    instructionsContainer: {
      marginBottom: 24,
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 1,
      borderColor: theme.colors.ELECTRIC_BLUE,
    },
    instructionsText: {
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
    validationContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 1,
      borderColor: theme.colors.ELECTRIC_BLUE || "#3b82f6",
    },
    validationText: {
      marginLeft: 8,
      textAlign: "center",
      lineHeight: 18,
    },
    hintContainer: {
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "rgba(156, 163, 175, 0.1)",
      borderWidth: 1,
      borderColor: "rgba(156, 163, 175, 0.3)",
    },
    hintText: {
      textAlign: "center",
      lineHeight: 18,
      fontStyle: "italic",
    },
    buttonContainer: {
      marginBottom: 24,
    },
    importButton: {
      width: "100%",
    },
    warningContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(251, 146, 60, 0.1)",
      borderWidth: 1,
      borderColor: theme.text.WARNING_ORANGE,
    },
    warningIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    warningText: {
      flex: 1,
      lineHeight: 18,
    },
  });