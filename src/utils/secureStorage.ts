import * as SecureStore from "expo-secure-store";
import { Keypair } from "@solana/web3.js";
import {
  StorageKey,
  SecureStorageService,
  AuthPrompt,
} from "../constants/enums";

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
      return await SecureStore.getItemAsync(StorageKey.WALLET_PUBLIC_KEY);
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
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PRIVATE_KEY);
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PUBLIC_KEY);
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
}
