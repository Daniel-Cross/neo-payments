import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientCard } from "./GradientCard";
import { GradientButton } from "./GradientButton";
import { Typography } from "./Typography";
import Logo, { LogoSize } from "./Logo";
import {
  ButtonVariant,
  TypographyVariant,
  TypographyAlign,
  Route,
} from "../constants/enums";
import { router } from "expo-router";
import { EDGE_MARGIN } from "../constants/styles";

const OnboardingContent = () => {
  const { theme } = useTheme();

  const handleCreateWallet = () => {
    router.push(Route.CREATE_WALLET);
  };

  const handleImportWallet = () => {
    router.push(Route.IMPORT_WALLET);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
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
            Send and receive SOL in seconds with Solana's high-speed blockchain
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
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
});

export default OnboardingContent;
