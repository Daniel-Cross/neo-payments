import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { EDGE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  isSeedPhrase,
  checkForDuplicateWallet,
  WALLET_IMPORT_INSTRUCTIONS,
  SECURITY_WARNINGS,
} from "../utils/walletHelpers";
import ErrorDisplay from "./ErrorDisplay";
import InfoCard from "./InfoCard";
import WarningCard from "./WarningCard";
import WalletInputCard from "./WalletInputCard";

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

  const handleImportWallet = async () => {
    if (!inputText.trim()) return;

    setIsImporting(true);
    setError(null);

    try {
      // Check for duplicate wallet first
      const duplicateError = checkForDuplicateWallet(inputText.trim(), wallets);
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

          <WalletInputCard
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (error) setError(null); // Clear error when user starts typing
            }}
          />

          <ErrorDisplay error={error} />

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

          <InfoCard
            title="📋 How to find your credentials:"
            items={WALLET_IMPORT_INSTRUCTIONS}
          />

          <WarningCard title="⚠️ Security Warning" items={SECURITY_WARNINGS} />
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
    buttonContainer: {
      marginBottom: 24,
    },
    importButton: {
      width: "100%",
    },
  });
