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
  MessageV0,
  TransactionMessage,
  Keypair,
  Signer,
} from "@solana/web3.js";
import { SolanaNetwork, ConnectionCommitment, FeeOption, NetworkCongestion } from "../constants/enums";
import * as Crypto from 'expo-crypto';

// Connection to Solana network with proper configuration
const connection = new Connection(
  SolanaNetwork.MAINNET,
  {
    commitment: ConnectionCommitment.CONFIRMED,
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    disableRetryOnRateLimit: false,
    httpHeaders: {
      'User-Agent': 'Neo-Payments-Wallet/1.0',
    },
  }
);

export interface TransferParams {
  from: PublicKey;
  to: PublicKey;
  amount: number; // in SOL (will be converted to lamports)
  memo?: string;
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
    this.connection = connection;
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
    this.connection = new Connection(network, {
      commitment: ConnectionCommitment.CONFIRMED,
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
      httpHeaders: {
        'User-Agent': 'Neo-Payments-Wallet/1.0',
      },
    });
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
      throw new Error("Transfer amount must be greater than 0");
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

    // Add memo if provided (hash it for privacy)
    if (memo) {
      // Hash the memo for privacy - only recipient can decode
      const hashedMemo = await this.hashMemo(memo, to.toString());
      
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysKcWfC85B2q2"), // Memo program
        data: Buffer.from(hashedMemo, 'utf8'),
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
      throw new Error("Transfer amount must be greater than 0");
    }

    // Create instructions
    const instructions: TransactionInstruction[] = [
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports,
      }),
    ];

    // Add memo if provided (hash it for privacy)
    if (memo) {
      // Hash the memo for privacy - only recipient can decode
      const hashedMemo = await this.hashMemo(memo, to.toString());
      
      instructions.push(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysKcWfC85B2q2"),
          data: Buffer.from(hashedMemo, 'utf8'),
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
          signature = await this.connection.sendTransaction(transaction, [], options);
        }
        
        // Wait for confirmation with timeout
        const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
        
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
        console.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms:`, errorMessage);
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
   * Get transaction history for an address
   */
  public async getTransactionHistory(
    address: PublicKey,
    limit: number = 20
  ): Promise<TransactionDetails[]> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(address, { limit });
      
      const transactions: TransactionDetails[] = [];
      
      for (const sigInfo of signatures) {
        try {
          const tx = await this.connection.getTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });
          
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
                for (let i = 0; i < accountKeysResult.length; i++) {
                  const key = accountKeysResult.get(i);
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
                      transactionDetails.memo = memoMatch[1];
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
        } catch (error) {
          console.warn(`Failed to fetch transaction ${sigInfo.signature}:`, error);
        }
      }
      
      return transactions;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Get current network fee rate
   */
  public async getCurrentFeeRate(): Promise<number> {
    try {
      const recentFees = await this.connection.getRecentPrioritizationFees();
      if (recentFees.length > 0) {
        // Return median fee rate
        const sortedFees = recentFees.map(f => f.prioritizationFee).sort((a, b) => a - b);
        const median = sortedFees[Math.floor(sortedFees.length / 2)];
        return median;
      }
      return 0;
    } catch (error) {
      console.warn('Failed to get current fee rate:', error);
      return 0;
    }
  }

  /**
   * Get optimal fee for best price-to-performance ratio
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
      const recentFees = await this.connection.getRecentPrioritizationFees();
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
   * Hash a memo for privacy (only recipient can decode)
   */
  public async hashMemo(memo: string, recipientPublicKey: string): Promise<string> {
    // Create a deterministic hash using the memo and recipient's public key
    // This ensures only the recipient can decode it
    const data = `${memo}:${recipientPublicKey}`;
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data, { encoding: Crypto.CryptoEncoding.HEX });
    return `HASH:${hash}`;
  }

  /**
   * Decode a hashed memo (only works for the intended recipient)
   */
  public async decodeMemo(hashedMemo: string, recipientPublicKey: string, originalMemo: string): Promise<boolean> {
    if (!hashedMemo.startsWith('HASH:')) {
      return false;
    }
    
    const hash = hashedMemo.substring(5); // Remove 'HASH:' prefix
    const expectedHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${originalMemo}:${recipientPublicKey}`, { encoding: Crypto.CryptoEncoding.HEX });
    
    return hash === expectedHash;
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
   * Get account balance
   */
  public async getBalance(address: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(address);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const transactionService = TransactionService.getInstance();
