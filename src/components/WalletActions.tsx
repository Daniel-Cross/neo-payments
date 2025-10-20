import { View, StyleSheet } from 'react-native';
import { GradientButton } from './GradientButton';
import { ButtonVariant, ButtonSize } from '../constants/enums';

interface WalletActionsProps {
  onSendSol: () => void;
  onReceiveSol: () => void;
}

const WalletActions = ({ onSendSol, onReceiveSol }: WalletActionsProps) => {
  const styles = createStyles();

  return (
    <View style={styles.actionsContainer}>
      <GradientButton
        title="Send SOL"
        onPress={onSendSol}
        variant={ButtonVariant.PRIMARY}
        size={ButtonSize.LARGE}
        style={styles.actionButton}
      />
      <GradientButton
        title="Receive SOL"
        onPress={onReceiveSol}
        variant={ButtonVariant.PRIMARY}
        size={ButtonSize.LARGE}
        style={styles.actionButton}
      />
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    actionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
    },
    actionButton: {
      flex: 1,
    },
  });

export default WalletActions;
