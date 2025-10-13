import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { useEffect } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { EDGE_MARGIN } from "../constants/styles";

// Helper function to get currency symbol
const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    CNY: "¥",
    INR: "₹",
    KRW: "₩",
    BRL: "R$",
    RUB: "₽",
    MXN: "$",
    ZAR: "R",
  };
  return symbols[currency] || currency + " ";
};

const WalletContent = () => {
  const { theme } = useTheme();
  const {
    publicKey,
    balance,
    fiatValue,
    selectedCurrency,
    updateBalance,
    updateSolPrice,
    isLoading,
    wallets,
    selectedWallet,
    isConnected,
  } = useWalletStore();

  useEffect(() => {
    // Update balance and price when component mounts
    if (isConnected && selectedWallet) {
      updateBalance();
      updateSolPrice();
    }
  }, [
    updateBalance,
    updateSolPrice,
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

  const handleSend = () => {
    // TODO: Navigate to send screen
    console.log("Send button pressed");
  };

  const handleScan = () => {
    // TODO: Open QR scanner
    console.log("Scan button pressed");
  };

  return (
    <View style={styles.container}>
      {/* Wallet info in top left */}
      <View>
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.SOFT_WHITE}
        >
          Test Account
        </Typography>
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.SOFT_WHITE}
        >
          +46 000 00 00 00
        </Typography>
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.SOFT_WHITE}
        >
          {formatPublicKey(publicKey)}
        </Typography>
        <Typography
          variant={TypographyVariant.HEADLINE_MEDIUM}
          color={theme.text.SOFT_WHITE}
        >
          {balance.toFixed(4)} SOL
        </Typography>
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_GREY}
        >
          {getCurrencySymbol(selectedCurrency)}
          {fiatValue.toFixed(2)} {selectedCurrency}
        </Typography>
      </View>

      {/* Centered rocket image */}
      <View style={styles.rocketContainer}>
        <Image
          source={require("../../assets/images/rocket.png")}
          style={styles.rocket}
        />
      </View>

      {/* Buttons at bottom */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title="Send"
          onPress={handleSend}
          variant={ButtonVariant.PRIMARY}
          style={styles.button}
        />
        <GradientButton
          title="Scan"
          onPress={handleScan}
          variant={ButtonVariant.SECONDARY}
          style={styles.button}
          icon={
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={20}
              color={theme.text.SOFT_WHITE}
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: EDGE_MARGIN,
    justifyContent: "space-between",
  },
  rocketContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rocket: {
    width: 300,
    height: 300,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: EDGE_MARGIN,
  },
  button: {
    flex: 1,
  },
});

export default WalletContent;
