import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { GradientType, ButtonVariant, Route } from "../constants/enums";
import { router } from "expo-router";

const OnboardingScreen = () => {
  const { theme } = useTheme();

  const handleCreateWallet = () => {
    router.push(Route.CREATE_WALLET);
  };

  const handleImportWallet = () => {
    router.push(Route.IMPORT_WALLET);
  };

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
            Welcome to Blink
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.LIGHT_GREY }]}>
            Your secure Solana wallet for lightning-fast transactions
          </Text>
        </View>

        <GradientCard style={styles.featureCard}>
          <Text style={[styles.featureTitle, { color: theme.text.SOFT_WHITE }]}>
            ⚡ Lightning Fast
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: theme.text.LIGHT_GREY },
            ]}
          >
            Send and receive SOL in seconds with Solana's high-speed blockchain
          </Text>
        </GradientCard>

        <GradientCard style={styles.featureCard}>
          <Text style={[styles.featureTitle, { color: theme.text.SOFT_WHITE }]}>
            🔒 Secure by Design
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: theme.text.LIGHT_GREY },
            ]}
          >
            Your private keys are encrypted and stored securely on your device
          </Text>
        </GradientCard>

        <GradientCard style={styles.featureCard}>
          <Text style={[styles.featureTitle, { color: theme.text.SOFT_WHITE }]}>
            💰 Low Fees
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: theme.text.LIGHT_GREY },
            ]}
          >
            Enjoy minimal transaction fees on the Solana network
          </Text>
        </GradientCard>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="Create New Wallet"
            onPress={handleCreateWallet}
            variant={ButtonVariant.PRIMARY}
            style={styles.primaryButton}
          />
          <GradientButton
            title="Import Existing Wallet"
            onPress={handleImportWallet}
            variant={ButtonVariant.NAVY}
            style={styles.secondaryButton}
          />
        </View>

        <Text style={[styles.disclaimer, { color: theme.text.LIGHT_GREY }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
  },
  featureCard: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryButton: {
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 20,
  },
});

export default OnboardingScreen;
