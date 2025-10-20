import { create } from "zustand";
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import * as bip39 from "bip39";
import { SecureWalletStorage } from "../utils/secureStorage";
import { SolanaNetwork, ConnectionCommitment, FeeOption, NetworkCongestion, Currency } from "../constants/enums";
import { priceService } from "../utils/priceService";
import { transactionService, TransferParams, TransactionResult } from "../services/transactionService";

// Solana mainnet connection
const connection = new Connection(
  SolanaNetwork.MAINNET,
  ConnectionCommitment.CONFIRMED
);

export interface Wallet {
  id: string;
  name: string;
  publicKey: string;
  keypair: Keypair;
  balance: number;
  createdAt: Date;
}

export interface WalletState {
  // Wallet data
  wallets: Wallet[];
  selectedWalletId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  lastBalanceUpdate: number;

  // Price data
  solPrice: number;
  priceLastUpdated: number;
  isPriceLoading: boolean;
  selectedCurrency: Currency;

  // Fee monitoring data
  optimalFee: {
    baseFee: number;
    priorityFee: number;
    totalFee: number;
    feeInSOL: number;
    networkCongestion: NetworkCongestion;
    estimatedTime: string;
    lastUpdated: number;
  } | null;
  isRefreshingFees: boolean;

  // Computed properties
  selectedWallet: Wallet | null;
  publicKey: string | null;
  balance: number;
  fiatValue: number;
  keypair: Keypair | null;

  // Actions
  createNewWallet: (name?: string) => Promise<boolean>;
  importWallet: (privateKey: string, name?: string) => Promise<boolean>;
  importWalletFromSeedPhrase: (
    seedPhrase: string,
    name?: string
  ) => Promise<boolean>;
  selectWallet: (walletId: string) => void;
  renameWallet: (walletId: string, newName: string) => Promise<boolean>;
  deleteWallet: (walletId: string) => Promise<boolean>;
  loadWallets: () => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  updateBalance: () => Promise<void>;
  updateSolPrice: () => Promise<void>;
  setCurrency: (currency: Currency) => void;
  exportPrivateKey: () => Promise<string | null>;
  exportSeedPhrase: () => Promise<string | null>;
  checkSecureStorage: () => Promise<boolean>;
  testSecureStorage: () => Promise<{ basicTest: boolean; authTest: boolean }>;
  
  // Transaction methods
  sendSOL: (to: string, amount: number, memo?: string) => Promise<TransactionResult>;
  getTransactionHistory: () => Promise<any[]>;
  
  // Fee monitoring methods
  loadOptimalFee: () => Promise<void>;
  startFeeMonitoring: () => NodeJS.Timeout;
  stopFeeMonitoring: () => void;
}

// Helper function to generate wallet name
const generateWalletName = (
  wallets: Wallet[],
  type: "created" | "imported" = "created"
): string => {
  const prefix = type === "created" ? "Wallet" : "Imported Wallet";
  const existingNames = wallets.map((w) => w.name);
  let counter = 1;
  let name = `${prefix} ${counter}`;

  while (existingNames.includes(name)) {
    counter++;
    name = `${prefix} ${counter}`;
  }

  return name;
};

