import * as SecureStore from "expo-secure-store";
import { Keypair } from "@solana/web3.js";
import {
  StorageKey,
  SecureStorageService,
  AuthPrompt,
} from "../constants/enums";
import { Wallet } from "../store/walletStore";

export class SecureWalletStorage {
  /**
   * Store wallet keypair securely using device keystore
   * On iOS: Uses Keychain Services
   * On Android: Uses Android Keystore (if available) or encrypted SharedPreferences
   */
  static async storeWallet(keypair: Keypair): Promise<boolean> {
    try {
      // Convert private key to hex string
      const privateKeyHex = Array.from(keypair.secretKey)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      const publicKey = keypair.publicKey.toString();

      // Store both keys securely
      await SecureStore.setItemAsync(
        StorageKey.WALLET_PRIVATE_KEY,
        privateKeyHex,
        {
          requireAuthentication: true, // Require biometric authentication
          authenticationPrompt: AuthPrompt.ACCESS_WALLET,
          keychainService: SecureStorageService.BLINK_WALLET, // iOS keychain service name
        }
      );

      await SecureStore.setItemAsync(StorageKey.WALLET_PUBLIC_KEY, publicKey, {
        requireAuthentication: false, // Public key doesn't need auth
        keychainService: SecureStorageService.BLINK_WALLET,
      });

      return true;
    } catch (error) {
      console.error("Failed to store wallet securely:", error);
      return false;
    }
  }

