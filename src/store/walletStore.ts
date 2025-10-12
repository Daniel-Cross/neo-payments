import { create } from "zustand";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
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
  checkSecureStorage: () => Promise<boolean>;
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

      // Store wallet securely
      const stored = await SecureWalletStorage.storeWallet(keypair);
      if (!stored) {
        throw new Error("Failed to store wallet securely");
      }

      const publicKey = keypair.publicKey.toString();

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

  // Check if secure storage is available
  checkSecureStorage: async () => {
    try {
      return await SecureWalletStorage.isAvailable();
    } catch (error) {
      console.error("Failed to check secure storage:", error);
      return false;
    }
  },
}));
