import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientBackground } from './GradientBackground';
import { GradientButton } from './GradientButton';
import { GradientCard } from './GradientCard';
import { Typography } from './Typography';
import CloseButton from './CloseButton';
import { GradientType, ButtonVariant, TypographyVariant, CardVariant } from '../constants/enums';
import { EDGE_MARGIN } from '../constants/styles';

interface TransactionConfirmationScreenProps {
  visible: boolean;
  amount: number;
  recipientAddress: string;
  estimatedFee: number;
  totalCost: number;
  selectedCurrency: string;
  inputMode: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TransactionConfirmationScreen({
  visible,
  amount,
  recipientAddress,
  estimatedFee,
  totalCost,
  selectedCurrency,
  inputMode,
  onConfirm,
  onCancel,
}: TransactionConfirmationScreenProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getAmountDisplay = () => {
    if (inputMode === 'currency') {
      return `${amount.toFixed(2)} ${selectedCurrency}`;
    } else {
      return `${amount.toFixed(6)} SOL`;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <GradientBackground gradient={GradientType.PRIMARY} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <CloseButton onPress={onCancel} />
          <Typography
            variant={TypographyVariant.TITLE_LARGE}
            color={theme.text.SOFT_WHITE}
            weight="600"
          >
            Confirm Transaction
          </Typography>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>
            {/* Amount */}
            <View style={styles.section}>
              <Typography
                variant={TypographyVariant.LABEL_MEDIUM}
                color={theme.text.LIGHT_GREY}
                weight="600"
                style={styles.label}
              >
                Amount
              </Typography>
              <Typography
                variant={TypographyVariant.TITLE_LARGE}
                color={theme.text.SOFT_WHITE}
                weight="600"
                style={styles.amount}
              >
                {getAmountDisplay()}
              </Typography>
            </View>

            {/* Recipient */}
            <View style={styles.section}>
              <Typography
                variant={TypographyVariant.LABEL_MEDIUM}
                color={theme.text.LIGHT_GREY}
                weight="600"
                style={styles.label}
              >
                To
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.SOFT_WHITE}
                weight="500"
                style={styles.recipient}
              >
                {formatAddress(recipientAddress)}
              </Typography>
            </View>

            {/* Fee */}
            <View style={styles.section}>
              <Typography
                variant={TypographyVariant.LABEL_MEDIUM}
                color={theme.text.LIGHT_GREY}
                weight="600"
                style={styles.label}
              >
                Network Fee
              </Typography>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.SOFT_WHITE}
                weight="500"
                style={styles.fee}
              >
                {estimatedFee.toFixed(6)} SOL
              </Typography>
            </View>

            {/* Total */}
            <View style={[styles.section, styles.totalSection]}>
              <Typography
                variant={TypographyVariant.LABEL_MEDIUM}
                color={theme.text.SOFT_WHITE}
                weight="600"
                style={styles.label}
              >
                Total
              </Typography>
              <Typography
                variant={TypographyVariant.TITLE_MEDIUM}
                color={theme.text.SOFT_WHITE}
                weight="600"
                style={styles.total}
              >
                {totalCost.toFixed(6)} SOL
              </Typography>
            </View>
          </GradientCard>

          {/* Warning */}
          <Typography
            variant={TypographyVariant.CAPTION}
            color={theme.text.LIGHT_GREY}
            style={styles.warning}
          >
            This transaction cannot be undone. Please verify all details before confirming.
          </Typography>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <GradientButton
              title="Cancel"
              onPress={onCancel}
              variant={ButtonVariant.SECONDARY}
              style={styles.cancelButton}
            />
            <GradientButton
              title="Confirm & Send"
              onPress={onConfirm}
              variant={ButtonVariant.PRIMARY}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </GradientBackground>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: EDGE_MARGIN,
      paddingTop: 10,
      paddingBottom: EDGE_MARGIN,
    },
    placeholder: {
      width: 40, // Same width as close button for centering
    },
    content: {
      flex: 1,
      padding: EDGE_MARGIN,
    },
    card: {
      marginBottom: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    totalSection: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      paddingTop: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    label: {
      marginBottom: theme.spacing.xs,
    },
    amount: {
      fontSize: 24,
    },
    recipient: {
      fontFamily: 'monospace',
    },
    fee: {
      fontFamily: 'monospace',
    },
    total: {
      fontSize: 20,
    },
    warning: {
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    cancelButton: {
      flex: 1,
    },
    confirmButton: {
      flex: 1,
    },
  });
