import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import Header from "../components/Header";
import { Typography } from "../components/Typography";
import {
  GradientType,
  ButtonVariant,
  Route,
  TypographyVariant,
  TypographyAlign,
} from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { EDGE_MARGIN } from "../constants/styles";

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

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <Header />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Typography
            variant={TypographyVariant.HEADLINE_SMALL}
            color={theme.text.SOFT_WHITE}
            style={styles.title}
          >
            Create New Wallet
          </Typography>
          <View style={styles.content}>
            <View style={styles.subtitleContainer}>
              <Typography
                variant={TypographyVariant.BODY_LARGE}
                color={theme.text.LIGHT_GREY}
                textAlign={TypographyAlign.CENTER}
              >
                Generate a new Solana wallet
              </Typography>
            </View>

            <GradientCard style={styles.infoCard}>
              <Typography
                variant={TypographyVariant.HEADLINE_SMALL}
                color={theme.text.SOFT_WHITE}
                style={styles.infoTitle}
              >
                🔐 Security Information
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.LIGHT_GREY}
                style={styles.infoText}
              >
                • Your private key will be encrypted and stored securely on your
                device
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.LIGHT_GREY}
                style={styles.infoText}
              >
                • You can export your private key anytime from settings
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.LIGHT_GREY}
                style={styles.infoText}
              >
                • Never share your private key with anyone
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.LIGHT_GREY}
                style={styles.infoText}
              >
                • Make sure to backup your wallet before using it
              </Typography>
            </GradientCard>

            <GradientCard style={styles.warningCard}>
              <Typography
                variant={TypographyVariant.HEADLINE_SMALL}
                color={theme.text.WARNING_ORANGE}
                style={styles.warningTitle}
              >
                ⚠️ Important
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.LIGHT_GREY}
              >
                This will create a new wallet. If you already have a wallet, use
                "Import Existing Wallet" instead.
              </Typography>
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
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: EDGE_MARGIN,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  infoCard: {
    marginBottom: EDGE_MARGIN,
  },
  infoTitle: {
    marginBottom: 12,
    // Typography component handles font styling
  },
  infoText: {
    marginBottom: 8,
    // Typography component handles font styling
  },
  warningCard: {
    marginBottom: 30,
  },
  warningTitle: {
    marginBottom: 8,
    // Typography component handles font styling
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  createButton: {
    marginBottom: 16,
  },
});

export default CreateWalletScreen;
