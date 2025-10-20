import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientCard } from './GradientCard';
import { GradientButton } from './GradientButton';
import { Typography } from './Typography';
import { 
  CardVariant, 
  ButtonVariant, 
  ButtonSize, 
  TypographyVariant 
} from '../constants/enums';

interface WelcomeSectionProps {
  onCreateWallet: () => void;
  onImportWallet: () => void;
  secureStorageAvailable: boolean;
  isLoading: boolean;
}

const WelcomeSection = ({
  onCreateWallet,
  onImportWallet,
  secureStorageAvailable,
  isLoading,
}: WelcomeSectionProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      <GradientCard variant={CardVariant.ELEVATED} style={styles.welcomeCard}>
        <Typography
          variant={TypographyVariant.HEADLINE_SMALL}
          color={theme.text.SOFT_WHITE}
        >
          Welcome to Neo Payments
        </Typography>
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_GREY}
        >
          Your secure Solana wallet for seamless payments and transactions
        </Typography>
      </GradientCard>

      <View style={styles.optionsContainer}>
        <GradientButton
          title={
            secureStorageAvailable
              ? 'Create New Wallet'
              : 'Secure Storage Unavailable'
          }
          onPress={onCreateWallet}
          variant={ButtonVariant.PRIMARY}
          size={ButtonSize.LARGE}
          disabled={isLoading || !secureStorageAvailable}
          loading={isLoading}
        />

        <GradientButton
          title={
            secureStorageAvailable
              ? 'Import Existing Wallet'
              : 'Import Unavailable'
          }
          onPress={onImportWallet}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
          disabled={!secureStorageAvailable}
          style={!secureStorageAvailable ? styles.disabledButton : undefined}
        />
      </View>
    </>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
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
  });

export default WelcomeSection;
