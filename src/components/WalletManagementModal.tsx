import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { GradientButton } from "./GradientButton";
import { EDGE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useWalletManagement } from "../hooks/useWalletManagement";
import { useWalletStore } from "../store/walletStore";
import WalletItem from "./WalletItem";
import CurrentWalletSection from "./CurrentWalletSection";
import ImportWalletModal from "./ImportWalletModal";
import CloseButton from "./CloseButton";

interface WalletManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WalletManagementModal({
  visible,
  onClose,
}: WalletManagementModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { updateAllBalances } = useWalletStore();
  const [isUpdatingBalances, setIsUpdatingBalances] = useState(false);
  const {
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
    setNewWalletName,
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
  } = useWalletManagement();

  // Update all wallet balances when modal opens
  useEffect(() => {
    if (visible) {
      setIsUpdatingBalances(true);
      // Start updating balances immediately when modal opens
      updateAllBalances().finally(() => {
        setIsUpdatingBalances(false);
      });
    }
  }, [visible, updateAllBalances]);


  const renderWalletItem = ({
    item: wallet,
  }: {
    item: (typeof wallets)[0];
  }) => (
    <WalletItem
      wallet={wallet}
      isSelected={wallet.id === selectedWalletId}
      canDelete={wallets.length > 1}
      onSelect={handleSelectWallet}
      onDelete={handleDeleteWallet}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.DARK_PURPLE },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography
            variant={TypographyVariant.HEADLINE_SMALL}
            color={theme.text.SOFT_WHITE}
          >
            Wallet Management
          </Typography>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={async () => {
                setIsUpdatingBalances(true);
                await updateAllBalances();
                setIsUpdatingBalances(false);
              }}
              style={styles.refreshButton}
              disabled={isUpdatingBalances}
            >
              {isUpdatingBalances ? (
                <ActivityIndicator size="small" color={theme.text.SOFT_WHITE} />
              ) : (
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color={theme.text.SOFT_WHITE}
                />
              )}
            </TouchableOpacity>
            <CloseButton onPress={onClose} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Current Wallet Section */}
          <CurrentWalletSection
            selectedWallet={selectedWallet}
            isEditingName={isEditingName}
            newWalletName={newWalletName}
            onStartEditing={handleStartEditing}
            onCancelEditing={handleCancelEditing}
            onRenameWallet={handleRenameWallet}
            onCopyAddress={handleCopyAddress}
            onViewPrivateKey={handleViewPrivateKey}
            onViewSeedPhrase={handleViewSeedPhrase}
            onNameChange={setNewWalletName}
          />

          {/* All Wallets Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Typography
                variant={TypographyVariant.TITLE_MEDIUM}
                color={theme.text.SOFT_WHITE}
                style={styles.sectionTitle}
              >
                All Wallets ({wallets.length})
              </Typography>
              {isUpdatingBalances && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.text.LIGHT_GREY} />
                  <Typography
                    variant={TypographyVariant.BODY_SMALL}
                    color={theme.text.LIGHT_GREY}
                    style={styles.loadingText}
                  >
                    Updating balances...
                  </Typography>
                </View>
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleImportWallet}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons
                  name="download"
                  size={20}
                  color={theme.text.SOFT_WHITE}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateNewWallet}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color={theme.text.SOFT_WHITE}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallets FlatList */}
          <FlatList
            data={wallets}
            renderItem={renderWalletItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            style={styles.flatList}
          />
        </View>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && walletToDelete && (
          <View style={styles.overlay}>
            <View
              style={[
                styles.confirmationModal,
                { backgroundColor: theme.background.PURPLE_ACCENT },
              ]}
            >
              <Typography
                variant={TypographyVariant.TITLE_MEDIUM}
                color={theme.text.SOFT_WHITE}
                style={styles.confirmationTitle}
              >
                Delete Wallet
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.LIGHT_GREY}
                style={styles.confirmationMessage}
              >
                Are you sure you want to delete "{walletToDelete.name}"? This
                action cannot be undone.
              </Typography>
              <View style={styles.confirmationButtons}>
                <GradientButton
                  title="Cancel"
                  onPress={cancelDeleteWallet}
                  variant={ButtonVariant.SECONDARY}
                  style={styles.confirmationButton}
                />
                <GradientButton
                  title="Delete"
                  onPress={confirmDeleteWallet}
                  variant={ButtonVariant.PRIMARY}
                  style={styles.confirmationButton}
                />
              </View>
            </View>
          </View>
        )}

        {/* Secret Display Overlay */}
        {showSecretModal && secretType && secretValue && (
          <View style={styles.overlay}>
            <View
              style={[
                styles.secretModal,
                { backgroundColor: theme.background.PURPLE_ACCENT },
              ]}
            >
              <View style={styles.secretModalHeader}>
                <Typography
                  variant={TypographyVariant.TITLE_MEDIUM}
                  color={theme.text.SOFT_WHITE}
                  style={styles.secretModalTitle}
                >
                  {secretType === "privateKey" ? "Private Key" : "Seed Phrase"}
                </Typography>
                <TouchableOpacity
                  onPress={closeSecretModal}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.text.SOFT_WHITE}
                  />
                </TouchableOpacity>
              </View>

              <Typography
                variant={TypographyVariant.BODY_SMALL}
                color={theme.text.LIGHT_GREY}
                style={styles.secretWarning}
              >
                {secretType === "privateKey"
                  ? "Keep your private key secure and never share it with anyone."
                  : "Write down your seed phrase and store it in a safe place. Anyone with this phrase can access your wallet."}
              </Typography>

              <TouchableOpacity
                onPress={handleCopySecret}
                style={styles.secretContainer}
              >
                <Typography
                  variant={TypographyVariant.BODY_SMALL}
                  color={theme.text.SOFT_WHITE}
                  style={styles.secretText}
                >
                  {secretValue}
                </Typography>
                <MaterialCommunityIcons
                  name="content-copy"
                  size={20}
                  color={theme.text.LIGHT_GREY}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Import Wallet Modal */}
        <ImportWalletModal
          visible={showImportModal}
          onClose={closeImportModal}
        />

      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: EDGE_MARGIN,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    refreshButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    content: {
      flex: 1,
      paddingHorizontal: EDGE_MARGIN,
    },
    flatList: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitleContainer: {
      flex: 1,
    },
    sectionTitle: {
      marginBottom: 4,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    loadingText: {
      fontSize: 12,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    flatListContent: {
      paddingBottom: 20,
    },
    walletNameContainer: {
      marginBottom: 16,
    },
    editNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    nameInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
    },
    editButtons: {
      flexDirection: "row",
      gap: 8,
    },
    editButton: {
      padding: 8,
    },
    nameDisplayContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
    },
    addressText: {
      flex: 1,
      fontFamily: "monospace",
    },
    secretButtonsContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    secretButton: {
      flex: 1,
    },
    walletItem: {
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
      padding: 16,
    },
    walletItemContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    walletInfo: {
      flex: 1,
    },
    walletActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    actionIcon: {
      padding: 4,
    },
    selectedIndicator: {
      padding: 4,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: EDGE_MARGIN,
    },
    confirmationModal: {
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 400,
    },
    confirmationTitle: {
      marginBottom: 12,
      textAlign: "center",
    },
    confirmationMessage: {
      marginBottom: 24,
      textAlign: "center",
      lineHeight: 20,
    },
    confirmationButtons: {
      flexDirection: "row",
      gap: 12,
    },
    confirmationButton: {
      flex: 1,
    },
    secretModal: {
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 400,
      maxHeight: "80%",
    },
    secretModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    secretModalTitle: {
      flex: 1,
    },
    secretWarning: {
      marginBottom: 20,
      textAlign: "center",
      lineHeight: 18,
      fontStyle: "italic",
    },
    secretContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    secretText: {
      flex: 1,
      fontFamily: "monospace",
      lineHeight: 20,
    },
    copySecretButton: {
      marginTop: 8,
    },
    closeButton: {
      padding: 8,
    },
  });
