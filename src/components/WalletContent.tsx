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
import SendSolModal from "./SendSolModal";
import QRScanner from "./QRScanner";
import UserProfileModal from "./UserProfileModal";

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
  const [showSendModal, setShowSendModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);

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

  // When a QR code is scanned, open the send modal with the address
  useEffect(() => {
    if (scannedAddress) {
      setShowSendModal(true);
      // Reset scanned address after opening modal
      setScannedAddress(null);
    }
  }, [scannedAddress]);

  const handleSend = () => {
    setShowSendModal(true);
  };

  const handleScan = () => {
    setShowQRScanner(true);
  };

  const handleWalletInfoPress = () => {
    setIsWalletModalVisible(true);
  };

  const handleUserInfoPress = () => {
    setShowProfileModal(true);
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

      {/* Send SOL Modal */}
      <SendSolModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
        initialRecipientAddress={scannedAddress || undefined}
      />

      {/* QR Scanner */}
      <QRScanner
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={(data) => {
          setScannedAddress(data);
          setShowQRScanner(false);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
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
