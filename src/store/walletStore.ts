import { create } from "zustand";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import { SecureWalletStorage } from "../utils/secureStorage";
import { SolanaNetwork, ConnectionCommitment } from "../constants/enums";

// Solana mainnet connection
const connection = new Connection(
  SolanaNetwork.MAINNET,
  ConnectionCommitment.CONFIRMED
);

export interface WalletState {
  // Wallet data
  keypair: Keypair | null;
  publicKey: string | null;
  balance: number;
  isConnected: boolean;
  isLoading: boolean;

  // Actions
  createNewWallet: () => Promise<boolean>;
  importWallet: (privateKey: string) => Promise<boolean>;
  loadWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  updateBalance: () => Promise<void>;
  exportPrivateKey: () => Promise<string | null>;
  exportSeedPhrase: () => Promise<string | null>;
  checkSecureStorage: () => Promise<boolean>;
  testSecureStorage: () => Promise<{ basicTest: boolean; authTest: boolean }>;
  debugStorage: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  // Initial state
  keypair: null,
  publicKey: null,
  balance: 0,
  isConnected: false,
  isLoading: false,

  // Create a new wallet
  createNewWallet: async () => {
    set({ isLoading: true });
    try {
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();

      // Verify the keypair is valid
      const testKeypair = Keypair.fromSecretKey(keypair.secretKey);
      const testPublicKey = testKeypair.publicKey.toString();
      if (testPublicKey !== publicKey) {
        throw new Error("Generated keypair validation failed");
      }

      // Store wallet securely
      const stored = await SecureWalletStorage.storeWallet(keypair);
      if (!stored) {
        throw new Error("Failed to store wallet securely");
      }

      set({
        keypair,
        publicKey,
        isConnected: true,
        balance: 0,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Import wallet from private key
  importWallet: async (privateKey: string) => {
    set({ isLoading: true });
    try {
      // Remove '0x' prefix if present
      const cleanPrivateKey = privateKey.replace("0x", "");

      // Convert hex string to Uint8Array
      const privateKeyBytes = new Uint8Array(
        cleanPrivateKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );

      const keypair = Keypair.fromSecretKey(privateKeyBytes);
      const publicKey = keypair.publicKey.toString();

      // Store wallet securely
      const stored = await SecureWalletStorage.storeWallet(keypair);
      if (!stored) {
        throw new Error("Failed to store wallet securely");
      }

      set({
        keypair,
        publicKey,
        isConnected: true,
        balance: 0,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Failed to import wallet:", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Load wallet from secure storage
  loadWallet: async () => {
    set({ isLoading: true });
    try {
      const keypair = await SecureWalletStorage.getWallet();
      if (!keypair) {
        set({ isLoading: false });
        return false;
      }

      const publicKey = keypair.publicKey.toString();

      set({
        keypair,
        publicKey,
        isConnected: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Failed to load wallet:", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Disconnect wallet
  disconnectWallet: async () => {
    set({ isLoading: true });
    try {
      await SecureWalletStorage.removeWallet();
      set({
        keypair: null,
        publicKey: null,
        balance: 0,
        isConnected: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      set({ isLoading: false });
    }
  },

  // Update balance from blockchain
  updateBalance: async () => {
    const { keypair } = get();
    if (!keypair) return;

    try {
      const balance = await connection.getBalance(keypair.publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      set({ balance: solBalance });
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  },

  // Export private key (for backup purposes)
  exportPrivateKey: async () => {
    try {
      return await SecureWalletStorage.exportPrivateKey();
    } catch (error) {
      console.error("Failed to export private key:", error);
      return null;
    }
  },

  // Export seed phrase (for backup purposes)
  exportSeedPhrase: async () => {
    try {
      // Get the private key from secure storage
      const privateKeyHex = await SecureWalletStorage.exportPrivateKey();
      if (!privateKeyHex) {
        return null;
      }

      // Convert hex string back to Uint8Array
      const privateKeyBytes = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );

      // Generate mnemonic from the private key
      // Note: This creates a mnemonic that can regenerate the same private key
      const seed = Buffer.from(privateKeyBytes.slice(0, 32)); // Use first 32 bytes for seed
      const mnemonic = bip39.entropyToMnemonic(seed.toString("hex"));

      return mnemonic;
    } catch (error) {
      console.error("Failed to export seed phrase:", error);
      return null;
    }
  },

  // Check if secure storage is available
  checkSecureStorage: async () => {
    try {
      return await SecureWalletStorage.isAvailable();
    } catch (error) {
      console.error("Failed to check secure storage:", error);
      return false;
    }
  },

  // Test secure storage functionality
  testSecureStorage: async () => {
    try {
      const basicTest = await SecureWalletStorage.isAvailable();
      const authTest = await SecureWalletStorage.testWithAuth();
      return { basicTest, authTest };
    } catch (error) {
      console.error("Failed to test secure storage:", error);
      return { basicTest: false, authTest: false };
    }
  },

  // Debug secure storage
  debugStorage: async () => {
    try {
      await SecureWalletStorage.debugStorage();
    } catch (error) {
      console.error("Failed to debug storage:", error);
    }
  },
}));
