// Import crypto initialization first
import '../utils/cryptoInit';

import {
  SolanaNetwork,
  ConnectionCommitment,
  NetworkCongestion,
  SOLANA_RPC_ENDPOINTS,
} from '../constants/enums';
import {
  calculateTotalCost,
  getFeeWalletAddress,
  isFeeWalletConfigured,
} from '../utils/walletHelpers';
import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';
import { encodeBase64, decodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util';

// Verify polyfills are loaded before importing Solana
if (typeof global.Buffer === 'undefined') {
  throw new Error('CRITICAL: Buffer polyfill not loaded! Polyfills must be imported first.');
}

// Import Solana Web3.js AFTER polyfill verification
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  SendOptions,
  VersionedTransaction,
  AddressLookupTableAccount,
  TransactionMessage,
  Keypair,
} from '@solana/web3.js';

// Official Solana Memo Program v1
// https://spl.solana.com/memo
// Lazy-initialize to avoid crashes during module loading
let MEMO_PROGRAM_ID: PublicKey | null = null;
const getMemoProgram = (): PublicKey => {
  if (!MEMO_PROGRAM_ID) {
    try {
      MEMO_PROGRAM_ID = new PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo');
    } catch (error) {
      console.error('CRITICAL: Failed to create Memo Program PublicKey:', error);
      throw new Error('Failed to initialize Memo Program. Please restart the app.');
    }
  }
  return MEMO_PROGRAM_ID;
};

// Lazy-initialize connection to avoid crashes during module loading
const createConnection = (network: SolanaNetwork = SolanaNetwork.MAINNET): Connection => {
  try {
    // Use the first endpoint for now, we'll add fallback logic later
    const endpoint = network === SolanaNetwork.MAINNET ? SOLANA_RPC_ENDPOINTS[0] : network;

    return new Connection(endpoint, {
      commitment: ConnectionCommitment.CONFIRMED,
      confirmTransactionInitialTimeout: 60000, // 60 seconds
      disableRetryOnRateLimit: false,
      httpHeaders: {
        'User-Agent': 'Neo-Payments-Wallet/1.0',
      },
    });
  } catch (error) {
    console.error('CRITICAL: Failed to create Solana connection:', error);
    throw new Error('Failed to initialize Solana connection. Please restart the app.');
  }
};

export interface TransferParams {
  from: PublicKey;
  to: PublicKey;
  amount: number; // in SOL (will be converted to lamports)
  memo?: string;
  includePlatformFee?: boolean; // Whether to include platform fee (default: true)
}

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  slot?: number;
  confirmationTime?: number;
}

export interface TransactionFeeEstimate {
  fee: number; // in lamports
  feeInSOL: number;
  priorityFee?: number; // in lamports
}

export interface TransactionDetails {
  signature: string;
  slot: number;
  blockTime: number;
  fee: number;
  from: string;
  to: string;
  amount: number;
  status: 'success' | 'failed';
  memo?: string;
}

export class TransactionService {
  private static instance: TransactionService;
  private connection: Connection;

  constructor() {
    // Lazy-initialize connection only when needed
    this.connection = createConnection();
  }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  /**
   * Switch network (useful for testing on devnet)
   */
  public switchNetwork(network: SolanaNetwork): void {
    this.connection = createConnection(network);
  }

