import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
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

  const getAnimationSource = () => {
    if (status === TransactionStatus.PENDING) {
      return require('../../assets/animations/coin-loading.json');
    } else if (status === TransactionStatus.SUCCESS) {
      return require('../../assets/animations/success-check.json');
    } else {
      return require('../../assets/animations/cross-error.json');
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
      return errorMessage || 'Something went wrong with your transaction';
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
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
              <Text style={[styles.detailsValue, { color: theme.text.SOFT_WHITE }]}>
                {formatAddress(transactionSignature)}
              </Text>
            </View>
          )}

          {/* Error Details */}
          {showResult && status === TransactionStatus.FAILED && errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.text.ERROR_RED }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Action Button */}
          {showResult && (
            <View style={styles.buttonContainer}>
              <GradientButton
                title={getButtonText()}
                onPress={handleButtonPress}
                variant={status === TransactionStatus.SUCCESS ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>
      </GradientBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  actionButton: {
    width: '100%',
  },
});
