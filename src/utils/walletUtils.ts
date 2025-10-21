/**
 * Wallet utility functions for formatting, validation, and common operations
 */

/**
 * Format a wallet address for display (truncate with ellipsis)
 * @param address - The full wallet address
 * @param startChars - Number of characters to show at the start (default: 6)
 * @param endChars - Number of characters to show at the end (default: 6)
 * @returns Formatted address string
 */
export const formatWalletAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 6
): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Validate if a string looks like a valid Solana private key
 * @param privateKey - The private key string to validate
 * @returns boolean indicating if the private key format is valid
 */
export const isValidPrivateKeyFormat = (privateKey: string): boolean => {
  if (!privateKey || typeof privateKey !== 'string') return false;

  // Remove any whitespace
  const cleanKey = privateKey.trim();

  // Check if it's a valid hex string with proper length
  // Solana private keys are typically 64 characters (32 bytes) in hex
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(cleanKey) && (cleanKey.length === 64 || cleanKey.length === 128);
};

/**
 * Format SOL balance for display
 * @param balance - The balance in lamports
 * @param decimals - Number of decimal places to show (default: 4)
 * @returns Formatted balance string
 */
export const formatSolBalance = (balance: number, decimals: number = 4): string => {
  return balance.toFixed(decimals);
};

/**
 * Validate wallet connection state
 * @param keypair - The wallet keypair
 * @param publicKey - The public key string
 * @param isConnected - Connection status
 * @returns boolean indicating if wallet is properly connected
 */
export const isWalletConnected = (
  keypair: any,
  publicKey: string | null,
  isConnected: boolean
): boolean => {
  return !!(keypair && publicKey && isConnected);
};

/**
 * Generate a secure random string for testing purposes
 * @param length - Length of the random string (default: 16)
 * @returns Random string
 */
export const generateRandomString = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if secure storage is available and working
 * @param secureStorageAvailable - Current secure storage status
 * @returns Object with availability status and appropriate message
 */
export const checkSecureStorageStatus = (secureStorageAvailable: boolean) => {
  return {
    isAvailable: secureStorageAvailable,
    message: secureStorageAvailable
      ? 'Secure storage is available'
      : 'Secure storage is not available on this device',
    canCreateWallet: secureStorageAvailable,
    canImportWallet: secureStorageAvailable,
  };
};

/**
 * Safely evaluate a simple math expression
 * Supports: +, -, *, /, parentheses, and numbers (including decimals)
 * @param expression - The math expression to evaluate (e.g., "100 / 4", "2.5 * 3")
 * @returns The evaluated result as a number, or null if the expression is invalid
 */
export const evaluateMathExpression = (expression: string): number | null => {
  try {
    // Remove whitespace
    const cleanExpression = expression.replace(/\s/g, '');

    // Only allow numbers, operators, parentheses, and decimal points
    if (!/^[0-9+\-*/.()]+$/.test(cleanExpression)) {
      return null;
    }

    // Check for balanced parentheses
    let parenthesesCount = 0;
    for (const char of cleanExpression) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) return null;
    }
    if (parenthesesCount !== 0) return null;

    // Evaluate the expression safely
    // Using Function constructor instead of eval for safer evaluation
    const result = Function(`"use strict"; return (${cleanExpression})`)();

    // Validate result is a finite number
    if (typeof result === 'number' && isFinite(result) && result >= 0) {
      return result;
    }

    return null;
  } catch (error) {
    return null;
  }
};
