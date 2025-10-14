import { useState } from "react";
import { useWalletStore } from "../store/walletStore";
import * as Clipboard from "expo-clipboard";

export const useWalletManagement = () => {
  const {
    wallets,
    selectedWallet,
    selectedWalletId,
    selectWallet,
    renameWallet,
    deleteWallet,
    createNewWallet,
    importWallet,
    exportPrivateKey,
    exportSeedPhrase,
  } = useWalletStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretType, setSecretType] = useState<
    "privateKey" | "seedPhrase" | null
  >(null);
  const [secretValue, setSecretValue] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);

  // Wallet name editing
  const handleStartEditing = () => {
    setNewWalletName(selectedWallet?.name || "");
    setIsEditingName(true);
  };

  const handleCancelEditing = () => {
    setIsEditingName(false);
    setNewWalletName("");
  };

  const handleRenameWallet = async () => {
    if (!selectedWalletId || !newWalletName.trim()) return;

    const success = await renameWallet(selectedWalletId, newWalletName.trim());
    if (success) {
      setIsEditingName(false);
      setNewWalletName("");
    }
  };

  // Wallet operations
  const handleCopyAddress = async () => {
    if (selectedWallet?.publicKey) {
      await Clipboard.setStringAsync(selectedWallet.publicKey);
    }
  };

  const handleSelectWallet = (walletId: string) => {
    selectWallet(walletId);
  };

  const handleCreateNewWallet = async () => {
    await createNewWallet();
  };

  const handleImportWallet = async () => {
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
  };

  // Delete operations
  const handleDeleteWallet = (walletId: string, walletName: string) => {
    if (wallets.length <= 1) {
      return;
    }

    setWalletToDelete({ id: walletId, name: walletName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWallet = async () => {
    if (!walletToDelete) return;

    await deleteWallet(walletToDelete.id);
    setShowDeleteConfirm(false);
    setWalletToDelete(null);
  };

  const cancelDeleteWallet = () => {
    setShowDeleteConfirm(false);
    setWalletToDelete(null);
  };

  // Secret operations
  const handleViewPrivateKey = async () => {
    const privateKey = await exportPrivateKey();
    if (privateKey) {
      setSecretType("privateKey");
      setSecretValue(privateKey);
      setShowSecretModal(true);
    }
  };

  const handleViewSeedPhrase = async () => {
    const seedPhrase = await exportSeedPhrase();
    if (seedPhrase) {
      setSecretType("seedPhrase");
      setSecretValue(seedPhrase);
      setShowSecretModal(true);
    }
  };

  const handleCopySecret = async () => {
    await Clipboard.setStringAsync(secretValue);
  };

  const closeSecretModal = () => {
    setShowSecretModal(false);
    setSecretType(null);
    setSecretValue("");
  };

  return {
    // State
    wallets,
    selectedWallet,
    selectedWalletId,
    isEditingName,
    newWalletName,
    showDeleteConfirm,
    walletToDelete,
    showSecretModal,
    secretType,
    secretValue,
    showImportModal,

    // Setters
    setNewWalletName,

    // Actions
    handleStartEditing,
    handleCancelEditing,
    handleRenameWallet,
    handleCopyAddress,
    handleSelectWallet,
    handleCreateNewWallet,
    handleImportWallet,
    closeImportModal,
    handleDeleteWallet,
    confirmDeleteWallet,
    cancelDeleteWallet,
    handleViewPrivateKey,
    handleViewSeedPhrase,
    handleCopySecret,
    closeSecretModal,
  };
};
