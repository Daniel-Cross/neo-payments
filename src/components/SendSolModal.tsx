import { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientButton } from './GradientButton';
import { GradientCard } from './GradientCard';
import { Typography } from './Typography';
import { InputGroup } from './InputGroup';
import { ToggleButtonGroup } from './ToggleButtonGroup';
import { NetworkStatus } from './NetworkStatus';
import { TransactionSummary } from './TransactionSummary';
import { PrivacyNotice } from './PrivacyNotice';
import { useWalletStore } from '../store/walletStore';
import { useFeeMonitoring } from '../hooks/useFeeMonitoring';
import { transactionService, TransferParams } from '../services/transactionService';
import { PublicKey } from '@solana/web3.js';
import { ButtonVariant, ButtonSize, TypographyVariant, CardVariant, NetworkCongestion, InputMode, Currency } from '../constants/enums';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { EDGE_MARGIN } from '../constants/styles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface SendSolModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SendSolModal({ visible, onClose }: SendSolModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const { selectedWallet, balance, updateBalance, solPrice, selectedCurrency } = useWalletStore();
  const { optimalFee, isRefreshingFees, countdown, refreshFee } = useFeeMonitoring(visible);
  
  // Form state
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.CURRENCY);
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation state
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isValidAmount, setIsValidAmount] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [recipientBalance, setRecipientBalance] = useState<number | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setRecipientAddress('');
      setAmount('');
      setCurrencyAmount('');
      setInputMode(InputMode.CURRENCY);
      setMemo('');
      setIsValidAddress(false);
      setIsValidAmount(false);
      setEstimatedFee(0);
      setTotalCost(0);
      setRecipientBalance(null);
    }
  }, [visible]);

  // Validate recipient address
  const validateAddress = useCallback(async (address: string) => {
    if (!address.trim()) {
      setIsValidAddress(false);
      setRecipientBalance(null);
      return;
    }

    const isValid = transactionService.validateAddress(address);
    setIsValidAddress(isValid);

    if (isValid) {
      try {
        const recipientPubkey = new PublicKey(address);
        const balance = await transactionService.getBalance(recipientPubkey);
        setRecipientBalance(balance);
      } catch (error) {
        console.warn('Failed to fetch recipient balance:', error);
        setRecipientBalance(null);
      }
    } else {
      setRecipientBalance(null);
    }
  }, []);

  // Helper functions for currency conversion
  const currencyToSol = useCallback((currencyAmount: number) => {
    return currencyAmount / solPrice;
  }, [solPrice]);

  const solToCurrency = useCallback((solAmount: number) => {
    return solAmount * solPrice;
  }, [solPrice]);

  // Validate amount
  const validateAmount = useCallback((amountStr: string) => {
    if (!amountStr) {
      setIsValidAmount(false);
      return false;
    }
    
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      setIsValidAmount(false);
      return false;
    }
    
    // Convert to SOL if input is in currency
    const solAmount = inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount;
    
    // Check if SOL amount is valid
    const isValid = solAmount > 0 && solAmount <= balance;
    setIsValidAmount(isValid);
    return isValid;
  }, [balance, inputMode, currencyToSol]);

  // Calculate total cost and fees using fee analysis
  const calculateCosts = useCallback((amountStr: string) => {
    if (!amountStr) {
      setEstimatedFee(0);
      setTotalCost(0);
      return;
    }

    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      setEstimatedFee(0);
      setTotalCost(0);
      return;
    }

    // Convert to SOL if input is in currency
    const solAmount = inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount;
    
    // Validate SOL amount
    if (solAmount > balance) {
      setEstimatedFee(0);
      setTotalCost(0);
      return;
    }

    // Use optimal fee if available, otherwise fallback to default
    if (optimalFee) {
      setEstimatedFee(optimalFee.feeInSOL);
      setTotalCost(solAmount + optimalFee.feeInSOL);
    } else {
      // Fallback to default fee
      const defaultFee = 0.000005; // 5000 lamports
      setEstimatedFee(defaultFee);
      setTotalCost(solAmount + defaultFee);
    }
  }, [optimalFee, inputMode, currencyToSol, balance]);

  // Debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateAddress(recipientAddress);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [recipientAddress, validateAddress]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentAmount = inputMode === InputMode.CURRENCY ? currencyAmount : amount;
      calculateCosts(currentAmount);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [amount, currencyAmount, inputMode, calculateCosts]);

  // Re-validate when input mode changes
  useEffect(() => {
    const currentAmount = inputMode === InputMode.CURRENCY ? currencyAmount : amount;
    if (currentAmount) {
      validateAmount(currentAmount);
    }
  }, [inputMode, validateAmount, currencyAmount, amount]);

  // Handle send transaction
  const handleSend = async () => {
    if (!selectedWallet || !isValidAddress || !isValidAmount) {
      showErrorToast('Please check your inputs and try again');
      return;
    }

    const currentAmount = inputMode === InputMode.CURRENCY ? currencyAmount : amount;
    const numAmount = parseFloat(currentAmount);
    const solAmount = inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount;
    
    // Final validation
    if (totalCost > balance) {
      showErrorToast('Insufficient balance to cover amount and fees');
      return;
    }

    // Show confirmation dialog
    const amountDisplay = inputMode === InputMode.CURRENCY 
      ? `${numAmount.toFixed(2)} ${selectedCurrency} (${solAmount.toFixed(6)} SOL)`
      : `${solAmount.toFixed(6)} SOL`;
      
    Alert.alert(
      'Confirm Transaction',
      `Send ${amountDisplay} to ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-8)}?\n\nFee: ${estimatedFee.toFixed(6)} SOL\nTotal: ${totalCost.toFixed(6)} SOL`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: executeTransaction },
      ]
    );
  };

  const executeTransaction = async () => {
    if (!selectedWallet) return;

    setIsLoading(true);
    
    try {
      const currentAmount = inputMode === InputMode.CURRENCY ? currencyAmount : amount;
      const numAmount = parseFloat(currentAmount);
      const solAmount = inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount;
      
      const transferParams: TransferParams = {
        from: new PublicKey(selectedWallet.publicKey),
        to: new PublicKey(recipientAddress),
        amount: solAmount,
        memo: memo || undefined, // Memo will be automatically hashed for privacy
      };

      // Execute the transaction using our raw transaction service
      const result = await transactionService.transferSOL(
        transferParams,
        selectedWallet.keypair,
        true // Use versioned transaction for better performance
      );

      if (result.success && result.signature) {
        showSuccessToast(`Transaction sent! Signature: ${result.signature.slice(0, 8)}...`);
        
        // Clear form and close modal
        setRecipientAddress('');
        setAmount('');
        setCurrencyAmount('');
        setMemo('');
        onClose();
        
        // Update balance
        await updateBalance();
      } else {
        showErrorToast(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Send transaction error:', error);
      showErrorToast(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const currentAmount = inputMode === 'currency' ? currencyAmount : amount;
  const numAmount = parseFloat(currentAmount);
  const solAmount = inputMode === 'currency' ? currencyToSol(numAmount) : numAmount;
  const canSend = isValidAddress && isValidAmount && totalCost <= balance && !isLoading && solAmount > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons 
              name="close" 
              size={24} 
              color={theme.text.SOFT_WHITE} 
            />
          </TouchableOpacity>
          <Typography 
            variant={TypographyVariant.TITLE_LARGE} 
            color={theme.text.SOFT_WHITE}
            weight="600"
          >
            Send SOL
          </Typography>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>
              {/* Recipient Address */}
              <InputGroup
                label="Recipient Address"
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                placeholder="Enter Solana address..."
                error={recipientAddress && !isValidAddress ? "Invalid Solana address" : undefined}
                success={recipientAddress && isValidAddress ? `Valid address ${recipientBalance !== null ? `(${recipientBalance.toFixed(4)} SOL)` : ''}` : undefined}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                style={styles.inputGroup}
              />

              {/* Amount */}
              <View style={styles.inputGroup}>
                <View style={styles.amountHeader}>
                  <Typography 
                    variant={TypographyVariant.LABEL_MEDIUM} 
                    color={theme.text.LIGHT_GREY}
                    weight="600"
                    style={styles.label}
                  >
                    Amount
                  </Typography>
                  <ToggleButtonGroup
                    options={[
                      { value: InputMode.CURRENCY, label: selectedCurrency },
                      { value: InputMode.SOL, label: 'SOL' },
                    ]}
                    selectedValue={inputMode}
                    onValueChange={(value) => setInputMode(value as InputMode)}
                  />
                </View>
                
                <View style={styles.amountContainer}>
                  <TextInput
                    style={[
                      styles.amountInput,
                      currentAmount && !isValidAmount && { borderColor: theme.text.ERROR_RED },
                      currentAmount && isValidAmount && { borderColor: theme.text.SUCCESS_GREEN },
                    ]}
                    value={currentAmount}
                    onChangeText={inputMode === InputMode.CURRENCY ? setCurrencyAmount : setAmount}
                    placeholder={inputMode === InputMode.CURRENCY ? '0.00' : '0.0'}
                    placeholderTextColor={theme.text.LIGHT_GREY}
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity
                    style={styles.maxButton}
                    onPress={() => {
                      // Use estimated fee or fallback to default fee
                      const fee = estimatedFee > 0 ? estimatedFee : 0.000005;
                      const maxSol = balance - fee;
                      
                      if (inputMode === InputMode.CURRENCY) {
                        setCurrencyAmount(solToCurrency(maxSol).toFixed(2));
                      } else {
                        setAmount(maxSol.toString());
                      }
                    }}
                  >
                    <Typography 
                      variant={TypographyVariant.CAPTION} 
                      color={theme.text.SOFT_WHITE}
                      weight="600"
                    >
                      MAX
                    </Typography>
                  </TouchableOpacity>
                </View>
                
                {/* Conversion display */}
                {currentAmount && parseFloat(currentAmount) > 0 && (
                  <Typography 
                    variant={TypographyVariant.CAPTION} 
                    color={theme.text.DARK_GREY}
                    style={styles.conversionText}
                  >
                    {inputMode === InputMode.CURRENCY 
                      ? `≈ ${solAmount.toFixed(6)} SOL`
                      : `≈ ${solToCurrency(solAmount).toFixed(2)} ${selectedCurrency}`
                    }
                  </Typography>
                )}
                
                {currentAmount && !isValidAmount && (
                  <Typography 
                    variant={TypographyVariant.CAPTION} 
                    color={theme.text.ERROR_RED}
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    {solAmount > balance ? 'Insufficient balance' : 'Invalid amount'}
                  </Typography>
                )}
                
                <Typography 
                  variant={TypographyVariant.CAPTION} 
                  color={theme.text.LIGHT_GREY}
                  style={styles.balanceText}
                >
                  Available: {balance.toFixed(6)} SOL ({solToCurrency(balance).toFixed(2)} {selectedCurrency})
                </Typography>
              </View>

              {/* Memo (Optional) */}
              <InputGroup
                label="Memo (Optional)"
                value={memo}
                onChangeText={setMemo}
                placeholder="Add a note..."
                maxLength={200}
                style={styles.inputGroup}
              />

              {/* Network Status */}
              {optimalFee && (
                <NetworkStatus
                  networkCongestion={optimalFee.networkCongestion}
                  estimatedTime={optimalFee.estimatedTime}
                  feeInSOL={optimalFee.feeInSOL}
                  countdown={countdown}
                  isRefreshing={isRefreshingFees}
                  onRefresh={refreshFee}
                />
              )}

              {/* Privacy Notice */}
              <PrivacyNotice
                message="Memos are automatically hashed for privacy. Only the recipient can decode them."
              />

              {/* Transaction Summary */}
              {currentAmount && isValidAmount && (
                <TransactionSummary
                  inputMode={inputMode}
                  selectedCurrency={selectedCurrency}
                  numAmount={numAmount}
                  solAmount={solAmount}
                  estimatedFee={estimatedFee}
                  totalCost={totalCost}
                  balance={balance}
                  solToCurrency={solToCurrency}
                />
              )}
            </GradientCard>

            <GradientButton
              title={isLoading ? "Sending..." : "Send SOL"}
              onPress={handleSend}
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.LARGE}
              style={styles.sendButton}
              disabled={!canSend}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.DARK_PURPLE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EDGE_MARGIN,
    paddingTop:10,
    paddingBottom: EDGE_MARGIN,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  placeholder: {
    width: 40, // Same width as close button for centering
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: EDGE_MARGIN,
  },
  card: {
    marginBottom: theme.spacing.xxl,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    fontSize: 18,
    color: theme.text.SOFT_WHITE,
    backgroundColor: theme.background.PURPLE_ACCENT,
    marginRight: theme.spacing.md,
  },
  conversionText: {
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  maxButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.NEON_PINK,
    borderRadius: theme.borderRadius.small,
  },
  balanceText: {
    marginTop: theme.spacing.xs,
  },
  sendButton: {
    marginTop: theme.spacing.lg,
  },
});
