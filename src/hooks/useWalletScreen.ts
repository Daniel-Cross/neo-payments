import { useState, useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import {
  createWalletHandler,
  importWalletHandler,
  disconnectWalletHandler,
  exportPrivateKeyHandler,
  exportSeedPhraseHandler,
  testSecureStorageHandler,
  refreshBalanceHandler,
} from '../utils/walletHandlers';

export const useWalletScreen = () => {
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

  const [privateKeyInput, setPrivateKeyInput] = useState('');
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
        setPrivateKeyInput('');
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

  const handleRefreshBalance = () => {
    refreshBalanceHandler(updateBalance);
  };

  const toggleImportForm = () => {
    setShowImportForm(!showImportForm);
  };

  const closeImportForm = () => {
    setShowImportForm(false);
    setPrivateKeyInput('');
  };

  const openSendModal = () => {
    setShowSendModal(true);
  };

  const closeSendModal = () => {
    setShowSendModal(false);
  };

  return {
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
    handleTestSecureStorage,
    handleRefreshBalance,
    toggleImportForm,
    closeImportForm,
    openSendModal,
    closeSendModal,
  };
};