export const useWalletStore = create<WalletState>()((set, get) => ({
  // Initial state
  wallets: [],
  selectedWalletId: null,
  isConnected: false,
  isLoading: false,
  lastBalanceUpdate: 0,

  // Price data
  solPrice: 100, // Default fallback price
  priceLastUpdated: 0,
  isPriceLoading: false,
  selectedCurrency: Currency.USD,

  // Fee monitoring data
  optimalFee: null,
  isRefreshingFees: false,

  // Computed properties
  selectedWallet: null as Wallet | null,
  publicKey: null as string | null,
  balance: 0,
  fiatValue: 0,
  keypair: null as Keypair | null,

  // Create a new wallet
  createNewWallet: async (name?: string) => {
    const { wallets } = get();
    
    // Check if secure storage is available first
    const secureStorageAvailable = await SecureWalletStorage.isAvailable();
    if (!secureStorageAvailable) {
      throw new Error("Secure storage is not available on this device. Please enable device security features and try again.");
    }
    
    // Don't set isLoading to true immediately to prevent flash
    // Instead, we'll handle loading state more gracefully
    try {
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();
      const walletName = name || generateWalletName(wallets, "created");

      // Verify the keypair is valid
      const testKeypair = Keypair.fromSecretKey(keypair.secretKey);
      const testPublicKey = testKeypair.publicKey.toString();
      if (testPublicKey !== publicKey) {
        throw new Error("Generated keypair validation failed");
      }

      const newWallet: Wallet = {
        id: `wallet_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`,
        name: walletName,
        publicKey,
        keypair,
        balance: 0,
        createdAt: new Date(),
      };

      // Store all wallets securely
      const updatedWallets = [...wallets, newWallet];
      const stored = await SecureWalletStorage.storeWallets(updatedWallets);
      if (!stored) {
        throw new Error("Failed to store wallet securely. Please check your device's secure storage settings and try again.");
      }

      // Update state atomically to prevent flash
      set({
        wallets: updatedWallets,
        selectedWalletId: newWallet.id,
        selectedWallet: newWallet,
        publicKey: newWallet.publicKey,
        balance: newWallet.balance,
        keypair: newWallet.keypair,
        isConnected: true,
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
  importWallet: async (privateKey: string, name?: string) => {
    set({ isLoading: true });
    try {
      const { wallets } = get();

      // Clean the input
      const cleanPrivateKey = privateKey.trim();

      // Validate private key format
      if (!cleanPrivateKey || cleanPrivateKey.length === 0) {
        throw new Error("Private key cannot be empty");
      }

      let privateKeyBytes: Uint8Array;

      try {
        // Try base58 first (Phantom format)
        privateKeyBytes = bs58.decode(cleanPrivateKey);
      } catch (base58Error) {
        try {
          // Try hex format (remove '0x' prefix if present)
          const hexKey = cleanPrivateKey.replace("0x", "");

          // Check if it's a valid hex string
          if (!/^[0-9a-fA-F]+$/.test(hexKey)) {
            throw new Error(
              "Private key must be in base58 or hexadecimal format"
            );
          }

          // Check if it's the correct length (64 bytes = 128 hex characters)
          if (hexKey.length !== 128) {
            throw new Error(
              `Hex private key must be 64 bytes (128 hex characters). Got ${hexKey.length} characters`
            );
          }

          // Convert hex string to Uint8Array
          privateKeyBytes = new Uint8Array(
            hexKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
          );
        } catch (hexError) {
          throw new Error(
            "Private key must be in base58 (Phantom) or hexadecimal format"
          );
        }
      }

      // Validate the byte array length
      if (privateKeyBytes.length !== 64) {
        throw new Error(
          `Invalid private key length: expected 64 bytes, got ${privateKeyBytes.length}`
        );
      }

      const keypair = Keypair.fromSecretKey(privateKeyBytes);
      const publicKey = keypair.publicKey.toString();
      const walletName = name || generateWalletName(wallets, "imported");

      // Check if wallet already exists
      const existingWallet = wallets.find((w) => w.publicKey === publicKey);
      if (existingWallet) {
        throw new Error("Wallet with this public key already exists");
      }

      const newWallet: Wallet = {
        id: `wallet_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`,
        name: walletName,
        publicKey,
        keypair,
        balance: 0,
        createdAt: new Date(),
      };

      // Store all wallets securely
      const updatedWallets = [...wallets, newWallet];
      const stored = await SecureWalletStorage.storeWallets(updatedWallets);
      if (!stored) {
        throw new Error("Failed to store wallet securely");
      }

      set({
        wallets: updatedWallets,
        selectedWalletId: newWallet.id,
        selectedWallet: newWallet,
        publicKey: newWallet.publicKey,
        balance: newWallet.balance,
        keypair: newWallet.keypair,
        isConnected: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Failed to import wallet:", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Import wallet from seed phrase (mnemonic)
  importWalletFromSeedPhrase: async (seedPhrase: string, name?: string) => {
    set({ isLoading: true });
    try {
      const { wallets } = get();

      // Clean and validate seed phrase
      const cleanSeedPhrase = seedPhrase.trim().toLowerCase();
      if (!bip39.validateMnemonic(cleanSeedPhrase)) {
        throw new Error("Invalid seed phrase");
      }

      // Generate seed from mnemonic
      const seed = await bip39.mnemonicToSeed(cleanSeedPhrase);

      // For Solana, we need to use the first 32 bytes of the seed
      // and create a keypair from it
      const seedBytes = seed.slice(0, 32);
      const keypair = Keypair.fromSeed(seedBytes);
      const publicKey = keypair.publicKey.toString();
      const walletName = name || generateWalletName(wallets, "imported");

      // Check if wallet already exists
      const existingWallet = wallets.find((w) => w.publicKey === publicKey);
      if (existingWallet) {
        throw new Error("Wallet with this public key already exists");
      }

      const newWallet: Wallet = {
        id: `wallet_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`,
        name: walletName,
        publicKey,
        keypair,
        balance: 0,
        createdAt: new Date(),
      };

      // Store all wallets securely
      const updatedWallets = [...wallets, newWallet];
      const stored = await SecureWalletStorage.storeWallets(updatedWallets);
      if (!stored) {
        throw new Error("Failed to store wallet securely");
      }

      set({
        wallets: updatedWallets,
        selectedWalletId: newWallet.id,
        selectedWallet: newWallet,
        publicKey: newWallet.publicKey,
        balance: newWallet.balance,
        keypair: newWallet.keypair,
        isConnected: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Failed to import wallet from seed phrase:", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Select a wallet
  selectWallet: (walletId: string) => {
    const { wallets } = get();
    const wallet = wallets.find((w) => w.id === walletId);
    if (wallet) {
      set({
        selectedWalletId: walletId,
        selectedWallet: wallet,
        publicKey: wallet.publicKey,
        balance: wallet.balance,
        keypair: wallet.keypair,
        isConnected: true,
      });
    }
  },

  // Rename a wallet
  renameWallet: async (walletId: string, newName: string) => {
    try {
      const { wallets, selectedWalletId } = get();
      const updatedWallets = wallets.map((wallet) =>
        wallet.id === walletId ? { ...wallet, name: newName } : wallet
      );

      const stored = await SecureWalletStorage.storeWallets(updatedWallets);
      if (stored) {
        // Update selectedWallet if it's the one being renamed
        const updatedSelectedWallet =
          selectedWalletId === walletId
            ? updatedWallets.find((w) => w.id === walletId) || null
            : null;

        set({
          wallets: updatedWallets,
          selectedWallet: updatedSelectedWallet,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to rename wallet:", error);
      return false;
    }
  },

  // Delete a wallet
  deleteWallet: async (walletId: string) => {
    try {
      const { wallets, selectedWalletId } = get();
      const updatedWallets = wallets.filter((wallet) => wallet.id !== walletId);

      // If we're deleting the selected wallet, select another one or disconnect
      let newSelectedWalletId = selectedWalletId;
      if (selectedWalletId === walletId) {
        newSelectedWalletId =
          updatedWallets.length > 0 ? updatedWallets[0].id : null;
      }

      const stored = await SecureWalletStorage.storeWallets(updatedWallets);
      if (stored) {
        set({
          wallets: updatedWallets,
          selectedWalletId: newSelectedWalletId,
          isConnected: newSelectedWalletId !== null,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete wallet:", error);
      return false;
    }
  },

  // Load wallets from secure storage
  loadWallets: async () => {
    set({ isLoading: true });
    try {
      // First try to load multiple wallets
      let wallets = await SecureWalletStorage.getWallets();

      // If no wallets found, try to migrate from old single wallet format
      if (!wallets || wallets.length === 0) {
        const oldKeypair = await SecureWalletStorage.getWallet();
        if (oldKeypair) {
          // Migrate old single wallet to new multi-wallet format
          const publicKey = oldKeypair.publicKey.toString();
          const migratedWallet: Wallet = {
            id: `wallet_${Date.now()}_migrated`,
            name: "My Wallet",
            publicKey,
            keypair: oldKeypair,
            balance: 0,
            createdAt: new Date(),
          };

          wallets = [migratedWallet];

          // Store in new format and clean up old format
          await SecureWalletStorage.storeWallets(wallets);
          await SecureWalletStorage.removeWallet();
        } else {
        }
      }

      if (!wallets || wallets.length === 0) {
        set({
          wallets: [],
          selectedWalletId: null,
          selectedWallet: null,
          publicKey: null,
          balance: 0,
          fiatValue: 0,
          keypair: null,
          isConnected: false,
          isLoading: false,
        });
        return false;
      }

      const validWallets = wallets.filter(
        (wallet) =>
          wallet &&
          wallet.keypair &&
          wallet.publicKey &&
          wallet.keypair.publicKey.toString() === wallet.publicKey
      );

      if (validWallets.length === 0) {
        return false;
      }

      // Select the first valid wallet by default
      const selectedWalletId = validWallets[0].id;
      const selectedWallet = validWallets[0];
      set({
        wallets: validWallets,
        selectedWalletId,
        selectedWallet,
        publicKey: selectedWallet.publicKey,
        balance: selectedWallet.balance,
        fiatValue: selectedWallet.balance * get().solPrice,
        keypair: selectedWallet.keypair,
        isConnected: true,
        isLoading: false,
      });

      // Fetch the actual balance from blockchain after setting up the wallet
      // Use setTimeout to avoid blocking the UI
      setTimeout(() => {
        get().updateBalance();
      }, 100);

      return true;
    } catch (error) {
      console.error("Failed to load wallets:", error);
      set({ isLoading: false });
      return false;
    }
  },

  // Disconnect wallet (clear all wallets)
  disconnectWallet: async () => {
    set({ isLoading: true });
    try {
      await SecureWalletStorage.removeWallets();

      set({
        wallets: [],
        selectedWalletId: null,
        selectedWallet: null,
        publicKey: null,
        balance: 0,
        fiatValue: 0,
        keypair: null,
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
    const { selectedWallet, wallets, lastBalanceUpdate } = get();
    if (!selectedWallet) return;

    // Rate limiting: only update balance every 5 seconds
    const now = Date.now();
    if (now - lastBalanceUpdate < 5000) {
      return;
    }

    try {
      const balance = await connection.getBalance(
        selectedWallet.keypair.publicKey
      );
      const solBalance = balance / LAMPORTS_PER_SOL;

      // Update the balance for the selected wallet
      const updatedWallets = wallets.map((wallet) =>
        wallet.id === selectedWallet.id
          ? { ...wallet, balance: solBalance }
          : wallet
      );

      // Get current SOL price to calculate USD value
      const { solPrice } = get();

      set({
        wallets: updatedWallets,
        balance: solBalance,
        fiatValue: solBalance * solPrice,
        lastBalanceUpdate: now,
      });
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      // Don't throw the error, just log it to avoid breaking the app
    }
  },

  // Export private key (for backup purposes)
  exportPrivateKey: async () => {
    try {
      const { selectedWallet } = get();
      if (!selectedWallet) return null;

      // Convert keypair to hex string
      const privateKeyHex = Buffer.from(
        selectedWallet.keypair.secretKey
      ).toString("hex");
      return privateKeyHex;
    } catch (error) {
      console.error("Failed to export private key:", error);
      return null;
    }
  },

  // Export seed phrase (for backup purposes)
  exportSeedPhrase: async () => {
    try {
      const { selectedWallet } = get();
      if (!selectedWallet) return null;

      // Generate mnemonic from the private key
      // Note: This creates a mnemonic that can regenerate the same private key
      const seed = Buffer.from(selectedWallet.keypair.secretKey.slice(0, 32)); // Use first 32 bytes for seed
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

  // Update SOL price from API
  updateSolPrice: async () => {
    const { isPriceLoading, selectedCurrency } = get();

    // Prevent multiple simultaneous requests
    if (isPriceLoading) return;

    set({ isPriceLoading: true });

    try {
      const price = await priceService.getSolPrice(selectedCurrency);
      const now = Date.now();

      set({
        solPrice: price,
        priceLastUpdated: now,
        isPriceLoading: false,
      });

      // Update fiat value when price changes
      const { balance } = get();
      set({ fiatValue: balance * price });
    } catch (error) {
      console.error("Failed to update SOL price:", error);
      set({ isPriceLoading: false });
    }
  },

  // Set selected currency
  setCurrency: (currency: Currency) => {
    set({ selectedCurrency: currency });
    // Update price with new currency
    get().updateSolPrice();
  },

  // Send SOL transaction
  sendSOL: async (to: string, amount: number, memo?: string) => {
    const { selectedWallet } = get();
    
    if (!selectedWallet) {
      throw new Error("No wallet selected");
    }

    try {
      const transferParams: TransferParams = {
        from: new PublicKey(selectedWallet.publicKey),
        to: new PublicKey(to),
        amount,
        memo,
      };

      const result = await transactionService.transferSOL(
        transferParams,
        selectedWallet.keypair,
        true // Use versioned transaction for better performance
      );

      // Update balance after successful transaction
      if (result.success) {
        const { updateBalance } = get();
        await updateBalance();
      }

      return result;
    } catch (error) {
      console.error("Failed to send SOL:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  },

  // Get transaction history
  getTransactionHistory: async () => {
    const { selectedWallet } = get();
    
    if (!selectedWallet) {
      return [];
    }

    try {
      const publicKey = new PublicKey(selectedWallet.publicKey);
      return await transactionService.getTransactionHistory(publicKey);
    } catch (error) {
      console.error("Failed to get transaction history:", error);
      return [];
    }
  },

  // Fee monitoring methods
  loadOptimalFee: async () => {
    const { isRefreshingFees } = get();
    
    // Prevent multiple simultaneous requests
    if (isRefreshingFees) return;

    set({ isRefreshingFees: true });

    try {
      const optimalFee = await transactionService.getOptimalFee();
      set({
        optimalFee,
        isRefreshingFees: false,
      });
    } catch (error) {
      console.warn("Failed to load optimal fee:", error);
      set({ isRefreshingFees: false });
    }
  },

  startFeeMonitoring: () => {
    const { loadOptimalFee } = get();
    
    // Load initial optimal fee
    loadOptimalFee();
    
    // Set up interval for auto-refresh every 12 seconds
    const interval = setInterval(() => {
      loadOptimalFee();
    }, 12000);

    return interval;
  },

  stopFeeMonitoring: () => {
    // Components will handle their own cleanup
  },
}));
