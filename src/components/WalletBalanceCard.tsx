import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientCard } from './GradientCard';
import { GradientButton } from './GradientButton';
import { Typography } from './Typography';
import { formatWalletAddress } from '../utils/walletUtils';
import { 
  CardVariant, 
  ButtonVariant, 
  ButtonSize, 
  TypographyVariant 
} from '../constants/enums';

interface WalletBalanceCardProps {
  balance: number;
  publicKey: string;
  onRefreshBalance: () => void;
  onExportPrivateKey: () => void;
  onExportSeedPhrase: () => void;
}

const WalletBalanceCard = ({
  balance,
  publicKey,
  onRefreshBalance,
  onExportPrivateKey,
  onExportSeedPhrase,
}: WalletBalanceCardProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <GradientCard variant={CardVariant.ELEVATED} style={styles.walletCard}>
      <Typography
        variant={TypographyVariant.LABEL_MEDIUM}
        color={theme.text.LIGHT_GREY}
      >
        SOL Balance
      </Typography>
      
      <Typography
        variant={TypographyVariant.DISPLAY_MEDIUM}
        color={theme.colors.ELECTRIC_BLUE}
        weight="700"
        style={styles.balanceAmount}
      >
        {balance.toFixed(4)} SOL
      </Typography>

      <View style={styles.addressContainer}>
        <Typography
          variant={TypographyVariant.LABEL_MEDIUM}
          color={theme.text.LIGHT_GREY}
        >
          Wallet Address
        </Typography>
        <Typography
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.SOFT_WHITE}
          style={styles.monospace}
        >
          {formatWalletAddress(publicKey)}
        </Typography>
      </View>

      <GradientButton
        title="Refresh Balance"
        onPress={onRefreshBalance}
        variant={ButtonVariant.SECONDARY}
        size={ButtonSize.MEDIUM}
        style={styles.refreshButton}
      />

      <View style={styles.exportButtonsContainer}>
        <GradientButton
          title="Export Private Key"
          onPress={onExportPrivateKey}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.MEDIUM}
          style={styles.exportButton}
        />
        <GradientButton
          title="Export Seed Phrase"
          onPress={onExportSeedPhrase}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.MEDIUM}
          style={styles.exportButton}
        />
      </View>
    </GradientCard>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    walletCard: {
      margin: 20,
    },
    balanceAmount: {
      marginBottom: 20,
    },
    addressContainer: {
      marginBottom: 20,
    },
    monospace: {
      fontFamily: 'monospace',
    },
    refreshButton: {
      marginBottom: 12,
    },
    exportButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    exportButton: {
      flex: 1,
    },
  });

export default WalletBalanceCard;
