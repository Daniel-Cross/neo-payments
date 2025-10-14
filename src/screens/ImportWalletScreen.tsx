import { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { Typography } from "../components/Typography";
import Header from "../components/Header";
import {
  GradientType,
  ButtonVariant,
  Route,
  TypographyVariant,
} from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { BASE_MARGIN, EDGE_MARGIN } from "../constants/styles";

const ImportWalletScreen = () => {
  const { theme } = useTheme();
  const { importWallet, importWalletFromSeedPhrase, isLoading } =
    useWalletStore();
  const [inputText, setInputText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const isSeedPhrase = (text: string) => {
    const words = text.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  };

  const handleImportWallet = async () => {
    if (!inputText.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid private key or seed phrase.",
      });
      return;
    }

    setIsImporting(true);
    try {
      let success = false;
      const trimmedInput = inputText.trim();

      if (isSeedPhrase(trimmedInput)) {
        // Import from seed phrase
        success = await importWalletFromSeedPhrase(trimmedInput);
      } else {
        // Import from private key
        success = await importWallet(trimmedInput);
      }

      if (success) {
        Toast.show({
          type: "success",
          text1: "Wallet Imported!",
          text2:
            "Your wallet has been imported successfully and stored securely on your device.",
        });
        router.replace(Route.TABS);
      } else {
        const inputType = isSeedPhrase(trimmedInput)
          ? "seed phrase"
          : "private key";
        Toast.show({
          type: "error",
          text1: "Import Failed",
          text2: `Failed to import wallet. Please check your ${inputType} and try again.`,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography
            variant={TypographyVariant.TITLE_LARGE}
            color={theme.text.SOFT_WHITE}
            style={styles.title}
          >
            Import Existing Wallet
          </Typography>
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.LIGHT_GREY}
            style={styles.subtitle}
          >
            Enter your private key or seed phrase to import your existing Solana
            wallet
          </Typography>
        </View>

        <GradientCard style={styles.inputCard}>
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
            onChangeText={setInputText}
            placeholder="Paste your private key or seed phrase here..."
            placeholderTextColor={theme.text.LIGHT_GREY}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
          />
        </GradientCard>
        <View style={styles.buttonContainer}>
          <GradientButton
            title={isImporting ? "Importing Wallet..." : "Import Wallet"}
            onPress={handleImportWallet}
            variant={ButtonVariant.PRIMARY}
            disabled={isImporting || !inputText.trim()}
            loading={isImporting}
            style={styles.importButton}
          />
        </View>

        <GradientCard style={styles.infoCard}>
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
          <Typography
            variant={TypographyVariant.BODY_SMALL}
            color={theme.text.LIGHT_GREY}
            style={styles.infoText}
          >
            • You can paste either a 12/24 word seed phrase or a private key
          </Typography>
        </GradientCard>

        <GradientCard style={styles.warningCard}>
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
        </GradientCard>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  inputCard: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  warningCard: {
    marginBottom: 30,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: BASE_MARGIN,
  },
  buttonContainer: {
    marginBottom: EDGE_MARGIN,
  },
  importButton: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 16,
  },
});

export default ImportWalletScreen;
