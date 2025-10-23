// Import crypto initialization first
import '../utils/cryptoInit';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { PublicKey } from '@solana/web3.js';

// Contexts and Hooks
import { useTheme } from '../contexts/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { useFeeMonitoring } from '../hooks/useFeeMonitoring';

// Components
import { GradientButton } from './GradientButton';
import { GradientCard } from './GradientCard';
import { Typography } from './Typography';
import InputGroup from './InputGroup';
import ToggleButtonGroup from './ToggleButtonGroup';
import NetworkStatus from './NetworkStatus';
import TransactionSummary from './TransactionSummary';
import PrivacyNotice from './PrivacyNotice';
import RecipientSelection, { Contact } from './RecipientSelection';
import CloseButton from './CloseButton';
import QRScanner from './QRScanner';

// Services
import { transactionService, TransferParams } from '../services/transactionService';
import { contactsService } from '../services/contactsService';

// Constants and Utils
import {
  ButtonVariant,
  ButtonSize,
  TypographyVariant,
  CardVariant,
  InputMode,
  ButtonText,
  AlertTitle,
  AlertMessage,
  LabelText,
  RecipientType,
} from '../constants/enums';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { evaluateMathExpression } from '../utils/walletUtils';
import { EDGE_MARGIN } from '../constants/styles';

// Constants
const DEFAULT_FEE = 0.000005; // 5000 lamports
const ADDRESS_VALIDATION_DELAY = 500;
const AMOUNT_VALIDATION_DELAY = 300;

interface SendSolModalProps {
  visible: boolean;
  onClose: () => void;
  initialRecipientAddress?: string;
  initialAmount?: string;
  initialMemo?: string;
}

// Helper functions

const resetFormState = () => ({
  recipientAddress: '',
  amount: '',
  currencyAmount: '',
  inputMode: InputMode.CURRENCY,
  memo: '',
  isValidAddress: false,
  isValidatingAddress: false,
  isValidAmount: false,
  estimatedFee: 0,
  totalCost: 0,
  recipientBalance: null as number | null,
  selectedRecipientType: RecipientType.WALLET_ADDRESS,
});

