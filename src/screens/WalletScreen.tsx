import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useWalletStore } from "../store/walletStore";
import { useTheme } from "../contexts/ThemeContext";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import {
  AlertTitle,
  AlertMessage,
  ButtonText,
  ScreenTitle,
  PlaceholderText,
  LabelText,
  CardVariant,
  ButtonVariant,
  ButtonSize,
} from "../constants/enums";

export default function WalletScreen() {
  const { theme } = useTheme();
  const {
    keypair,
    publicKey,
    balance,
    isConnected,
    isLoading,
    createNewWallet,
    importWallet,
    loadWallet,
    disconnectWallet,
    updateBalance,
    exportPrivateKey,
    checkSecureStorage,
  } = useWalletStore();

  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [showImportForm, setShowImportForm] = useState(false);
  const [secureStorageAvailable, setSecureStorageAvailable] = useState(true);

  // Check secure storage availability and load wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      const isAvailable = await checkSecureStorage();
      setSecureStorageAvailable(isAvailable);

      if (isAvailable) {
        await loadWallet();
      }
    };

    initializeWallet();
  }, [checkSecureStorage, loadWallet]);

  // Update balance when wallet is connected
  useEffect(() => {
    if (isConnected && keypair) {
      updateBalance();
    }
  }, [isConnected, keypair, updateBalance]);

  const handleCreateWallet = async () => {
    if (!secureStorageAvailable) {
      Alert.alert(
        AlertTitle.SECURE_STORAGE_UNAVAILABLE,
        AlertMessage.SECURE_STORAGE_UNAVAILABLE_CREATE,
        [{ text: ButtonText.OK }]
      );
      return;
    }

    try {
      const success = await createNewWallet();
      if (success) {
        Alert.alert(
          AlertTitle.WALLET_CREATED,
          AlertMessage.WALLET_CREATED_SUCCESS,
          [{ text: ButtonText.OK }]
        );
      } else {
        Alert.alert(AlertTitle.ERROR, AlertMessage.CREATE_WALLET_ERROR);
      }
    } catch (error) {
      Alert.alert(AlertTitle.ERROR, AlertMessage.CREATE_WALLET_ERROR);
    }
  };

  const handleImportWallet = async () => {
    if (!privateKeyInput.trim()) {
      Alert.alert(AlertTitle.ERROR, AlertMessage.ENTER_PRIVATE_KEY);
      return;
    }

    if (!secureStorageAvailable) {
      Alert.alert(
        AlertTitle.SECURE_STORAGE_UNAVAILABLE,
        AlertMessage.SECURE_STORAGE_UNAVAILABLE_IMPORT,
        [{ text: ButtonText.OK }]
      );
      return;
    }

    try {
      const success = await importWallet(privateKeyInput.trim());
      if (success) {
        Alert.alert(
          AlertTitle.WALLET_IMPORTED,
          AlertMessage.WALLET_IMPORTED_SUCCESS
        );
        setPrivateKeyInput("");
        setShowImportForm(false);
      } else {
        Alert.alert(AlertTitle.ERROR, AlertMessage.INVALID_PRIVATE_KEY);
      }
    } catch (error) {
      Alert.alert(AlertTitle.ERROR, AlertMessage.IMPORT_WALLET_ERROR);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      AlertTitle.DISCONNECT_WALLET,
      AlertMessage.DISCONNECT_CONFIRMATION,
      [
        { text: ButtonText.CANCEL, style: "cancel" },
        {
          text: ButtonText.DISCONNECT,
          style: "destructive",
          onPress: disconnectWallet,
        },
      ]
    );
  };

  const handleExportPrivateKey = async () => {
    try {
      const privateKey = await exportPrivateKey();
      if (privateKey) {
        Alert.alert(
          AlertTitle.PRIVATE_KEY,
          `Your private key: ${privateKey}\n\n⚠️ ${AlertMessage.PRIVATE_KEY_WARNING}`,
          [
            {
              text: ButtonText.COPY,
              onPress: () => {
                /* TODO: Implement copy to clipboard */
              },
            },
            { text: ButtonText.OK },
          ]
        );
      } else {
        Alert.alert(AlertTitle.ERROR, AlertMessage.EXPORT_PRIVATE_KEY_ERROR);
      }
    } catch (error) {
      Alert.alert(AlertTitle.ERROR, AlertMessage.EXPORT_PRIVATE_KEY_ERROR);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (isConnected && keypair && publicKey) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
            {ScreenTitle.MY_WALLET}
          </Text>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Text style={styles.disconnectText}>{ButtonText.DISCONNECT}</Text>
          </TouchableOpacity>
        </View>

        <GradientCard variant={CardVariant.ELEVATED} style={styles.walletCard}>
          <Text style={[styles.balanceLabel, { color: theme.text.LIGHT_GREY }]}>
            {LabelText.SOL_BALANCE}
          </Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: theme.colors.PRIMARY_GREEN },
            ]}
          >
            {balance.toFixed(4)} SOL
          </Text>

          <View style={styles.addressContainer}>
            <Text
              style={[styles.addressLabel, { color: theme.text.LIGHT_GREY }]}
            >
              {LabelText.WALLET_ADDRESS}
            </Text>
            <Text
              style={[styles.addressText, { color: theme.text.SOFT_WHITE }]}
            >
              {formatAddress(publicKey)}
            </Text>
          </View>

          <GradientButton
            title={ButtonText.REFRESH_BALANCE}
            onPress={updateBalance}
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MEDIUM}
            style={styles.refreshButton}
          />

          <GradientButton
            title={ButtonText.EXPORT_PRIVATE_KEY}
            onPress={handleExportPrivateKey}
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MEDIUM}
            style={styles.exportButton}
          />
        </GradientCard>

        <View style={styles.actionsContainer}>
          <GradientButton
            title={ButtonText.SEND_SOL}
            onPress={() => {
              /* TODO: Navigate to send screen */
            }}
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.LARGE}
            style={styles.actionButton}
          />
          <GradientButton
            title={ButtonText.RECEIVE_SOL}
            onPress={() => {
              /* TODO: Navigate to receive screen */
            }}
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.LARGE}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
          {ScreenTitle.CONNECT_WALLET}
        </Text>
      </View>

      <GradientCard variant={CardVariant.ELEVATED} style={styles.welcomeCard}>
        <Text style={[styles.welcomeTitle, { color: theme.text.SOFT_WHITE }]}>
          {ScreenTitle.WELCOME_TO_BLINK}
        </Text>
        <Text
          style={[styles.welcomeSubtitle, { color: theme.text.LIGHT_GREY }]}
        >
          {LabelText.WELCOME_SUBTITLE}
        </Text>
      </GradientCard>

      <View style={styles.optionsContainer}>
        <GradientButton
          title={
            secureStorageAvailable
              ? ButtonText.CREATE_NEW_WALLET
              : ButtonText.SECURE_STORAGE_UNAVAILABLE
          }
          onPress={handleCreateWallet}
          variant={ButtonVariant.PRIMARY}
          size={ButtonSize.LARGE}
          disabled={isLoading || !secureStorageAvailable}
          loading={isLoading}
          style={styles.optionButton}
        />

        <GradientButton
          title={
            secureStorageAvailable
              ? ButtonText.IMPORT_EXISTING_WALLET
              : ButtonText.IMPORT_UNAVAILABLE
          }
          onPress={() => setShowImportForm(!showImportForm)}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
          disabled={!secureStorageAvailable}
          style={
            !secureStorageAvailable
              ? [styles.optionButton, styles.disabledButton]
              : styles.optionButton
          }
        />
      </View>

      {showImportForm && (
        <GradientCard variant={CardVariant.OUTLINED} style={styles.importForm}>
          <Text style={[styles.importLabel, { color: theme.text.SOFT_WHITE }]}>
            {LabelText.ENTER_PRIVATE_KEY}
          </Text>
          <TextInput
            style={[
              styles.privateKeyInput,
              {
                backgroundColor: theme.background.DARK_GREY,
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: theme.text.SOFT_WHITE,
              },
            ]}
            value={privateKeyInput}
            onChangeText={setPrivateKeyInput}
            placeholder={PlaceholderText.PRIVATE_KEY_INPUT}
            placeholderTextColor={theme.text.LIGHT_GREY}
            multiline
            secureTextEntry
          />
          <View style={styles.importActions}>
            <GradientButton
              title={ButtonText.CANCEL}
              onPress={() => {
                setShowImportForm(false);
                setPrivateKeyInput("");
              }}
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.MEDIUM}
              style={styles.importActionButton}
            />
            <GradientButton
              title={ButtonText.IMPORT}
              onPress={handleImportWallet}
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.MEDIUM}
              disabled={isLoading || !secureStorageAvailable}
              loading={isLoading}
              style={styles.importActionButton}
            />
          </View>
        </GradientCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.5)",
  },
  disconnectText: {
    color: "#ff4444",
    fontWeight: "600",
  },
  walletCard: {
    margin: 20,
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    fontFamily: "monospace",
  },
  refreshButton: {
    marginBottom: 12,
  },
  exportButton: {
    // Styles handled by GradientButton
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  welcomeCard: {
    margin: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  optionButton: {
    // Styles handled by GradientButton
  },
  disabledButton: {
    opacity: 0.5,
  },
  importForm: {
    margin: 20,
  },
  importLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  privateKeyInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "monospace",
    minHeight: 80,
    textAlignVertical: "top",
  },
  importActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  importActionButton: {
    flex: 1,
  },
});
