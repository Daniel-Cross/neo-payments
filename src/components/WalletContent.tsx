import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientCard } from "./GradientCard";
import { GradientButton } from "./GradientButton";
import { Typography } from "./Typography";
import { ButtonVariant, TypographyVariant } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { useEffect } from "react";

const WalletContent = () => {
  const { theme } = useTheme();
  const {
    publicKey,
    balance,
    updateBalance,
    isLoading,
    wallets,
    selectedWallet,
    isConnected,
  } = useWalletStore();

  useEffect(() => {
    // Update balance when component mounts
    updateBalance();
  }, [
    updateBalance,
    wallets,
    selectedWallet,
    publicKey,
    isConnected,
    isLoading,
  ]);

  const formatPublicKey = (key: string | null) => {
    if (!key) return "No wallet connected";
    return `${key.slice(0, 7)}...${key.slice(-7)}`;
  };

  const copyToClipboard = (text: string) => {
    // TODO: Implement clipboard functionality
    console.log("Copy to clipboard:", text);
  };

  return (
    <View style={styles.container}>
      {/* Wallet Header */}
      <GradientCard style={styles.walletHeader}>
        <View style={styles.walletInfo}>
          <Typography
            variant={TypographyVariant.HEADLINE_MEDIUM}
            color={theme.text.SOFT_WHITE}
            style={styles.walletTitle}
          >
            Your Wallet
          </Typography>
          <Typography
            variant={TypographyVariant.DISPLAY_SMALL}
            color={theme.text.SOFT_WHITE}
            style={styles.balance}
          >
            {balance.toFixed(4)} SOL
          </Typography>
        </View>

        <View style={styles.publicKeyContainer}>
          <Typography
            variant={TypographyVariant.LABEL_MEDIUM}
            color={theme.text.LIGHT_GREY}
            style={styles.publicKeyLabel}
          >
            Public Key
          </Typography>
          <View style={styles.publicKeyRow}>
            <Typography
              variant={TypographyVariant.BODY_MEDIUM}
              color={theme.text.SOFT_WHITE}
              style={styles.publicKey}
            >
              {formatPublicKey(publicKey)}
            </Typography>
            <TouchableOpacity
              onPress={() => copyToClipboard(publicKey || "")}
              style={styles.copyButton}
            >
              <Typography
                variant={TypographyVariant.LABEL_SMALL}
                color={theme.colors.ELECTRIC_BLUE}
                style={styles.copyText}
              >
                Tap to copy
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </GradientCard>

      {/* Action Buttons */}
      <GradientCard style={styles.actionsCard}>
        <Typography
          variant={TypographyVariant.TITLE_LARGE}
          color={theme.text.SOFT_WHITE}
          style={styles.actionsTitle}
        >
          Quick Actions
        </Typography>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="Send SOL"
            onPress={() => {}}
            variant={ButtonVariant.PRIMARY}
            style={styles.button}
          />
          <GradientButton
            title="Receive SOL"
            onPress={() => {}}
            variant={ButtonVariant.SECONDARY}
            style={styles.button}
          />
        </View>
      </GradientCard>

      {/* Recent Activity */}
      <GradientCard style={styles.activityCard}>
        <Typography
          variant={TypographyVariant.TITLE_LARGE}
          color={theme.text.SOFT_WHITE}
          style={styles.activityTitle}
        >
          Recent Activity
        </Typography>
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_GREY}
          style={styles.activityPlaceholder}
        >
          No recent transactions
        </Typography>
      </GradientCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  walletHeader: {
    marginBottom: 20,
  },
  walletInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  walletTitle: {
    marginBottom: 8,
  },
  balance: {
    // Typography component handles styling
  },
  publicKeyContainer: {
    marginTop: 10,
  },
  publicKeyLabel: {
    marginBottom: 8,
  },
  publicKeyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  publicKey: {
    flex: 1,
  },
  copyButton: {
    // No additional styling needed
  },
  copyText: {
    // Typography component handles styling
  },
  actionsCard: {
    marginBottom: 20,
  },
  actionsTitle: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
  },
  activityCard: {
    marginBottom: 20,
  },
  activityTitle: {
    marginBottom: 12,
  },
  activityPlaceholder: {
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default WalletContent;
