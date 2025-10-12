/**
 * Wallet handler functions for business logic operations
 */

import { showSuccessToast, showErrorToast, showWarningToast } from "./toast";
import { AlertMessage } from "../constants/enums";
import { isValidPrivateKeyFormat } from "./walletUtils";
import {
  TOAST_MESSAGES,
  getSecureStorageTestMessage,
  getPrivateKeyWarningMessage,
  getSeedPhraseWarningMessage,
} from "./toastMessages";

/**
 * Handle wallet creation with proper error handling and user feedback
 */
export const createWalletHandler = async (
  createNewWallet: () => Promise<boolean>,
  secureStorageAvailable: boolean
): Promise<boolean> => {
  if (!secureStorageAvailable) {
    showWarningToast(AlertMessage.SECURE_STORAGE_UNAVAILABLE_CREATE);
    return false;
  }

  try {
    const success = await createNewWallet();
    if (success) {
      showSuccessToast(TOAST_MESSAGES.WALLET_CREATED);
      return true;
    } else {
      showErrorToast(TOAST_MESSAGES.WALLET_CREATION_FAILED);
      return false;
    }
  } catch (error) {
    showErrorToast(TOAST_MESSAGES.WALLET_CREATION_FAILED);
    return false;
  }
};

/**
 * Handle wallet import with validation and user feedback
 */
export const importWalletHandler = async (
  importWallet: (privateKey: string) => Promise<boolean>,
  privateKeyInput: string,
  secureStorageAvailable: boolean,
  onSuccess?: () => void
): Promise<boolean> => {
  // Validate input
  if (!privateKeyInput.trim()) {
    showErrorToast(AlertMessage.ENTER_PRIVATE_KEY);
    return false;
  }

  // Validate private key format
  if (!isValidPrivateKeyFormat(privateKeyInput.trim())) {
    showErrorToast(TOAST_MESSAGES.INVALID_PRIVATE_KEY_FORMAT);
    return false;
  }

  if (!secureStorageAvailable) {
    showWarningToast(AlertMessage.SECURE_STORAGE_UNAVAILABLE_IMPORT);
    return false;
  }

  try {
    const success = await importWallet(privateKeyInput.trim());
    if (success) {
      showSuccessToast(TOAST_MESSAGES.WALLET_IMPORTED);
      onSuccess?.();
      return true;
    } else {
      showErrorToast(AlertMessage.INVALID_PRIVATE_KEY);
      return false;
    }
  } catch (error) {
    showErrorToast(TOAST_MESSAGES.WALLET_IMPORT_FAILED);
    return false;
  }
};

/**
 * Handle wallet disconnection with user feedback
 */
export const disconnectWalletHandler = async (
  disconnectWallet: () => Promise<void>
): Promise<void> => {
  try {
    await disconnectWallet();
    showSuccessToast(TOAST_MESSAGES.WALLET_DISCONNECTED);
  } catch (error) {
    showErrorToast(TOAST_MESSAGES.WALLET_DISCONNECT_FAILED);
  }
};

/**
 * Handle private key export with security warnings
 */
export const exportPrivateKeyHandler = async (
  exportPrivateKey: () => Promise<string | null>
): Promise<void> => {
  try {
    const privateKey = await exportPrivateKey();

    if (privateKey) {
      showWarningToast(getPrivateKeyWarningMessage(privateKey));
    } else {
      showErrorToast(
        "Failed to export private key. Make sure you have a wallet connected and try authenticating again."
      );
    }
  } catch (error) {
    showErrorToast(
      "Failed to export private key. Authentication may have been cancelled or failed."
    );
  }
};

/**
 * Handle seed phrase export with security warnings
 */
export const exportSeedPhraseHandler = async (
  exportSeedPhrase: () => Promise<string | null>
): Promise<void> => {
  try {
    const seedPhrase = await exportSeedPhrase();

    if (seedPhrase) {
      showWarningToast(getSeedPhraseWarningMessage(seedPhrase));
    } else {
      showErrorToast(
        "Failed to export seed phrase. Make sure you have a wallet connected and try authenticating again."
      );
    }
  } catch (error) {
    showErrorToast(
      "Failed to export seed phrase. Authentication may have been cancelled or failed."
    );
  }
};

/**
 * Handle secure storage testing with detailed feedback
 */
export const testSecureStorageHandler = async (
  testSecureStorage: () => Promise<{ basicTest: boolean; authTest: boolean }>
): Promise<void> => {
  try {
    const results = await testSecureStorage();
    const isSuccess = results.basicTest && results.authTest;
    const message = getSecureStorageTestMessage(
      results.basicTest,
      results.authTest,
      isSuccess
    );

    if (isSuccess) {
      showSuccessToast(message);
    } else {
      showErrorToast(message);
    }
  } catch (error) {
    showErrorToast(TOAST_MESSAGES.SECURE_STORAGE_TEST_FAILED);
  }
};

/**
 * Handle balance refresh with user feedback
 */
export const refreshBalanceHandler = async (
  updateBalance: () => Promise<void>
): Promise<void> => {
  try {
    await updateBalance();
    showSuccessToast(TOAST_MESSAGES.BALANCE_UPDATED);
  } catch (error) {
    showErrorToast(TOAST_MESSAGES.BALANCE_REFRESH_FAILED);
  }
};
