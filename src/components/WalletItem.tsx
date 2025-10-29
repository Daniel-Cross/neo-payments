import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Wallet {
  id: string;
  name: string;
  publicKey: string;
  balance: number;
  createdAt: Date;
}

interface WalletItemProps {
  wallet: Wallet;
  isSelected: boolean;
  canDelete: boolean;
  onSelect: (walletId: string) => void;
  onDelete: (walletId: string, walletName: string) => void;
}

export default function WalletItem({
  wallet,
  isSelected,
  canDelete,
  onSelect,
  onDelete,
}: WalletItemProps) {
  const { theme } = useTheme();

  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 7)}...${key.slice(-7)}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.walletItem,
        {
          backgroundColor: theme.background.PURPLE_ACCENT,
          borderColor: isSelected
            ? theme.colors.ELECTRIC_BLUE
            : theme.background.PURPLE_LIGHTER,
        },
      ]}
      onPress={() => onSelect(wallet.id)}
      activeOpacity={0.7}
    >
      <View style={styles.walletItemContent}>
        <View style={styles.walletInfo}>
          <Typography
            variant={TypographyVariant.BODY_LARGE}
            color={theme.text.SOFT_WHITE}
          >
            {wallet.name}
          </Typography>
          <Typography
            variant={TypographyVariant.BODY_SMALL}
            color={theme.text.LIGHT_GREY}
          >
            {formatPublicKey(wallet.publicKey)}
          </Typography>
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.SOFT_WHITE}
            style={styles.balanceText}
          >
            {wallet.balance.toFixed(6)} SOL
          </Typography>
        </View>

        <View style={styles.walletActions}>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.colors.ELECTRIC_BLUE}
              />
            </View>
          )}

          {canDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete(wallet.id, wallet.name);
              }}
              style={styles.actionIcon}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={theme.text.ERROR_RED}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  balanceText: {
    marginTop: 4,
    fontWeight: "600",
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
});
