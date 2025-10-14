import { View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Wallet {
  id: string;
  name: string;
  publicKey: string;
  balance: number;
  createdAt: Date;
}

interface CurrentWalletSectionProps {
  selectedWallet: Wallet | null;
  isEditingName: boolean;
  newWalletName: string;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onRenameWallet: () => void;
  onCopyAddress: () => void;
  onViewPrivateKey: () => void;
  onViewSeedPhrase: () => void;
  onNameChange: (name: string) => void;
}

export default function CurrentWalletSection({
  selectedWallet,
  isEditingName,
  newWalletName,
  onStartEditing,
  onCancelEditing,
  onRenameWallet,
  onCopyAddress,
  onViewPrivateKey,
  onViewSeedPhrase,
  onNameChange,
}: CurrentWalletSectionProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!selectedWallet) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Typography
        variant={TypographyVariant.TITLE_MEDIUM}
        color={theme.text.SOFT_WHITE}
        style={styles.sectionTitle}
      >
        Current Wallet
      </Typography>

      {/* Wallet Name */}
      <View style={styles.walletNameContainer}>
        {isEditingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={[
                styles.nameInput,
                {
                  color: theme.text.SOFT_WHITE,
                  borderColor: theme.text.LIGHT_GREY,
                },
              ]}
              value={newWalletName}
              onChangeText={onNameChange}
              placeholder="Enter wallet name"
              placeholderTextColor={theme.text.LIGHT_GREY}
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                onPress={onCancelEditing}
                style={styles.editButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={theme.text.LIGHT_GREY}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onRenameWallet}
                style={styles.editButton}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={theme.text.SOFT_WHITE}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onStartEditing}
            style={styles.nameDisplayContainer}
          >
            <Typography
              variant={TypographyVariant.TITLE_MEDIUM}
              color={theme.text.SOFT_WHITE}
            >
              {selectedWallet.name}
            </Typography>
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color={theme.text.LIGHT_GREY}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Wallet Address */}
      <TouchableOpacity onPress={onCopyAddress} style={styles.addressContainer}>
        <Typography
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.LIGHT_GREY}
          style={styles.addressText}
        >
          {selectedWallet.publicKey}
        </Typography>
        <MaterialCommunityIcons
          name="content-copy"
          size={16}
          color={theme.text.LIGHT_GREY}
        />
      </TouchableOpacity>

      {/* Secret Management Buttons */}
      <View style={styles.secretButtonsContainer}>
        <GradientButton
          title="View Private Key"
          onPress={onViewPrivateKey}
          variant={ButtonVariant.SECONDARY}
          style={styles.secretButton}
          icon={
            <MaterialCommunityIcons
              name="key"
              size={20}
              color={theme.text.SOFT_WHITE}
            />
          }
        />
        <GradientButton
          title="View Seed Phrase"
          onPress={onViewSeedPhrase}
          variant={ButtonVariant.SECONDARY}
          style={styles.secretButton}
          icon={
            <MaterialCommunityIcons
              name="text-box-outline"
              size={20}
              color={theme.text.SOFT_WHITE}
            />
          }
        />
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      marginBottom: 16,
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
  });
