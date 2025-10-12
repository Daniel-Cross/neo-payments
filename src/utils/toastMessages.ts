/**
 * Centralized toast message constants and helpers
 */

export const TOAST_MESSAGES = {
  // Success messages
  WALLET_CREATED: "Wallet created successfully!",
  WALLET_IMPORTED: "Wallet imported successfully!",
  WALLET_DISCONNECTED: "Wallet disconnected successfully",
  BALANCE_UPDATED: "Balance updated successfully",
  SECURE_STORAGE_TESTS_PASSED: (basicStatus: string, authStatus: string) =>
    `Secure storage tests passed! Basic: ${basicStatus}, Auth: ${authStatus}`,

  // Error messages
  WALLET_CREATION_FAILED: "Failed to create wallet. Please try again.",
  WALLET_IMPORT_FAILED: "Failed to import wallet. Please try again.",
  WALLET_DISCONNECT_FAILED: "Failed to disconnect wallet",
  BALANCE_REFRESH_FAILED: "Failed to refresh balance",
  SECURE_STORAGE_TESTS_FAILED: (basicStatus: string, authStatus: string) =>
    `Secure storage tests failed! Basic: ${basicStatus}, Auth: ${authStatus}`,
  SECURE_STORAGE_TEST_FAILED: "Failed to test secure storage",
  INVALID_PRIVATE_KEY_FORMAT:
    "Invalid private key format. Please check and try again.",

  // Warning messages
  SECURE_STORAGE_UNAVAILABLE_CREATE:
    "Your device does not support secure storage. Wallet creation is not available.",
  SECURE_STORAGE_UNAVAILABLE_IMPORT:
    "Your device does not support secure storage. Wallet import is not available.",
  PRIVATE_KEY_WARNING: (privateKey: string) =>
    `Private Key: ${privateKey}\n\n⚠️ Keep this safe and never share it!`,
  SEED_PHRASE_WARNING: (seedPhrase: string) =>
    `Seed Phrase:\n${seedPhrase}\n\n⚠️ Write this down and store it safely! Anyone with this phrase can access your wallet.`,

  // Info messages
  ENTER_PRIVATE_KEY: "Please enter a valid private key.",
} as const;

/**
 * Get a formatted toast message for secure storage test results
 */
export const getSecureStorageTestMessage = (
  basicTest: boolean,
  authTest: boolean,
  isSuccess: boolean
): string => {
  const basicStatus = basicTest ? "PASS" : "FAIL";
  const authStatus = authTest ? "PASS" : "FAIL";

  return isSuccess
    ? TOAST_MESSAGES.SECURE_STORAGE_TESTS_PASSED(basicStatus, authStatus)
    : TOAST_MESSAGES.SECURE_STORAGE_TESTS_FAILED(basicStatus, authStatus);
};

/**
 * Get a formatted private key warning message
 */
export const getPrivateKeyWarningMessage = (privateKey: string): string => {
  return TOAST_MESSAGES.PRIVATE_KEY_WARNING(privateKey);
};

/**
 * Get a formatted seed phrase warning message
 */
export const getSeedPhraseWarningMessage = (seedPhrase: string): string => {
  return TOAST_MESSAGES.SEED_PHRASE_WARNING(seedPhrase);
};
