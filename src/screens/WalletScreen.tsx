import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useWalletStore } from "../store/walletStore";
import { useTheme } from "../contexts/ThemeContext";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { formatWalletAddress } from "../utils/walletUtils";
import {
  createWalletHandler,
  importWalletHandler,
  disconnectWalletHandler,
  exportPrivateKeyHandler,
  exportSeedPhraseHandler,
  testSecureStorageHandler,
  refreshBalanceHandler,
} from "../utils/walletHandlers";
import SendSolModal from "../components/SendSolModal";
import {
  Typography,
  DisplaySmall,
  HeadlineSmall,
  BodyMedium,
  LabelMedium,
  Monospace,
} from "../components/Typography";
import {
  AlertMessage,
  ButtonText,
  ScreenTitle,
  PlaceholderText,
  LabelText,
  CardVariant,
  ButtonVariant,
  ButtonSize,
  TypographyVariant,
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
    disconnectWallet,
    updateBalance,
    exportPrivateKey,
    exportSeedPhrase,
    checkSecureStorage,
    testSecureStorage,
  } = useWalletStore();

  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [showImportForm, setShowImportForm] = useState(false);
  const [secureStorageAvailable, setSecureStorageAvailable] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);

  // Check secure storage availability on mount
  useEffect(() => {
    const initializeWallet = async () => {
      const isAvailable = await checkSecureStorage();
      setSecureStorageAvailable(isAvailable);
    };

    initializeWallet();
  }, [checkSecureStorage]);

  // Update balance when wallet is connected
  useEffect(() => {
    if (isConnected && keypair) {
      updateBalance();
    }
  }, [isConnected, keypair, updateBalance]);

  const handleCreateWallet = async () => {
    await createWalletHandler(createNewWallet, secureStorageAvailable);
  };

  const handleImportWallet = async () => {
    const success = await importWalletHandler(
      importWallet,
      privateKeyInput,
      secureStorageAvailable,
      () => {
        setPrivateKeyInput("");
        setShowImportForm(false);
      }
    );
  };

  const handleDisconnect = async () => {
    await disconnectWalletHandler(disconnectWallet);
  };

  const handleExportPrivateKey = async () => {
    await exportPrivateKeyHandler(exportPrivateKey);
  };

  const handleExportSeedPhrase = async () => {
    await exportSeedPhraseHandler(exportSeedPhrase);
  };

  const handleTestSecureStorage = async () => {
    await testSecureStorageHandler(testSecureStorage);
  };

  if (isConnected && keypair && publicKey) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container}>
        <View style={styles.header}>
          <DisplaySmall color={theme.text.SOFT_WHITE}>
            {ScreenTitle.MY_WALLET}
          </DisplaySmall>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Typography
              variant={TypographyVariant.TITLE_MEDIUM}
              color="#ff4444"
              weight="600"
            >
              {ButtonText.DISCONNECT}
            </Typography>
          </TouchableOpacity>
        </View>

        <GradientCard variant={CardVariant.ELEVATED} style={styles.walletCard}>
          <LabelMedium color={theme.text.LIGHT_GREY}>
            {LabelText.SOL_BALANCE}
          </LabelMedium>
          <Typography
            variant={TypographyVariant.DISPLAY_MEDIUM}
            color={theme.colors.ELECTRIC_BLUE}
            weight="700"
            style={styles.balanceAmount}
          >
            {balance.toFixed(4)} SOL
          </Typography>

          <View style={styles.addressContainer}>
            <LabelMedium color={theme.text.LIGHT_GREY}>
              {LabelText.WALLET_ADDRESS}
            </LabelMedium>
            <Monospace color={theme.text.SOFT_WHITE}>
              {formatWalletAddress(publicKey)}
            </Monospace>
          </View>

          <GradientButton
            title={ButtonText.REFRESH_BALANCE}
            onPress={() => refreshBalanceHandler(updateBalance)}
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MEDIUM}
            style={styles.refreshButton}
          />

          <View style={styles.exportButtonsContainer}>
            <GradientButton
              title="Export Private Key"
              onPress={handleExportPrivateKey}
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.MEDIUM}
              style={styles.exportButton}
            />
            <GradientButton
              title="Export Seed Phrase"
              onPress={handleExportSeedPhrase}
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.MEDIUM}
              style={styles.exportButton}
            />
          </View>
        </GradientCard>

        <View style={styles.actionsContainer}>
          <GradientButton
            title={ButtonText.SEND_SOL}
            onPress={() => setShowSendModal(true)}
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.LARGE}
            style={styles.actionButton}
          />
          <GradientButton
            title={ButtonText.RECEIVE_SOL}
            onPress={() => {
              /* TODO: Implement receive functionality */
            }}
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.LARGE}
            style={styles.actionButton}
          />
        </View>
        </ScrollView>
        
        {/* Send SOL Modal */}
        <SendSolModal
          visible={showSendModal}
          onClose={() => setShowSendModal(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DisplaySmall color={theme.text.SOFT_WHITE}>
          {ScreenTitle.CONNECT_WALLET}
        </DisplaySmall>
      </View>

      <GradientCard variant={CardVariant.ELEVATED} style={styles.welcomeCard}>
        <HeadlineSmall color={theme.text.SOFT_WHITE}>
          {ScreenTitle.WELCOME_TO_NEO}
        </HeadlineSmall>
        <BodyMedium color={theme.text.LIGHT_GREY}>
          {LabelText.WELCOME_SUBTITLE}
        </BodyMedium>
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
          style={!secureStorageAvailable ? styles.disabledButton : undefined}
        />
      </View>

      {showImportForm && (
        <GradientCard variant={CardVariant.OUTLINED} style={styles.importForm}>
          <LabelMedium color={theme.text.SOFT_WHITE}>
            {LabelText.ENTER_PRIVATE_KEY}
          </LabelMedium>
          <TextInput
            style={[
              styles.privateKeyInput,
              {
                backgroundColor: theme.background.PURPLE_ACCENT,
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
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.5)",
  },
  walletCard: {
    margin: 20,
  },
  balanceAmount: {
    marginBottom: 20,
  },
  addressContainer: {
    marginBottom: 20,
  },
  refreshButton: {
    marginBottom: 12,
  },
  exportButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    flex: 1,
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
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  importForm: {
    margin: 20,
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