  /**
   * Try different RPC endpoints for better reliability
   */
  private async tryWithFallbackEndpoints<T>(
    operation: (connection: Connection) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < Math.min(maxRetries, SOLANA_RPC_ENDPOINTS.length); i++) {
      try {
        const endpoint = SOLANA_RPC_ENDPOINTS[i];
        const connection = new Connection(endpoint, {
          commitment: ConnectionCommitment.CONFIRMED,
          confirmTransactionInitialTimeout: 60000,
          disableRetryOnRateLimit: false,
          httpHeaders: {
            'User-Agent': 'Neo-Payments-Wallet/1.0',
          },
        });

        return await operation(connection);
      } catch (error) {
        lastError = error as Error;

        // If this is the last attempt, don't wait
        if (i < Math.min(maxRetries, SOLANA_RPC_ENDPOINTS.length) - 1) {
          // Simple delay between endpoint attempts
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError || new Error('All RPC endpoints failed');
  }

  /**
   * Get current network connection
   */
  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Create a basic SOL transfer transaction
   */
  public async createTransferTransaction(params: TransferParams): Promise<Transaction> {
    const { from, to, amount, memo } = params;

    // Convert SOL to lamports
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    if (lamports <= 0) {
      throw new Error('Transfer amount must be greater than 0');
    }

    // Create the transaction
    const transaction = new Transaction();

    // Add the transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports,
    });

    transaction.add(transferInstruction);

    // Add memo if provided
    if (memo) {
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: getMemoProgram(),
        data: Buffer.from(memo, 'utf8'),
      });
      transaction.add(memoInstruction);
    }

    return transaction;
  }

  /**
   * Create a versioned transaction (more efficient, newer format)
   * This is the production-ready implementation using TransactionMessage.compileV0()
   */
  public async createVersionedTransferTransaction(
    params: TransferParams,
    lookupTableAccounts?: AddressLookupTableAccount[]
  ): Promise<VersionedTransaction> {
    const { from, to, amount, memo } = params;

    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    if (lamports <= 0) {
      throw new Error('Transfer amount must be greater than 0');
    }

    // Create instructions
    const instructions: TransactionInstruction[] = [
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports,
      }),
    ];

    // Add memo if provided
    if (memo) {
      instructions.push(
        new TransactionInstruction({
          keys: [],
          programId: getMemoProgram(),
          data: Buffer.from(memo, 'utf8'),
        })
      );
    }

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');

    // Create versioned transaction message
    const messageV0 = new TransactionMessage({
      payerKey: from,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message(lookupTableAccounts);

    return new VersionedTransaction(messageV0);
  }

  /**
   * Sign a transaction with the provided keypair
   */
  public signTransaction(
    transaction: Transaction | VersionedTransaction,
    signer: Keypair
  ): Transaction | VersionedTransaction {
    if (transaction instanceof VersionedTransaction) {
      transaction.sign([signer]);
    } else {
      transaction.sign(signer);
    }
    return transaction;
  }

  /**
   * Send a signed transaction to the blockchain with retry logic
   */
  public async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    options?: SendOptions,
    maxRetries: number = 3
  ): Promise<TransactionResult> {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let signature: string;

        // Handle different transaction types
        if (transaction instanceof VersionedTransaction) {
          signature = await this.connection.sendTransaction(transaction, options);
        } else {
          // For legacy Transaction, use sendRawTransaction with serialized transaction
          signature = await this.connection.sendRawTransaction(transaction.serialize(), options);
        }

        // Wait for confirmation with timeout
        // Get the latest blockhash for confirmation
        const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');
        const confirmation = await this.connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed'
        );

        const confirmationTime = Date.now() - startTime;

        if (confirmation.value.err) {
          return {
            success: false,
            signature,
            error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
            slot: confirmation.context.slot,
            confirmationTime,
          };
        }

        return {
          success: true,
          signature,
          slot: confirmation.context.slot,
          confirmationTime,
        };
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        if (isLastAttempt) {
          return {
            success: false,
            error: `Transaction failed after ${maxRetries} attempts: ${errorMessage}`,
          };
        }

        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.warn(
          `Transaction attempt ${attempt} failed, retrying in ${delay}ms:`,
          errorMessage
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: 'Transaction failed after all retry attempts',
    };
  }

  /**
   * Complete flow: create, sign, and send a transaction
   */
  public async transferSOL(
    params: TransferParams,
    signer: Keypair,
    useVersioned: boolean = true // Default to versioned transactions for better performance
  ): Promise<TransactionResult> {
    try {
      let transaction: Transaction | VersionedTransaction;

      if (useVersioned) {
        // Create versioned transaction with proper blockhash
        transaction = await this.createVersionedTransferTransaction(params);
      } else {
        // Create legacy transaction
        transaction = await this.createTransferTransaction(params);

        // Set recent blockhash for legacy transaction
        const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = params.from;
      }

      // Sign the transaction
      const signedTransaction = this.signTransaction(transaction, signer);

      // Send the transaction
      const result = await this.sendTransaction(signedTransaction);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Estimate transaction fees using proper simulation
   */
  public async estimateTransactionFee(
    transaction: Transaction | VersionedTransaction
  ): Promise<TransactionFeeEstimate> {
    try {
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');

      if (transaction instanceof Transaction) {
        transaction.recentBlockhash = blockhash;
      }

      // Simulate the transaction to get fee estimate
      let simulation;
      if (transaction instanceof VersionedTransaction) {
        simulation = await this.connection.simulateTransaction(transaction);
      } else {
        simulation = await this.connection.simulateTransaction(transaction);
      }

      if (simulation.value.err) {
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      // Get the actual fee from simulation (use default if not available)
      const fee = 5000; // Default fee in lamports

      // Get current priority fee rate
      const priorityFeeRate = await this.getCurrentFeeRate();

      return {
        fee,
        feeInSOL: fee / LAMPORTS_PER_SOL,
        priorityFee: priorityFeeRate,
      };
    } catch (error) {
      console.warn('Fee estimation failed, using default:', error);
      // Return default fee estimate if simulation fails
      const defaultFee = 5000; // 0.000005 SOL
      return {
        fee: defaultFee,
        feeInSOL: defaultFee / LAMPORTS_PER_SOL,
        priorityFee: 0,
      };
    }
  }

  /**
   * Get transaction history for an address with fallback endpoints
   */
  public async getTransactionHistory(
    address: PublicKey,
    limit: number = 10
  ): Promise<TransactionDetails[]> {
    try {
      return await this.tryWithFallbackEndpoints(async connection => {
        const signatures = await connection.getSignaturesForAddress(address, { limit });
        const transactions: TransactionDetails[] = [];

        // Extract signature strings for batch fetching
        const signatureStrings = signatures.map(sig => sig.signature);

        // Fetch all transactions in a single batch call (more efficient)
        const txs = await connection.getTransactions(signatureStrings, {
          maxSupportedTransactionVersion: 0,
        });

        // Process the batch results
        for (let i = 0; i < signatures.length; i++) {
          const sigInfo = signatures[i];
          const tx = txs[i]; // Get corresponding transaction

          if (tx && tx.meta) {
            // Parse transaction details
            const transactionDetails: TransactionDetails = {
              signature: sigInfo.signature,
              slot: sigInfo.slot,
              blockTime: sigInfo.blockTime || 0,
              fee: tx.meta.fee,
              from: '', // Will be parsed from transaction
              to: '', // Will be parsed from transaction
              amount: 0, // Will be calculated
              status: tx.meta.err ? 'failed' : 'success',
            };

            // Parse transfer details with proper handling for both legacy and versioned transactions
            try {
              const message = tx.transaction.message;
              let accountKeys: PublicKey[];

              // Get account keys based on transaction type
              if ('accountKeys' in message) {
                // Legacy transaction
                accountKeys = message.accountKeys;
              } else {
                // Versioned transaction - convert to array
                const accountKeysResult = message.getAccountKeys();
                accountKeys = [];
                for (let j = 0; j < accountKeysResult.length; j++) {
                  const key = accountKeysResult.get(j);
                  if (key) {
                    accountKeys.push(key);
                  }
                }
              }

              // Calculate amount from balance changes
              if (tx.meta.preBalances && tx.meta.postBalances && accountKeys.length >= 2) {
                const balanceChange = tx.meta.preBalances[0] - tx.meta.postBalances[0];
                if (balanceChange > 0) {
                  transactionDetails.amount = balanceChange / LAMPORTS_PER_SOL;
                  transactionDetails.from = accountKeys[0].toString();
                  transactionDetails.to = accountKeys[1].toString();
                }
              }

              // Parse memo if present
              if (tx.meta.logMessages) {
                for (const log of tx.meta.logMessages) {
                  if (log.includes('Program log: ')) {
                    const memoMatch = log.match(/Program log: (.+)/);
                    if (memoMatch && memoMatch[1]) {
                      const rawMemo = memoMatch[1];
                      // Try to decode the memo (it might be base64 encoded)
                      try {
                        // Check if it's base64 encoded
                        if (this.isBase64(rawMemo)) {
                          const decoded = Buffer.from(rawMemo, 'base64').toString('utf-8');
                          transactionDetails.memo = decoded;
                        } else {
                          transactionDetails.memo = rawMemo;
                        }
                      } catch (decodeError) {
                        // If decoding fails, use raw memo
                        transactionDetails.memo = rawMemo;
                      }
                      break;
                    }
                  }
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse transaction details:', parseError);
            }

            transactions.push(transactionDetails);
          }
        }

        return transactions;
      });
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Helper method to check if a string is base64 encoded
   */
  private isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get current network fee rate with fallback endpoints
   */
  public async getCurrentFeeRate(): Promise<number> {
    try {
      return await this.tryWithFallbackEndpoints(async connection => {
        const recentFees = await connection.getRecentPrioritizationFees();
        if (recentFees.length > 0) {
          // Return median fee rate
          const sortedFees = recentFees.map(f => f.prioritizationFee).sort((a, b) => a - b);
          const median = sortedFees[Math.floor(sortedFees.length / 2)];
          return median;
        }
        return 0;
      });
    } catch (error) {
      console.warn('Failed to get current fee rate:', error);
      return 0;
    }
  }

  /**
   * Get optimal fee for best price-to-performance ratio with fallback endpoints
   */
  public async getOptimalFee(): Promise<{
    baseFee: number;
    priorityFee: number;
    totalFee: number;
    feeInSOL: number;
    networkCongestion: NetworkCongestion;
    estimatedTime: string;
    lastUpdated: number;
  }> {
    try {
      return await this.tryWithFallbackEndpoints(async connection => {
        const recentFees = await connection.getRecentPrioritizationFees();
        const baseFee = 5000; // Base transaction fee in lamports

        let priorityFee = 1000; // Default minimum
        let networkCongestion: NetworkCongestion = NetworkCongestion.LOW;
        let estimatedTime = '5-15 seconds';

        if (recentFees.length > 0) {
          const sortedFees = recentFees.map(f => f.prioritizationFee).sort((a, b) => a - b);
          const p50 = sortedFees[Math.floor(sortedFees.length * 0.5)];
          const p75 = sortedFees[Math.floor(sortedFees.length * 0.75)];

          // Determine network congestion
          if (p75 > 50000) {
            networkCongestion = NetworkCongestion.HIGH;
            estimatedTime = '10-20 seconds';
          } else if (p50 > 10000) {
            networkCongestion = NetworkCongestion.MEDIUM;
            estimatedTime = '5-15 seconds';
          } else {
            estimatedTime = '3-8 seconds';
          }

          // Use P50 for optimal price-to-performance ratio
          // This gives good confirmation speed without overpaying
          priorityFee = Math.max(1000, p50);
        }

        const totalFee = baseFee + priorityFee;

        return {
          baseFee,
          priorityFee,
          totalFee,
          feeInSOL: totalFee / LAMPORTS_PER_SOL,
          networkCongestion,
          estimatedTime,
          lastUpdated: Date.now(),
        };
      });
    } catch (error) {
      console.warn('Optimal fee calculation failed, using defaults:', error);

      // Fallback to conservative default
      const baseFee = 5000;
      const priorityFee = 1000;
      const totalFee = baseFee + priorityFee;

      return {
        baseFee,
        priorityFee,
        totalFee,
        feeInSOL: totalFee / LAMPORTS_PER_SOL,
        networkCongestion: NetworkCongestion.LOW,
        estimatedTime: '5-15 seconds',
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * Encrypt a memo for the recipient so only they can read it.
   * Uses NaCl box (asymmetric encryption) with the recipient's Solana public key.
   */
  public async encryptMemoForRecipient(memo: string, recipientPublicKey: string): Promise<string> {
    try {
      // Convert Solana PublicKey string to raw bytes (32 bytes)
      const publicKey = new PublicKey(recipientPublicKey);
      const recipientPub = publicKey.toBytes();

      // Convert Ed25519 public key to Curve25519 for encryption
      const recipientCurvePub = ed2curve.convertPublicKey(recipientPub);
      if (!recipientCurvePub) throw new Error('Invalid recipient public key');

      // Generate ephemeral Curve25519 keypair
      const ephemeral = nacl.box.keyPair();
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const message = decodeUTF8(memo);

      // Encrypt the memo (sender ephemeral secret + recipient public)
      const cipher = nacl.box(message, nonce, recipientCurvePub, ephemeral.secretKey);

      // Encode to base64 for storing in memo field
      return `${encodeBase64(ephemeral.publicKey)}:${encodeBase64(nonce)}:${encodeBase64(cipher)}`;
    } catch (err) {
      throw new Error(`Failed to encrypt memo: ${(err as Error).message}`);
    }
  }

  /**
   * Check if a memo is encrypted (has the format: base64:base64:base64)
   */
  public isEncryptedMemo(memo: string): boolean {
    if (!memo) return false;
    const parts = memo.split(':');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Decrypt a memo sent to this wallet.
   * Requires the recipient's Solana keypair (ed25519).
   */
  public async decryptMemoPayload(
    encryptedPayload: string,
    recipientKeypair: Keypair
  ): Promise<string> {
    try {
      const [ephemeralPubB64, nonceB64, cipherB64] = encryptedPayload.split(':');
      if (!ephemeralPubB64 || !nonceB64 || !cipherB64) {
        throw new Error('Invalid encrypted memo format');
      }

      const ephPub = decodeBase64(ephemeralPubB64);
      const nonce = decodeBase64(nonceB64);
      const cipher = decodeBase64(cipherB64);

      // Convert recipient's ed25519 private key → curve25519 secret
      const secret = ed2curve.convertSecretKey(recipientKeypair.secretKey.slice(0, 32));
      if (!secret) throw new Error('Failed to convert recipient secret key');

      // Decrypt the message
      const decrypted = nacl.box.open(cipher, nonce, ephPub, secret);
      if (!decrypted) throw new Error('Decryption failed');

      return encodeUTF8(decrypted);
    } catch (err) {
      throw new Error(`Failed to decrypt memo: ${(err as Error).message}`);
    }
  }

  /**
   * Try to decrypt a memo if it's encrypted, otherwise return as-is
   * Returns both the decrypted text and whether it was encrypted
   */
  public async tryDecryptMemo(
    memo: string,
    recipientKeypair?: Keypair
  ): Promise<{ text: string; wasEncrypted: boolean; decrypted: boolean }> {
    if (!memo) {
      return { text: '', wasEncrypted: false, decrypted: false };
    }

    const isEncrypted = this.isEncryptedMemo(memo);

    if (!isEncrypted) {
      // Plain text memo
      return { text: memo, wasEncrypted: false, decrypted: false };
    }

    if (!recipientKeypair) {
      // Encrypted but no keypair to decrypt
      return { text: '🔒 Encrypted message', wasEncrypted: true, decrypted: false };
    }

    try {
      // Try to decrypt
      const decrypted = await this.decryptMemoPayload(memo, recipientKeypair);
      return { text: decrypted, wasEncrypted: true, decrypted: true };
    } catch (error) {
      console.warn('Failed to decrypt memo:', error);
      // Encrypted but decryption failed (not intended for this keypair)
      return { text: '🔒 Encrypted (not for you)', wasEncrypted: true, decrypted: false };
    }
  }

  /**
   * Validate a Solana address
   */
  public validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get account balance with fallback endpoints
   */
  public async getBalance(address: PublicKey): Promise<number> {
    try {
      return await this.tryWithFallbackEndpoints(async connection => {
        const balance = await connection.getBalance(address);
        return balance / LAMPORTS_PER_SOL;
      });
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Send SOL with optional platform fee
   */
  public async sendSol(
    params: TransferParams,
    senderKeypair: Keypair,
    networkFee: number = 0.000005 // Default Solana network fee
  ): Promise<TransactionResult> {
    try {
      const { from, to, amount, memo, includePlatformFee = true } = params;

      // Calculate total cost including platform fee
      const feeCalculation = calculateTotalCost(amount, networkFee);

      // Check if fee wallet is configured
      if (includePlatformFee && !isFeeWalletConfigured()) {
        throw new Error('Platform fee wallet not configured. Please contact support.');
      }

      // Create the main transfer transaction
      const mainTransferParams: TransferParams = {
        from,
        to,
        amount,
        memo,
        includePlatformFee: false, // Don't include fee in the main transfer
      };

      const mainTransaction = await this.createVersionedTransferTransaction(mainTransferParams);
      const signedMainTransaction = this.signTransaction(mainTransaction, senderKeypair);

      // Send the main transaction
      const mainResult = await this.sendTransaction(signedMainTransaction);

      if (!mainResult.success) {
        return mainResult;
      }

      // If platform fee is enabled and fee wallet is configured, send the fee
      if (includePlatformFee && feeCalculation.feeAmount > 0) {
        try {
          const feeWalletAddress = new PublicKey(getFeeWalletAddress());

          const feeTransferParams: TransferParams = {
            from,
            to: feeWalletAddress,
            amount: feeCalculation.feeAmount,
            memo: `Platform fee for ${amount} SOL transfer`,
            includePlatformFee: false, // Don't charge fee on the fee itself
          };

          const feeTransaction = await this.createVersionedTransferTransaction(feeTransferParams);
          const signedFeeTransaction = this.signTransaction(feeTransaction, senderKeypair);

          const feeResult = await this.sendTransaction(signedFeeTransaction);

          if (!feeResult.success) {
            console.warn('Main transaction succeeded but fee transaction failed:', feeResult.error);
            // Main transaction succeeded, so we return success but log the fee issue
          }
        } catch (feeError) {
          console.warn('Failed to send platform fee:', feeError);
          // Main transaction succeeded, so we return success but log the fee issue
        }
      }

      return mainResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SOL',
      };
    }
  }

  /**
   * Calculate fee for a transaction without sending it
   */
  public calculateTransactionFee(
    amount: number,
    networkFee: number = 0.000005
  ): ReturnType<typeof calculateTotalCost> {
    return calculateTotalCost(amount, networkFee);
  }
}

// Export singleton instance
export const transactionService = TransactionService.getInstance();