export default function SendSolModal({ visible, onClose, initialRecipientAddress, initialAmount, initialMemo }: SendSolModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const { selectedWallet, balance, updateBalance, solPrice, selectedCurrency } = useWalletStore();
  const { optimalFee, isRefreshingFees, countdown } = useFeeMonitoring(visible);

  // Form state
  const [formState, setFormState] = useState(resetFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [favorites, setFavorites] = useState<Contact[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Destructure form state for easier access
  const {
    recipientAddress,
    amount,
    currencyAmount,
    inputMode,
    memo,
    isValidAddress,
    isValidatingAddress,
    isValidAmount,
    estimatedFee,
    totalCost,
    recipientBalance,
    selectedRecipientType,
  } = formState;

  // Load contacts and favorites on mount
  useEffect(() => {
    const loadContacts = () => {
      setContacts(contactsService.getContacts());
      setFavorites(contactsService.getFavorites());
    };
    loadContacts();
  }, []);

  // Reset form when modal opens or set initial values if provided
  useEffect(() => {
    if (visible) {
      const newState = resetFormState();
      if (initialRecipientAddress) {
        newState.recipientAddress = initialRecipientAddress;
        newState.isValidatingAddress = true;
      }
      if (initialAmount) {
        newState.amount = initialAmount;
        newState.isValidAmount = true;
      }
      if (initialMemo) {
        newState.memo = initialMemo;
      }
      setFormState(newState);
    }
  }, [visible, initialRecipientAddress, initialAmount, initialMemo]);

  // Validate recipient address
  const validateAddress = useCallback(async (address: string) => {
    if (!address.trim()) {
      setFormState(prev => ({ ...prev, isValidAddress: false, isValidatingAddress: false, recipientBalance: null }));
      return;
    }

    // Set validating state
    setFormState(prev => ({ ...prev, isValidatingAddress: true }));

    // Small delay to ensure validating state is visible
    await new Promise(resolve => setTimeout(resolve, 50));

    const isValid = transactionService.validateAddress(address);

    if (isValid) {
      try {
        const recipientPubkey = new PublicKey(address);
        const balance = await transactionService.getBalance(recipientPubkey);
        setFormState(prev => ({ 
          ...prev, 
          isValidAddress: true, 
          isValidatingAddress: false, 
          recipientBalance: balance 
        }));
      } catch (error) {
        console.warn('Failed to fetch recipient balance:', error);
        setFormState(prev => ({ 
          ...prev, 
          isValidAddress: true, 
          isValidatingAddress: false, 
          recipientBalance: null 
        }));
      }
    } else {
      setFormState(prev => ({ 
        ...prev, 
        isValidAddress: false, 
        isValidatingAddress: false, 
        recipientBalance: null 
      }));
    }
  }, []);

  // Helper functions for currency conversion
  const currencyToSol = useCallback(
    (currencyAmount: number) => {
      return currencyAmount / solPrice;
    },
    [solPrice]
  );

  const solToCurrency = useCallback(
    (solAmount: number) => {
      return solAmount * solPrice;
    },
    [solPrice]
  );

  // Validate amount
  const validateAmount = useCallback(
    (amountStr: string) => {
      if (!amountStr) {
        setFormState(prev => ({ ...prev, isValidAmount: false }));
        return false;
      }

      const numAmount = parseFloat(amountStr);
      if (isNaN(numAmount) || numAmount <= 0) {
        setFormState(prev => ({ ...prev, isValidAmount: false }));
        return false;
      }

      // Convert to SOL if input is in currency
      const solAmount = inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount;

      // Check if SOL amount is valid
      const isValid = solAmount > 0 && solAmount <= balance;
      setFormState(prev => ({ ...prev, isValidAmount: isValid }));
      return isValid;
    },
    [balance, inputMode, currencyToSol]
  );

  // Calculate total cost and fees using fee analysis
  const calculateCosts = useCallback(
    (amountStr: string) => {
      // Use setTimeout to prevent setState during render
      setTimeout(() => {
        if (!amountStr) {
          setFormState(prev => ({ ...prev, estimatedFee: 0, totalCost: 0 }));
          return;
        }

        const numAmount = parseFloat(amountStr);
        if (isNaN(numAmount) || numAmount <= 0) {
          setFormState(prev => ({ ...prev, estimatedFee: 0, totalCost: 0 }));
          return;
        }

        // Convert to SOL if input is in currency
        const solAmount = inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount;

        // Validate SOL amount
        if (solAmount > balance) {
          setFormState(prev => ({ ...prev, estimatedFee: 0, totalCost: 0 }));
          return;
        }

        // Use optimal fee if available, otherwise fallback to default
        const fee = optimalFee ? optimalFee.feeInSOL : DEFAULT_FEE;
        setFormState(prev => ({ 
          ...prev, 
          estimatedFee: fee, 
          totalCost: solAmount + fee 
        }));
      }, 0);
    },
    [optimalFee, inputMode, currencyToSol, balance]
  );

  // Debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateAddress(recipientAddress);
    }, ADDRESS_VALIDATION_DELAY);
    return () => clearTimeout(timeoutId);
  }, [recipientAddress, validateAddress]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentAmount = inputMode === InputMode.CURRENCY ? currencyAmount : amount;
      calculateCosts(currentAmount);
    }, AMOUNT_VALIDATION_DELAY);
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
      showErrorToast(AlertMessage.CHECK_INPUTS_AND_TRY_AGAIN);
      return;
    }

    const currentAmount = inputMode === InputMode.CURRENCY ? currencyAmount : amount;
    const numAmount = parseFloat(currentAmount);
    const solAmount = inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount;

    // Final validation
    if (totalCost > balance) {
      showErrorToast(AlertMessage.INSUFFICIENT_BALANCE);
      return;
    }

    // Show confirmation dialog
    const amountDisplay =
      inputMode === InputMode.CURRENCY
        ? `${numAmount.toFixed(2)} ${selectedCurrency} (${solAmount.toFixed(6)} SOL)`
        : `${solAmount.toFixed(6)} SOL`;

    Alert.alert(
      AlertTitle.CONFIRM_TRANSACTION,
      `Send ${amountDisplay} to ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(
        -8
      )}?\n\nFee: ${estimatedFee.toFixed(6)} SOL\nTotal: ${totalCost.toFixed(6)} SOL`,
      [
        { text: ButtonText.CANCEL, style: 'cancel' },
        { text: ButtonText.SEND, onPress: executeTransaction },
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

      // Encrypt memo if provided (so only recipient can read it)
      let encryptedMemo: string | undefined;
      if (memo && memo.trim()) {
        try {
          encryptedMemo = await transactionService.encryptMemoForRecipient(
            memo.trim(),
            recipientAddress
          );
        } catch (error) {
          console.error('Failed to encrypt memo:', error);
          encryptedMemo = memo.trim(); // Fallback to plain text if encryption fails
        }
      }

      const transferParams: TransferParams = {
        from: new PublicKey(selectedWallet.publicKey),
        to: new PublicKey(recipientAddress),
        amount: solAmount,
        memo: encryptedMemo,
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
        setFormState(resetFormState());
        onClose();

        // Update balance
        await updateBalance();
      } else {
        // Close modal first so user can see the error toast
        onClose();
        showErrorToast(result.error || AlertMessage.TRANSACTION_FAILED);
        
        // Clear form after closing
        setFormState(resetFormState());
      }
    } catch (error) {
      console.error('Transaction error:', error);
      
      // Close modal first so user can see the error toast
      onClose();
      showErrorToast(error instanceof Error ? error.message : AlertMessage.TRANSACTION_FAILED);
      
      // Clear form after closing
      setFormState(resetFormState());
    } finally {
      setIsLoading(false);
    }
  };

  // Contact handlers
  const handleContactSelect = (contact: Contact) => {
    setFormState(prev => ({ 
      ...prev, 
      recipientAddress: contact.address,
      selectedRecipientType: RecipientType.WALLET_ADDRESS 
    }));
  };

  const handleToggleFavorite = (contact: Contact) => {
    contactsService.toggleFavorite(contact);
    setContacts(contactsService.getContacts());
    setFavorites(contactsService.getFavorites());
  };

  // Calculate current values safely using useMemo to prevent render issues
  const currentAmount = useMemo(() => 
    inputMode === InputMode.CURRENCY ? currencyAmount : amount, 
    [inputMode, currencyAmount, amount]
  );
  
  const numAmount = useMemo(() => 
    parseFloat(currentAmount) || 0, 
    [currentAmount]
  );
  
  const solAmount = useMemo(() => 
    inputMode === InputMode.CURRENCY ? currencyToSol(numAmount) : numAmount, 
    [inputMode, currencyToSol, numAmount]
  );
  
  const canSend = useMemo(() => 
    isValidAddress && isValidAmount && totalCost <= balance && !isLoading && solAmount > 0,
    [isValidAddress, isValidAmount, totalCost, balance, isLoading, solAmount]
  );

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <CloseButton onPress={onClose} />
          <Typography
            variant={TypographyVariant.TITLE_LARGE}
            color={theme.text.SOFT_WHITE}
            weight='600'
          >
            Send SOL
          </Typography>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Recipient Selection */}
            <RecipientSelection
              selectedType={selectedRecipientType}
              onTypeChange={(type) => setFormState(prev => ({ ...prev, selectedRecipientType: type }))}
              recipientAddress={recipientAddress}
              onAddressChange={(address) => setFormState(prev => ({ 
                ...prev, 
                recipientAddress: address,
                isValidatingAddress: address.trim() ? true : false,
                isValidAddress: false
              }))}
              contacts={contacts}
              favorites={favorites}
              onContactSelect={handleContactSelect}
              onToggleFavorite={handleToggleFavorite}
              isValidAddress={isValidAddress}
              isValidatingAddress={isValidatingAddress}
              recipientBalance={recipientBalance}
              onScanQRCode={() => setShowQRScanner(true)}
            />

            <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>
              {/* Amount */}
              <View style={styles.inputGroup}>
                <View style={styles.amountHeader}>
                  <Typography
                    variant={TypographyVariant.LABEL_MEDIUM}
                    color={theme.text.LIGHT_GREY}
                    weight='600'
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
                    onValueChange={value => setFormState(prev => ({ ...prev, inputMode: value as InputMode }))}
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
                    onChangeText={(text) => {
                      if (inputMode === InputMode.CURRENCY) {
                        setFormState(prev => ({ ...prev, currencyAmount: text }));
                      } else {
                        setFormState(prev => ({ ...prev, amount: text }));
                      }
                    }}
                    onBlur={() => {
                      // Evaluate math expression when user finishes typing (blur)
                      const result = evaluateMathExpression(currentAmount);
                      if (result !== null) {
                        if (inputMode === InputMode.CURRENCY) {
                          setFormState(prev => ({ ...prev, currencyAmount: result.toFixed(2) }));
                        } else {
                          setFormState(prev => ({ ...prev, amount: result.toString() }));
                        }
                      }
                    }}
                    onSubmitEditing={() => {
                      // Evaluate math expression when user presses Enter
                      const result = evaluateMathExpression(currentAmount);
                      if (result !== null) {
                        if (inputMode === InputMode.CURRENCY) {
                          setFormState(prev => ({ ...prev, currencyAmount: result.toFixed(2) }));
                        } else {
                          setFormState(prev => ({ ...prev, amount: result.toString() }));
                        }
                      }
                    }}
                    returnKeyType='done'
                    placeholder={inputMode === InputMode.CURRENCY ? '0.00' : '0.0'}
                    placeholderTextColor={theme.text.LIGHT_GREY}
                    keyboardType='default'
                  />
                  <TouchableOpacity
                    style={styles.maxButton}
                    onPress={() => {
                      // Use estimated fee or fallback to default fee
                      const fee = estimatedFee > 0 ? estimatedFee : DEFAULT_FEE;
                      const maxSol = balance - fee;

                      if (inputMode === InputMode.CURRENCY) {
                        setFormState(prev => ({ 
                          ...prev, 
                          currencyAmount: solToCurrency(maxSol).toFixed(2) 
                        }));
                      } else {
                        setFormState(prev => ({ 
                          ...prev, 
                          amount: maxSol.toString() 
                        }));
                      }
                    }}
                  >
                    <Typography
                      variant={TypographyVariant.CAPTION}
                      color={theme.text.SOFT_WHITE}
                      weight='600'
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
                      : `≈ ${solToCurrency(solAmount).toFixed(2)} ${selectedCurrency}`}
                  </Typography>
                )}

                {currentAmount && !isValidAmount && (
                  <Typography
                    variant={TypographyVariant.CAPTION}
                    color={theme.text.ERROR_RED}
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    {solAmount > balance
                      ? LabelText.INSUFFICIENT_BALANCE
                      : LabelText.INVALID_AMOUNT}
                  </Typography>
                )}

                <Typography
                  variant={TypographyVariant.CAPTION}
                  color={theme.text.LIGHT_GREY}
                  style={styles.balanceText}
                >
                  Available: {balance.toFixed(6)} SOL ({solToCurrency(balance).toFixed(2)}{' '}
                  {selectedCurrency})
                </Typography>
              </View>

              {/* Memo (Optional) */}
              <InputGroup
                label='Memo (Optional)'
                value={memo}
                onChangeText={(text) => setFormState(prev => ({ ...prev, memo: text }))}
                placeholder='Add a note...'
                maxLength={200}
                style={styles.inputGroup}
              />

              {/* Privacy Notice */}
              <PrivacyNotice message='Memos are encrypted so only the recipient can read them. They are stored on-chain.' />

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
              {/* Network Status */}
              {optimalFee && (
              <NetworkStatus
                networkCongestion={optimalFee.networkCongestion}
                estimatedTime={optimalFee.estimatedTime}
                feeInSOL={optimalFee.feeInSOL}
                countdown={countdown}
                isRefreshing={isRefreshingFees}
              />
              )}
            </GradientCard>

            <GradientButton
              title={isLoading ? ButtonText.SENDING : ButtonText.SEND_SOL}
              onPress={handleSend}
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.LARGE}
              style={styles.sendButton}
              disabled={!canSend}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* QR Scanner */}
      <QRScanner
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={(data) => {
          setFormState(prev => ({ 
            ...prev, 
            recipientAddress: data,
            isValidatingAddress: data.trim() ? true : false,
            isValidAddress: false
          }));
        }}
      />
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.DARK_PURPLE,
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
