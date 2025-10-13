import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { GradientType, ButtonVariant } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { useEffect } from "react";

const HomeScreen = () => {
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

  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  const copyToClipboard = (text: string) => {
    // TODO: Implement clipboard functionality
    console.log("Copy to clipboard:", text);
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
        {/* Wallet Header */}
        <GradientCard style={styles.walletHeader}>
          <View style={styles.walletInfo}>
            <Text
              style={[styles.walletTitle, { color: theme.text.SOFT_WHITE }]}
            >
              Your Wallet
            </Text>
            <Text style={[styles.balance, { color: theme.text.SOFT_WHITE }]}>
              {formatBalance(balance)} SOL
            </Text>
          </View>

          <View style={styles.publicKeyContainer}>
            <Text
              style={[styles.publicKeyLabel, { color: theme.text.LIGHT_GREY }]}
            >
              Public Key
            </Text>
            <TouchableOpacity
              style={styles.publicKeyRow}
              onPress={() => publicKey && copyToClipboard(publicKey)}
            >
              <Text
                style={[styles.publicKey, { color: theme.text.SOFT_WHITE }]}
              >
                {formatPublicKey(publicKey)}
              </Text>
              <Text
                style={[styles.copyText, { color: theme.colors.ELECTRIC_BLUE }]}
              >
                Tap to copy
              </Text>
            </TouchableOpacity>
          </View>
        </GradientCard>

        {/* Action Buttons */}
        <GradientCard style={styles.actionsCard}>
          <Text style={[styles.actionsTitle, { color: theme.text.SOFT_WHITE }]}>
            Quick Actions
          </Text>

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

        {/* Recent Activity Placeholder */}
        <GradientCard style={styles.activityCard}>
          <Text
            style={[styles.activityTitle, { color: theme.text.SOFT_WHITE }]}
          >
            Recent Activity
          </Text>
          <Text
            style={[
              styles.activityPlaceholder,
              { color: theme.text.LIGHT_GREY },
            ]}
          >
            No recent transactions
          </Text>
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
  walletHeader: {
    marginBottom: 20,
  },
  walletInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  walletTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: "bold",
  },
  publicKeyContainer: {
    marginTop: 10,
  },
  publicKeyLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  publicKeyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  publicKey: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  copyText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionsCard: {
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: "600",
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
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  activityPlaceholder: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default HomeScreen;
