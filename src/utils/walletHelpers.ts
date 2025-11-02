/**
 * Helper functions for wallet operations
 */

/**
 * Determines if the input text is a seed phrase based on word count
 * @param text - The input text to check
 * @returns true if the text appears to be a seed phrase (12 or 24 words)
 */
export const isSeedPhrase = (text: string): boolean => {
  const words = text.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
};

/**
 * Checks if a wallet with the given input already exists
 * @param input - The private key or seed phrase to check
 * @param wallets - Array of existing wallets
 * @returns Error message if duplicate found, null otherwise
 */
export const checkForDuplicateWallet = (
  input: string,
  wallets: Array<{ publicKey: string; name: string }>
): string | null => {
  try {
    const trimmedInput = input.trim();

    // Check if any existing wallet has the same input (this is a basic check)
    // In a real implementation, you'd derive the public key and compare
    const existingWallet = wallets.find(
      wallet =>
        wallet.publicKey === trimmedInput ||
        wallet.name.toLowerCase().includes(trimmedInput.toLowerCase())
    );

    if (existingWallet) {
      return `A wallet with this key already exists: ${existingWallet.name}`;
    }

    return null;
  } catch (error) {
    return 'Unable to validate wallet. Please check your input and try again.';
  }
};

/**
 * Wallet import instructions for popular wallets
 */
export const WALLET_IMPORT_INSTRUCTIONS = [
  '• From Phantom: Settings → Show Secret Recovery Phrase',
  '• From Solflare: Settings → Export Private Key or Seed Phrase',
  '• From other wallets: Look for "Export" or "Recovery Phrase" in settings',
  '• You can paste either a 12/24 word seed phrase or a private key',
];

/**
 * Security warnings for wallet import
 */
export const SECURITY_WARNINGS = [
  '• Never share your private key with anyone',
  "• Make sure you're in a secure environment",
  '• Your private key will be encrypted and stored securely',
];

/**
 * Fee calculation and configuration
 */

export interface FeeCalculation {
  amount: number; // Transaction amount in SOL
  feeAmount: number; // Calculated fee in SOL
  totalAmount: number; // Amount + fee in SOL
  feePercentage: number; // Actual fee percentage applied
  breakdown: {
    transactionAmount: number;
    platformFee: number;
    networkFee: number; // Solana network fee (estimated)
    totalCost: number;
  };
}

/**
 * Calculate platform fee - tiered fee structure
 * 0.0002 SOL for transactions under 1 SOL
 * 0.0004 SOL for transactions 1 SOL to under 2 SOL
 * 0.0006 SOL for transactions 2 SOL to under 3 SOL
 * And so on (0.0002 * tier number)
 * @param transactionAmount - Transaction amount in SOL
 * @returns Platform fee in SOL
 */
export const calculatePlatformFee = (transactionAmount: number): number => {
  if (transactionAmount <= 0) {
    return 0;
  }

  // Calculate which tier the transaction falls into
  // Tier 1: 0 < amount < 1 → fee 0.0002
  // Tier 2: 1 <= amount < 2 → fee 0.0004
  // Tier 3: 2 <= amount < 3 → fee 0.0006
  // etc.
  const tier = Math.floor(transactionAmount) + 1;

  // Fee is 0.0002 SOL multiplied by tier number
  const fee = tier * 0.0002;

  return Math.round(fee * 1000000000) / 1000000000; // Round to 9 decimal places (lamports precision)
};

/**
 * Calculate total transaction cost including platform fee and network fee
 * @param transactionAmount - Transaction amount in SOL
 * @param networkFee - Network fee in SOL (default: 0.000005)
 */
export const calculateTotalCost = (
  transactionAmount: number,
  networkFee: number = 0.000005 // Default Solana network fee (~5000 lamports)
): FeeCalculation => {
  const platformFee = calculatePlatformFee(transactionAmount);
  const totalAmount = transactionAmount + platformFee;
  const totalCost = totalAmount + networkFee;

  const actualFeePercentage = (platformFee / transactionAmount) * 100;

  return {
    amount: transactionAmount,
    feeAmount: platformFee,
    totalAmount,
    feePercentage: actualFeePercentage,
    breakdown: {
      transactionAmount,
      platformFee,
      networkFee,
      totalCost,
    },
  };
};

/**
 * Format fee for display
 */
export const formatFee = (feeAmount: number): string => {
  if (feeAmount < 0.001) {
    return `${(feeAmount * 1000).toFixed(2)} mSOL`;
  }
  return `${feeAmount.toFixed(4)} SOL`;
};

/**
 * Format fee in cents for display
 */
export const formatFeeInCents = (feeAmount: number, solPrice: number = 200): string => {
  const feeInCents = feeAmount * solPrice;
  return `$${feeInCents.toFixed(2)}`;
};

/**
 * Get fee wallet address from app configuration
 */
export const getFeeWalletAddress = (): string => {
  // Get from app config (set in app.config.js)
  const Constants = require('expo-constants');
  return Constants.expoConfig?.extra?.feeWalletAddress || 'FEE_WALLET_ADDRESS_NOT_CONFIGURED';
};

/**
 * Check if fee wallet is configured
 */
export const isFeeWalletConfigured = (): boolean => {
  const feeWallet = getFeeWalletAddress();
  return feeWallet !== 'FEE_WALLET_ADDRESS_NOT_CONFIGURED' && feeWallet.length > 0;
};
