import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";
import { EDGE_MARGIN, BASE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface WalletInfoCardProps {
  walletName: string;
  publicKey: string;
  balance: number;
  fiatValue: number;
  currency: string;
  onPress: () => void;
}

export default function WalletInfoCard({
  walletName,
  publicKey,
  balance,
  fiatValue,
  currency,
  onPress,
}: WalletInfoCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 7)}...${key.slice(-7)}`;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      ZAR: "R",
    };
    return symbols[currency] || currency + " ";
  };

  return (
    <TouchableOpacity
      style={styles.walletInfo}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.walletInfoHeader}>
        <Typography
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.LIGHT_GREY}
        >
          {walletName}
        </Typography>
        <MaterialCommunityIcons
          name="chevron-down"
          size={16}
          color={theme.text.LIGHT_GREY}
        />
      </View>
      <Typography
        variant={TypographyVariant.BODY_MEDIUM}
        color={theme.text.SOFT_WHITE}
      >
        {formatPublicKey(publicKey)}
      </Typography>
      <Typography
        variant={TypographyVariant.HEADLINE_MEDIUM}
        color={theme.text.SOFT_WHITE}
      >
        {balance.toFixed(4)} SOL
      </Typography>
      <Typography
        variant={TypographyVariant.BODY_MEDIUM}
        color={theme.text.LIGHT_GREY}
      >
        {getCurrencySymbol(currency)}
        {fiatValue.toFixed(2)} {currency}
      </Typography>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    walletInfo: {
      flex: 1,
      padding: EDGE_MARGIN,
      borderRadius: BASE_MARGIN,
      backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
      borderWidth: 1,
      borderColor: theme.colors.NEON_PINK,
      minHeight: 120,
    },
    walletInfoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
  });
