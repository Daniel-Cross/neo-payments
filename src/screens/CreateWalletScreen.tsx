import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { GradientType, ButtonVariant, Route } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const CreateWalletScreen = () => {
  const { theme } = useTheme();
  const { createNewWallet } = useWalletStore();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      const success = await createNewWallet();
      if (success) {
        Toast.show({
          type: "success",
          text1: "Wallet Created!",
          text2:
            "Your new Solana wallet has been created successfully and stored securely on your device.",
        });
        router.replace(Route.TABS);
      } else {
        Toast.show({
          type: "error",
          text1: "Creation Failed",
          text2: "Failed to create wallet. Please try again.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsCreating(false);
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
            Create New Wallet
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.LIGHT_GREY }]}>
            Generate a new Solana wallet with a secure private key
          </Text>
        </View>

        <GradientCard style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: theme.text.SOFT_WHITE }]}>
            🔐 Security Information
          </Text>
          <Text style={[styles.infoText, { color: theme.text.LIGHT_GREY }]}>
            • Your private key will be encrypted and stored securely on your
            device
          </Text>
          <Text style={[styles.infoText, { color: theme.text.LIGHT_GREY }]}>
            • You can export your private key anytime from settings
          </Text>
          <Text style={[styles.infoText, { color: theme.text.LIGHT_GREY }]}>
            • Never share your private key with anyone
          </Text>
          <Text style={[styles.infoText, { color: theme.text.LIGHT_GREY }]}>
            • Make sure to backup your wallet before using it
          </Text>
        </GradientCard>

        <GradientCard style={styles.warningCard}>
          <Text
            style={[styles.warningTitle, { color: theme.text.WARNING_ORANGE }]}
          >
            ⚠️ Important
          </Text>
          <Text style={[styles.warningText, { color: theme.text.LIGHT_GREY }]}>
            This will create a new wallet. If you already have a wallet, use
            "Import Existing Wallet" instead.
          </Text>
        </GradientCard>

        <View style={styles.buttonContainer}>
          <GradientButton
            title={isCreating ? "Creating Wallet..." : "Create Wallet"}
            onPress={handleCreateWallet}
            variant={ButtonVariant.PRIMARY}
            disabled={isCreating}
            loading={isCreating}
            style={styles.createButton}
          />
          <GradientButton
            title="Go Back"
            onPress={handleGoBack}
            variant={ButtonVariant.SECONDARY}
            style={styles.backButton}
          />
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  createButton: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 20,
  },
});

export default CreateWalletScreen;
