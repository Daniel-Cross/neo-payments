import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientButton } from "./GradientButton";
import { ButtonVariant } from "../constants/enums";
import { useWalletStore } from "../store/walletStore";
import { useEffect, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { EDGE_MARGIN } from "../constants/styles";
import WalletManagementModal from "./WalletManagementModal";
import WalletInfoCard from "./WalletInfoCard";
import UserInfoCard from "./UserInfoCard";

const WalletContent = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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

  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);

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

  const handleSend = () => {
    // TODO: Navigate to send screen
    console.log("Send button pressed");
  };

  const handleScan = () => {
    // TODO: Open QR scanner
    console.log("Scan button pressed");
  };

  const handleWalletInfoPress = () => {
    setIsWalletModalVisible(true);
  };

  const handleUserInfoPress = () => {
    // TODO: Open user profile/settings modal
    console.log("User info pressed");
  };

  return (
    <View style={styles.container}>
      {/* Top section with wallet info on left and user info on right */}
      <View style={styles.topSection}>
        <WalletInfoCard
          walletName={selectedWallet?.name || "Wallet"}
          publicKey={publicKey || ""}
          balance={balance}
          fiatValue={fiatValue}
          currency={selectedCurrency}
          onPress={handleWalletInfoPress}
        />
        <UserInfoCard onPress={handleUserInfoPress} />
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

      {/* Wallet Management Modal */}
      <WalletManagementModal
        visible={isWalletModalVisible}
        onClose={() => setIsWalletModalVisible(false)}
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: EDGE_MARGIN,
      justifyContent: "space-between",
    },
    topSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "stretch",
      paddingTop: EDGE_MARGIN,
      gap: 12,
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
