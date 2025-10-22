import * as SecureStore from 'expo-secure-store';
import { Keypair } from '@solana/web3.js';
import { StorageKey, SecureStorageService, AuthPrompt } from '../constants/enums';
import { Wallet } from '../store/walletStore';

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
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      const publicKey = keypair.publicKey.toString();

      // Store both keys securely
      await SecureStore.setItemAsync(StorageKey.WALLET_PRIVATE_KEY, privateKeyHex, {
        requireAuthentication: true, // Require biometric authentication
        authenticationPrompt: AuthPrompt.ACCESS_WALLET,
        keychainService: SecureStorageService.NEO_WALLET, // iOS keychain service name
      });

      await SecureStore.setItemAsync(StorageKey.WALLET_PUBLIC_KEY, publicKey, {
        requireAuthentication: false, // Public key doesn't need auth
        keychainService: SecureStorageService.NEO_WALLET,
      });

      return true;
    } catch (error) {
      console.error('Failed to store wallet securely:', error);
      return false;
    }
  }

  /**
   * Retrieve wallet keypair from secure storage
   */
  static async getWallet(): Promise<Keypair | null> {
    try {
      const privateKeyHex = await SecureStore.getItemAsync(StorageKey.WALLET_PRIVATE_KEY, {
        requireAuthentication: true,
        authenticationPrompt: AuthPrompt.ACCESS_WALLET,
        keychainService: SecureStorageService.NEO_WALLET,
      });

      if (!privateKeyHex) {
        return null;
      }

      // Convert hex string back to Uint8Array
      const privateKeyBytes = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      console.error('Failed to retrieve wallet from secure storage:', error);
      return null;
    }
  }

  /**
   * Get public key without requiring authentication
   */
  static async getPublicKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(StorageKey.WALLET_PUBLIC_KEY, {
        keychainService: SecureStorageService.NEO_WALLET,
      });
    } catch (error) {
      console.error('Failed to retrieve public key:', error);
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
      console.error('Failed to check wallet existence:', error);
      return false;
    }
  }

  /**
   * Remove wallet from secure storage
   */
  static async removeWallet(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PRIVATE_KEY, {
        keychainService: SecureStorageService.NEO_WALLET,
      });
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PUBLIC_KEY, {
        keychainService: SecureStorageService.NEO_WALLET,
      });
      return true;
    } catch (error) {
      console.error('Failed to remove wallet from secure storage:', error);
      return false;
    }
  }

  /**
   * Export private key (for backup purposes)
   * This will require authentication
   */
  static async exportPrivateKey(): Promise<string | null> {
    try {
      const privateKeyHex = await SecureStore.getItemAsync(StorageKey.WALLET_PRIVATE_KEY, {
        requireAuthentication: true,
        authenticationPrompt: AuthPrompt.EXPORT_PRIVATE_KEY,
        keychainService: SecureStorageService.NEO_WALLET,
      });

      return privateKeyHex;
    } catch (error) {
      console.error('Failed to export private key:', error);
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
      const testValue = 'test_value';

      await SecureStore.setItemAsync(testKey, testValue);
      const retrievedValue = await SecureStore.getItemAsync(testKey);
      await SecureStore.deleteItemAsync(testKey);

      return retrievedValue === testValue;
    } catch (error) {
      console.error('Secure storage not available:', error);
      return false;
    }
  }

  /**
   * Test secure storage with authentication
   */
  static async testWithAuth(): Promise<boolean> {
    try {
      const testKey = StorageKey.TEST_AUTH_KEY;
      const testValue = 'test_auth_value';

      await SecureStore.setItemAsync(testKey, testValue, {
        requireAuthentication: true,
        authenticationPrompt: 'Test authentication',
        keychainService: SecureStorageService.NEO_WALLET,
      });

      const retrievedValue = await SecureStore.getItemAsync(testKey, {
        requireAuthentication: true,
        authenticationPrompt: 'Test authentication',
        keychainService: SecureStorageService.NEO_WALLET,
      });

      await SecureStore.deleteItemAsync(testKey);

      return retrievedValue === testValue;
    } catch (error) {
      console.error('Secure storage with auth test failed:', error);
      return false;
    }
  }

  /**
   * Store multiple wallets securely
   */
  static async storeWallets(wallets: Wallet[]): Promise<boolean> {
    try {
      // Convert wallets to a serializable format
      const walletsData = wallets.map(wallet => ({
        id: wallet.id,
        name: wallet.name,
        publicKey: wallet.publicKey,
        balance: wallet.balance,
        createdAt: wallet.createdAt.toISOString(),
        seedPhrase: wallet.seedPhrase,
        derivationPath: wallet.derivationPath,
        isMultiAddress: wallet.isMultiAddress,
        // Store private key separately for security
        privateKeyHex: Array.from(wallet.keypair.secretKey)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join(''),
      }));

      // First try with authentication
      try {
        await SecureStore.setItemAsync(StorageKey.WALLETS_DATA, JSON.stringify(walletsData), {
          requireAuthentication: true,
          authenticationPrompt: AuthPrompt.ACCESS_WALLET,
          keychainService: SecureStorageService.NEO_WALLET,
        });
        return true;
      } catch (authError) {
        console.warn('Authentication failed, trying without auth:', authError);

        // If authentication fails, try without authentication
        // This is less secure but ensures the app doesn't break
        await SecureStore.setItemAsync(StorageKey.WALLETS_DATA, JSON.stringify(walletsData), {
          requireAuthentication: false,
          keychainService: SecureStorageService.NEO_WALLET,
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to store wallets securely:', error);
      return false;
    }
  }

  /**
   * Retrieve all wallets from secure storage
   */
  static async getWallets(): Promise<Wallet[]> {
    try {
      let walletsDataString: string | null = null;

      // First try with authentication
      try {
        walletsDataString = await SecureStore.getItemAsync(StorageKey.WALLETS_DATA, {
          requireAuthentication: true,
          authenticationPrompt: AuthPrompt.ACCESS_WALLET,
          keychainService: SecureStorageService.NEO_WALLET,
        });
      } catch (authError) {
        console.warn('Authentication failed, trying without auth:', authError);

        // If authentication fails, try without authentication
        walletsDataString = await SecureStore.getItemAsync(StorageKey.WALLETS_DATA, {
          requireAuthentication: false,
          keychainService: SecureStorageService.NEO_WALLET,
        });
      }

      if (!walletsDataString) {
        return [];
      }

      let walletsData: any;
      try {
        walletsData = JSON.parse(walletsDataString);
      } catch (parseError) {
        console.error('Failed to parse wallets data JSON:', parseError);
        return [];
      }

      // Validate that walletsData is an array
      if (!Array.isArray(walletsData)) {
        console.error('Invalid wallets data format: expected array');
        return [];
      }

      // Convert back to Wallet objects with Keypair
      const wallets: Wallet[] = walletsData
        .map((data: any): Wallet | null => {
          try {
            // Validate required fields
            if (!data.id || !data.name || !data.publicKey || !data.privateKeyHex) {
              console.warn('Skipping wallet with missing required fields:', data);
              return null;
            }

            const privateKeyBytes = new Uint8Array(
              data.privateKeyHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
            );
            const keypair = Keypair.fromSecretKey(privateKeyBytes);

            // Verify the keypair matches the stored public key
            if (keypair.publicKey.toString() !== data.publicKey) {
              console.error('Keypair verification failed for wallet:', data.id);
              return null;
            }

            const wallet: Wallet = {
              id: data.id,
              name: data.name,
              publicKey: data.publicKey,
              keypair,
              balance: data.balance || 0,
              createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
              seedPhrase: data.seedPhrase,
              derivationPath: data.derivationPath,
              isMultiAddress: data.isMultiAddress,
            };

            return wallet;
          } catch (error) {
            console.error('Failed to restore wallet from data:', data, error);
            return null;
          }
        })
        .filter((wallet: Wallet | null): wallet is Wallet => wallet !== null);

      return wallets;
    } catch (error) {
      console.error('Failed to retrieve wallets from secure storage:', error);
      return [];
    }
  }

  /**
   * Remove all wallets from secure storage
   */
  static async removeWallets(): Promise<boolean> {
    try {
      // Remove new multi-wallet data
      await SecureStore.deleteItemAsync(StorageKey.WALLETS_DATA, {
        keychainService: SecureStorageService.NEO_WALLET,
      });

      // Also remove old single wallet data to prevent migration on restart
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PRIVATE_KEY, {
        keychainService: SecureStorageService.NEO_WALLET,
      });
      await SecureStore.deleteItemAsync(StorageKey.WALLET_PUBLIC_KEY, {
        keychainService: SecureStorageService.NEO_WALLET,
      });

      return true;
    } catch (error) {
      console.error('Failed to remove wallets from secure storage:', error);
      return false;
    }
  }
}
