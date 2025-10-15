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
      (wallet) =>
        wallet.publicKey === trimmedInput ||
        wallet.name.toLowerCase().includes(trimmedInput.toLowerCase())
    );

    if (existingWallet) {
      return `A wallet with this key already exists: ${existingWallet.name}`;
    }

    return null;
  } catch (error) {
    return "Unable to validate wallet. Please check your input and try again.";
  }
};

/**
 * Wallet import instructions for popular wallets
 */
export const WALLET_IMPORT_INSTRUCTIONS = [
  "• From Phantom: Settings → Show Secret Recovery Phrase",
  "• From Solflare: Settings → Export Private Key or Seed Phrase",
  '• From other wallets: Look for "Export" or "Recovery Phrase" in settings',
  "• You can paste either a 12/24 word seed phrase or a private key",
];

/**
 * Security warnings for wallet import
 */
export const SECURITY_WARNINGS = [
  "• Never share your private key with anyone",
  "• Make sure you're in a secure environment",
  "• Your private key will be encrypted and stored securely",
];
