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
import TransactionResultScreen, { TransactionStatus } from "./TransactionResultScreen";
import TransactionConfirmationScreen from "./TransactionConfirmationScreen";
import { transactionService, TransferParams } from "../services/transactionService";
import { PublicKey } from "@solana/web3.js";

const WalletContent = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
    publicKey,
    balance,
    fiatValue,
    selectedCurrency,
    selectedWallet,
  } = useWalletStore();

  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  
  // Transaction confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    amount: number;
    recipient: string;
    memo?: string;
    inputMode: string;
    estimatedFee: number;
    totalCost: number;
    selectedCurrency: string;
  } | null>(null);

  // Transaction result state
  const [showTransactionResult, setShowTransactionResult] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(TransactionStatus.PENDING);
  const [transactionSignature, setTransactionSignature] = useState<string | undefined>();
  const [transactionError, setTransactionError] = useState<string | undefined>();
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [transactionRecipient, setTransactionRecipient] = useState<string>("");

  // When a QR code is scanned, open the send modal with the address
  useEffect(() => {
    if (scannedAddress) {
      setShowSendModal(true);
      // Don't reset scannedAddress immediately - let the modal use it first
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

  // Transaction result handlers
  const handleTransactionResultClose = () => {
    setShowTransactionResult(false);
    setTransactionStatus(TransactionStatus.PENDING);
    setTransactionSignature(undefined);
    setTransactionError(undefined);
    setTransactionAmount(0);
    setTransactionRecipient("");
  };

  const handleTransactionRetry = () => {
    setShowTransactionResult(false);
    setShowSendModal(true);
  };

  // Function to start transaction result flow
  const startTransactionResult = (
    status: TransactionStatus,
    amount: number,
    recipient: string,
    signature?: string,
    error?: string
  ) => {
    setTransactionStatus(status);
    setTransactionAmount(amount);
    setTransactionRecipient(recipient);
    setTransactionSignature(signature);
    setTransactionError(error);
    setShowTransactionResult(true);
  };

  // Function to execute transaction
  const executeTransaction = async (transactionData: {
    amount: number;
    recipient: string;
    memo?: string;
    inputMode: string;
  }) => {
    if (!selectedWallet) return;

    try {
      // Convert amount to SOL if input was in currency
      let solAmount = transactionData.amount;
      if (transactionData.inputMode === 'currency') {
        const { solPrice } = useWalletStore.getState();
        solAmount = transactionData.amount / solPrice;
      }

      // Encrypt memo if provided
      let encryptedMemo: string | undefined;
      if (transactionData.memo && transactionData.memo.trim()) {
        try {
          encryptedMemo = await transactionService.encryptMemoForRecipient(
            transactionData.memo.trim(),
            transactionData.recipient
          );
        } catch (error) {
          console.error('Failed to encrypt memo:', error);
          encryptedMemo = transactionData.memo.trim(); // Fallback to plain text
        }
      }

      const transferParams: TransferParams = {
        from: new PublicKey(selectedWallet.publicKey),
        to: new PublicKey(transactionData.recipient),
        amount: solAmount, // Use converted SOL amount
        memo: encryptedMemo,
      };

      // Execute the transaction
      const result = await transactionService.transferSOL(
        transferParams,
        selectedWallet.keypair,
        true // Use versioned transaction for better performance
      );

      if (result.success && result.signature) {
        // Update to success state
        setTransactionStatus(TransactionStatus.SUCCESS);
        setTransactionSignature(result.signature);
        setTransactionError(undefined);
        
        // Balance will be updated via webhook/subscription
      } else {
        // Update to failed state
        setTransactionStatus(TransactionStatus.FAILED);
        setTransactionError(result.error || 'Transaction failed');
        setTransactionSignature(undefined);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      // Update to failed state
      setTransactionStatus(TransactionStatus.FAILED);
      setTransactionError(error instanceof Error ? error.message : 'Transaction failed');
      setTransactionSignature(undefined);
    }
  };

  // Handle transaction confirmation from SendSolModal
  const handleTransactionConfirm = (transactionData: {
    amount: number; // Original amount (USD or SOL)
    recipient: string;
    memo?: string;
    inputMode: string;
    estimatedFee: number;
    totalCost: number;
    selectedCurrency: string;
  }) => {
    // Store confirmation data and show confirmation screen
    setConfirmationData(transactionData);
    setShowConfirmation(true);
  };

  // Handle confirmation screen actions
  const handleConfirmTransaction = async () => {
    if (!confirmationData) return;
    
    setShowConfirmation(false);
    
    // Start with pending state
    startTransactionResult(TransactionStatus.PENDING, confirmationData.amount, confirmationData.recipient);
    
    // Execute the transaction
    await executeTransaction(confirmationData);
    
    // Clear confirmation data
    setConfirmationData(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  // If transaction result is showing, only show that screen
  if (showTransactionResult) {
    return (
      <TransactionResultScreen
        visible={showTransactionResult}
        status={transactionStatus}
        amount={transactionAmount}
        recipientAddress={transactionRecipient}
        transactionSignature={transactionSignature}
        errorMessage={transactionError}
        onClose={handleTransactionResultClose}
        onRetry={transactionStatus === TransactionStatus.FAILED ? handleTransactionRetry : undefined}
      />
    );
  }

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
        onClose={() => {
          setShowSendModal(false);
          setScannedAddress(null); // Reset scanned address when modal closes
        }}
        initialRecipientAddress={scannedAddress || undefined}
        onTransactionConfirm={handleTransactionConfirm}
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

      {/* Transaction Confirmation Screen */}
      {confirmationData && (
        <TransactionConfirmationScreen
          visible={showConfirmation}
          amount={confirmationData.amount}
          recipientAddress={confirmationData.recipient}
          estimatedFee={confirmationData.estimatedFee}
          totalCost={confirmationData.totalCost}
          selectedCurrency={confirmationData.selectedCurrency}
          inputMode={confirmationData.inputMode}
          onConfirm={handleConfirmTransaction}
          onCancel={handleCancelConfirmation}
        />
      )}
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
