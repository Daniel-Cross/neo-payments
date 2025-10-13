import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { Typography } from "../components/Typography";
import Logo, { LogoSize } from "../components/Logo";
import {
  GradientType,
  ButtonVariant,
  TypographyVariant,
  TypographyAlign,
  Route,
} from "../constants/enums";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EDGE_MARGIN } from "../constants/styles";

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
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Logo size={LogoSize.LARGE} />
            <Typography
              variant={TypographyVariant.BODY_LARGE}
              color={theme.text.LIGHT_GREY}
              textAlign={TypographyAlign.CENTER}
              style={styles.subtitle}
            >
              Your secure Solana wallet for lightning-fast transactions
            </Typography>
          </View>

          <GradientCard style={styles.featureCard}>
            <Typography
              variant={TypographyVariant.TITLE_LARGE}
              color={theme.text.SOFT_WHITE}
              style={styles.featureTitle}
            >
              ⚡ Lightning Fast
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_MEDIUM}
              color={theme.text.LIGHT_GREY}
              style={styles.featureDescription}
            >
              Send and receive SOL in seconds with Solana's high-speed
              blockchain
            </Typography>
          </GradientCard>

          <GradientCard style={styles.featureCard}>
            <Typography
              variant={TypographyVariant.TITLE_LARGE}
              color={theme.text.SOFT_WHITE}
              style={styles.featureTitle}
            >
              🔒 Secure by Design
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_MEDIUM}
              color={theme.text.LIGHT_GREY}
              style={styles.featureDescription}
            >
              Your private keys are encrypted and stored securely on your device
            </Typography>
          </GradientCard>

          <GradientCard style={styles.featureCard}>
            <Typography
              variant={TypographyVariant.TITLE_LARGE}
              color={theme.text.SOFT_WHITE}
              style={styles.featureTitle}
            >
              💰 Low Fees
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_MEDIUM}
              color={theme.text.LIGHT_GREY}
              style={styles.featureDescription}
            >
              Enjoy minimal transaction fees on the Solana network
            </Typography>
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
              variant={ButtonVariant.SECONDARY}
            />
          </View>

          {/* <Text style={[styles.disclaimer, { color: theme.text.LIGHT_GREY }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text> */}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: EDGE_MARGIN,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  subtitle: {
    textAlign: "center",
  },
  featureCard: {
    marginBottom: 8,
  },
  featureTitle: {
    marginBottom: 8,
  },
  featureDescription: {
    // Typography component handles line height
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  primaryButton: {
    marginBottom: 8,
  },
  disclaimer: {
    textAlign: "center",
    marginTop: 20,
  },
});

export default OnboardingScreen;