  /**
   * Retrieve wallet keypair from secure storage
   */
  static async getWallet(): Promise<Keypair | null> {
    try {
      const privateKeyHex = await SecureStore.getItemAsync(
        StorageKey.WALLET_PRIVATE_KEY,
        {
          requireAuthentication: true,
          authenticationPrompt: AuthPrompt.ACCESS_WALLET,
          keychainService: SecureStorageService.BLINK_WALLET,
        }
      );

      if (!privateKeyHex) {
        return null;
      }

      // Convert hex string back to Uint8Array
      const privateKeyBytes = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );

      return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      console.error("Failed to retrieve wallet from secure storage:", error);
      return null;
    }
  }

  /**
   * Get public key without requiring authentication
   */
  static async getPublicKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(StorageKey.WALLET_PUBLIC_KEY, {
        keychainService: SecureStorageService.BLINK_WALLET,
      });
    } catch (error) {
      console.error("Failed to retrieve public key:", error);
      return null;
    }
  }

  /**
   * Check if wallet exists in secure storage
   */
  static async hasWallet(): Promise<boolean> {
    try {
      const publicKey = await this.getPublicKey();
      return publicKey !== null;
    } catch (error) {
      console.error("Failed to check wallet existence:", error);
      return false;
    }
  }

  /**
   * Remove wallet from secure storage
   */
  static async removeWallet(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PRIVATE_KEY, {
        keychainService: SecureStorageService.BLINK_WALLET,
      });
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PUBLIC_KEY, {
        keychainService: SecureStorageService.BLINK_WALLET,
      });
      return true;
    } catch (error) {
      console.error("Failed to remove wallet from secure storage:", error);
      return false;
    }
  }

  /**
   * Export private key (for backup purposes)
   * This will require authentication
   */
  static async exportPrivateKey(): Promise<string | null> {
    try {
      const privateKeyHex = await SecureStore.getItemAsync(
        StorageKey.WALLET_PRIVATE_KEY,
        {
          requireAuthentication: true,
          authenticationPrompt: AuthPrompt.EXPORT_PRIVATE_KEY,
          keychainService: SecureStorageService.BLINK_WALLET,
        }
      );

      return privateKeyHex;
    } catch (error) {
      console.error("Failed to export private key:", error);
      return null;
    }
  }

  /**
   * Check if secure storage is available on this device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Try to set and get a test value
      const testKey = StorageKey.TEST_KEY;
      const testValue = "test_value";

      await SecureStore.setItemAsync(testKey, testValue);
      const retrievedValue = await SecureStore.getItemAsync(testKey);
      await SecureStore.deleteItemAsync(testKey);

      return retrievedValue === testValue;
    } catch (error) {
      console.error("Secure storage not available:", error);
      return false;
    }
  }

  /**
   * Test secure storage with authentication
   */
  static async testWithAuth(): Promise<boolean> {
    try {
      const testKey = StorageKey.TEST_AUTH_KEY;
      const testValue = "test_auth_value";

      await SecureStore.setItemAsync(testKey, testValue, {
        requireAuthentication: true,
        authenticationPrompt: "Test authentication",
        keychainService: SecureStorageService.BLINK_WALLET,
      });

      const retrievedValue = await SecureStore.getItemAsync(testKey, {
        requireAuthentication: true,
        authenticationPrompt: "Test authentication",
        keychainService: SecureStorageService.BLINK_WALLET,
      });

      await SecureStore.deleteItemAsync(testKey);

      return retrievedValue === testValue;
    } catch (error) {
      console.error("Secure storage with auth test failed:", error);
      return false;
    }
  }

  /**
   * Debug function to check what's stored in secure storage
   */
  static async debugStorage(): Promise<void> {
    try {
      // Test basic storage/retrieval with keychain service
      const testKey = StorageKey.DEBUG_TEST_KEY;
      const testValue = "debug_test_value";

      try {
        await SecureStore.setItemAsync(testKey, testValue, {
          keychainService: SecureStorageService.BLINK_WALLET,
        });
        const retrievedTest = await SecureStore.getItemAsync(testKey, {
          keychainService: SecureStorageService.BLINK_WALLET,
        });
        console.log(
          "Basic test result:",
          retrievedTest === testValue ? "PASS" : "FAIL"
        );
        await SecureStore.deleteItemAsync(testKey, {
          keychainService: SecureStorageService.BLINK_WALLET,
        });
      } catch (error) {
        console.log("Basic test failed:", error);
      }

      // Check public key
      const publicKey = await SecureStore.getItemAsync(
        StorageKey.WALLET_PUBLIC_KEY,
        {
          keychainService: SecureStorageService.BLINK_WALLET,
        }
      );
      console.log("Public key stored:", publicKey ? "Yes" : "No");
      if (publicKey) {
        console.log("Public key value:", publicKey);
      }

      // Check if private key exists (without auth for debugging)
      try {
        const privateKeyNoAuth = await SecureStore.getItemAsync(
          StorageKey.WALLET_PRIVATE_KEY,
          {
            keychainService: SecureStorageService.BLINK_WALLET,
          }
        );
        console.log(
          "Private key exists (no auth):",
          privateKeyNoAuth ? "Yes" : "No"
        );
      } catch (error) {
        console.log("Private key requires authentication (expected)");
      }
    } catch (error) {
      console.error("Debug storage failed:", error);
    }
  }

  /**
   * Store multiple wallets securely
   */
  static async storeWallets(wallets: Wallet[]): Promise<boolean> {
    try {
      // Convert wallets to a serializable format
      const walletsData = wallets.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        publicKey: wallet.publicKey,
        balance: wallet.balance,
        createdAt: wallet.createdAt.toISOString(),
        // Store private key separately for security
        privateKeyHex: Array.from(wallet.keypair.secretKey)
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join(""),
      }));

      await SecureStore.setItemAsync(
        StorageKey.WALLETS_DATA,
        JSON.stringify(walletsData),
        {
          requireAuthentication: true,
          authenticationPrompt: AuthPrompt.ACCESS_WALLET,
          keychainService: SecureStorageService.BLINK_WALLET,
        }
      );

      return true;
    } catch (error) {
      console.error("Failed to store wallets securely:", error);
      return false;
    }
  }

  /**
   * Retrieve all wallets from secure storage
   */
  static async getWallets(): Promise<Wallet[]> {
    try {
      const walletsDataString = await SecureStore.getItemAsync(
        StorageKey.WALLETS_DATA,
        {
          requireAuthentication: true,
          authenticationPrompt: AuthPrompt.ACCESS_WALLET,
          keychainService: SecureStorageService.BLINK_WALLET,
        }
      );

      if (!walletsDataString) {
        return [];
      }

      const walletsData = JSON.parse(walletsDataString);

      // Convert back to Wallet objects with Keypair
      const wallets: Wallet[] = walletsData.map((data: any) => {
        const privateKeyBytes = new Uint8Array(
          data.privateKeyHex
            .match(/.{1,2}/g)!
            .map((byte: string) => parseInt(byte, 16))
        );
        const keypair = Keypair.fromSecretKey(privateKeyBytes);

        return {
          id: data.id,
          name: data.name,
          publicKey: data.publicKey,
          keypair,
          balance: data.balance,
          createdAt: new Date(data.createdAt),
        };
      });

      return wallets;
    } catch (error) {
      console.error("Failed to retrieve wallets from secure storage:", error);
      return [];
    }
  }

  /**
   * Remove all wallets from secure storage
   */
  static async removeWallets(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(StorageKey.WALLETS_DATA, {
        keychainService: SecureStorageService.BLINK_WALLET,
      });
      return true;
    } catch (error) {
      console.error("Failed to remove wallets from secure storage:", error);
      return false;
    }
  }
}
