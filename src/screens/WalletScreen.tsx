import { View, StyleSheet, ScrollView } from "react-native";
import { useWalletScreen } from "../hooks/useWalletScreen";
import SendSolModal from "../components/SendSolModal";
import WalletHeader from "../components/WalletHeader";
import WalletBalanceCard from "../components/WalletBalanceCard";
import WalletActions from "../components/WalletActions";
import WelcomeSection from "../components/WelcomeSection";
import ImportWalletForm from "../components/ImportWalletForm";
import { ScreenTitle } from "../constants/enums";

export default function WalletScreen() {
  const {
    // State
    privateKeyInput,
    setPrivateKeyInput,
    showImportForm,
    secureStorageAvailable,
    showSendModal,
    isConnected,
    isLoading,
    keypair,
    publicKey,
    balance,

    // Handlers
    handleCreateWallet,
    handleImportWallet,
    handleDisconnect,
    handleExportPrivateKey,
    handleExportSeedPhrase,
    handleRefreshBalance,
    toggleImportForm,
    closeImportForm,
    openSendModal,
    closeSendModal,
  } = useWalletScreen();

  if (isConnected && keypair && publicKey) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container}>
          <WalletHeader
            title={ScreenTitle.MY_WALLET}
            showDisconnect={true}
            onDisconnect={handleDisconnect}
          />

          <WalletBalanceCard
            balance={balance}
            publicKey={publicKey}
            onRefreshBalance={handleRefreshBalance}
            onExportPrivateKey={handleExportPrivateKey}
            onExportSeedPhrase={handleExportSeedPhrase}
          />

          <WalletActions
            onSendSol={openSendModal}
            onReceiveSol={() => {
              /* TODO: Implement receive functionality */
            }}
          />
        </ScrollView>
        
        {/* Send SOL Modal */}
        <SendSolModal
          visible={showSendModal}
          onClose={closeSendModal}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WalletHeader title={ScreenTitle.CONNECT_WALLET} />

      <WelcomeSection
        onCreateWallet={handleCreateWallet}
        onImportWallet={toggleImportForm}
        secureStorageAvailable={secureStorageAvailable}
        isLoading={isLoading}
      />

      {showImportForm && (
        <ImportWalletForm
          privateKeyInput={privateKeyInput}
          onPrivateKeyChange={setPrivateKeyInput}
          onImport={handleImportWallet}
          onCancel={closeImportForm}
          isLoading={isLoading}
          secureStorageAvailable={secureStorageAvailable}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
