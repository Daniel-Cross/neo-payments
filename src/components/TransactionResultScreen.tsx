import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientBackground } from './GradientBackground';
import { GradientButton } from './GradientButton';
import { GradientType, ButtonVariant } from '../constants/enums';

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

interface TransactionResultScreenProps {
  visible: boolean;
  status: TransactionStatus;
  amount: number;
  recipientAddress: string;
  transactionSignature?: string;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export default function TransactionResultScreen({
  visible,
  status,
  amount,
  recipientAddress,
  transactionSignature,
  errorMessage,
  onClose,
  onRetry,
}: TransactionResultScreenProps) {
  const { theme } = useTheme();
  const [showResult, setShowResult] = useState(false);

  // Show pending animation for 5 seconds, then show result
  useEffect(() => {
    if (visible && status === TransactionStatus.PENDING) {
      setShowResult(false);
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    } else if (visible && status !== TransactionStatus.PENDING) {
      setShowResult(true);
    }
  }, [visible, status]);

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyTransactionId = () => {
    if (transactionSignature) {
      try {
        Clipboard.setString(transactionSignature);
      } catch (error) {
        console.error('Failed to copy transaction ID:', error);
      }
    }
  };

  const formatErrorMessage = (error: string) => {
    // Check for common error patterns and provide user-friendly messages
    if (error.includes('insufficient lamports')) {
      return 'Insufficient funds. Please check your balance and try again.';
    }
    if (error.includes('Simulation failed')) {
      return 'Transaction failed. Please check your balance and try again.';
    }
    if (error.includes('custom program error')) {
      return 'Transaction failed. Please check your balance and try again.';
    }
    // Return the original error if no pattern matches
    return error;
  };

  const getAnimationSource = () => {
    if (status === TransactionStatus.PENDING) {
      return require('../../assets/animations/pending-transaction.json');
    } else if (status === TransactionStatus.SUCCESS) {
      return require('../../assets/animations/success.json');
    } else {
      return require('../../assets/animations/error.json');
    }
  };

  const getTitle = () => {
    if (status === TransactionStatus.PENDING) {
      return 'Processing Transaction';
    } else if (status === TransactionStatus.SUCCESS) {
      return 'Transaction Successful';
    } else {
      return 'Transaction Failed';
    }
  };

  const getSubtitle = () => {
    if (status === TransactionStatus.PENDING) {
      return 'Please wait while we process your transaction...';
    } else if (status === TransactionStatus.SUCCESS) {
      return `Successfully sent ${amount.toFixed(6)} SOL to ${formatAddress(recipientAddress)}`;
    } else {
      return 'Something went wrong with your transaction';
    }
  };

  const getButtonText = () => {
    if (status === TransactionStatus.SUCCESS) {
      return 'Done';
    } else if (status === TransactionStatus.FAILED) {
      return 'Try Again';
    }
    return 'Close';
  };

  const handleButtonPress = () => {
    if (status === TransactionStatus.FAILED && onRetry) {
      onRetry();
    } else {
      onClose();
    }
  };

  const handleClosePress = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <GradientBackground gradient={GradientType.PRIMARY} style={styles.container}>
      
      <View style={styles.content}>
          {/* Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              source={getAnimationSource()}
              autoPlay
              loop={status === TransactionStatus.PENDING}
              style={styles.animation}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
            {getTitle()}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: theme.text.LIGHT_GREY }]}>
            {getSubtitle()}
          </Text>

          {/* Transaction Details */}
          {showResult && status === TransactionStatus.SUCCESS && transactionSignature && (
            <View style={styles.detailsContainer}>
              <Text style={[styles.detailsLabel, { color: theme.text.LIGHT_GREY }]}>
                Transaction ID:
              </Text>
              <TouchableOpacity onPress={copyTransactionId} style={styles.transactionIdContainer}>
                <Text style={[styles.detailsValue, { color: theme.text.SOFT_WHITE }]}>
                  {transactionSignature}
                </Text>
                <Text style={[styles.copyHint, { color: theme.text.LIGHT_GREY }]}>
                  Tap to copy
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Details */}
          {showResult && status === TransactionStatus.FAILED && errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.text.ERROR_RED }]}>
                {formatErrorMessage(errorMessage)}
              </Text>
            </View>
          )}

          {/* Action Button */}
          {showResult && (
            <View style={styles.buttonContainer}>
              {status === TransactionStatus.FAILED && onRetry ? (
                <View style={styles.failedButtonContainer}>
                  <GradientButton
                    title="Try Again"
                    onPress={handleButtonPress}
                    variant={ButtonVariant.PRIMARY}
                    style={StyleSheet.flatten([styles.actionButton, styles.retryButton])}
                  />
                  <GradientButton
                    title="Close"
                    onPress={handleClosePress}
                    variant={ButtonVariant.SECONDARY}
                    style={StyleSheet.flatten([styles.actionButton, styles.closeButton])}
                  />
                </View>
              ) : (
                <GradientButton
                  title={getButtonText()}
                  onPress={handleButtonPress}
                  variant={status === TransactionStatus.SUCCESS ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
                  style={styles.actionButton}
                />
              )}
            </View>
          )}
        </View>
      </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  detailsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  transactionIdContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  copyHint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 115, 125, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  failedButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  retryButton: {
    // Additional styles for retry button if needed
  },
  closeButton: {
    // Additional styles for close button if needed
  },
});
