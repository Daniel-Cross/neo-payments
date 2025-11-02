import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const HELIUS_API_KEY = process.env.EXPO_PUBLIC_SOLANA_RPC_API_KEY;
const HELIUS_WEBHOOK_BASE_URL =
  process.env.EXPO_PUBLIC_WEBHOOK_BASE_URL || 'https://your-backend.com';

export interface WebhookTransaction {
  accountData: any[];
  description: string;
  events: any[];
  fee: number;
  instructions: any[];
  nativeTransfers: Array<{
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: any[];
  type: string;
}

export interface WebhookPayload {
  accountData: any[];
  description: string;
  events: any[];
  fee: number;
  instructions: any[];
  nativeTransfers: Array<{
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: any[];
  type: string;
}

export class TransactionWebhookService {
  private static instance: TransactionWebhookService;
  private webhookId: string | null = null;
  private monitoredAddresses: Set<string> = new Set();

  public static getInstance(): TransactionWebhookService {
    if (!TransactionWebhookService.instance) {
      TransactionWebhookService.instance = new TransactionWebhookService();
    }
    return TransactionWebhookService.instance;
  }

  /**
   * Create a Helius webhook to monitor transactions for specific addresses
   * Note: This requires a backend endpoint to receive webhook callbacks
   *
   * @param addresses Array of wallet addresses to monitor
   * @param webhookUrl Your backend endpoint that will receive webhook POST requests
   * @param transactionTypes Transaction types to monitor (e.g., 'TRANSFER', 'SWAP')
   */
  public async createWebhook(
    addresses: string[],
    webhookUrl: string,
    transactionTypes: string[] = ['TRANSFER', 'SWAP', 'NFT_SALE', 'NFT_MINT']
  ): Promise<string | null> {
    if (!HELIUS_API_KEY) {
      console.warn('Helius API key not available, cannot create webhook');
      return null;
    }

    try {
      const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookURL: webhookUrl,
          transactionTypes,
          accountAddresses: addresses,
          webhookType: 'enhanced',
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(
          `Helius webhook creation failed: ${data.error.message || JSON.stringify(data.error)}`
        );
      }

      this.webhookId = data.webhookID;
      addresses.forEach(addr => this.monitoredAddresses.add(addr));

      console.log('✅ Webhook created successfully:', this.webhookId);
      return this.webhookId;
    } catch (error) {
      console.error('Failed to create Helius webhook:', error);
      return null;
    }
  }

  /**
   * Update an existing webhook with new addresses
   */
  public async updateWebhook(
    webhookId: string,
    addresses: string[],
    webhookUrl: string,
    transactionTypes: string[] = ['TRANSFER', 'SWAP', 'NFT_SALE', 'NFT_MINT']
  ): Promise<boolean> {
    if (!HELIUS_API_KEY) {
      console.warn('Helius API key not available, cannot update webhook');
      return false;
    }

    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${HELIUS_API_KEY}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookURL: webhookUrl,
            transactionTypes,
            accountAddresses: addresses,
            webhookType: 'enhanced',
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(
          `Helius webhook update failed: ${data.error.message || JSON.stringify(data.error)}`
        );
      }

      this.webhookId = webhookId;
      this.monitoredAddresses.clear();
      addresses.forEach(addr => this.monitoredAddresses.add(addr));

      console.log('✅ Webhook updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update Helius webhook:', error);
      return false;
    }
  }

  /**
   * Delete a webhook
   */
  public async deleteWebhook(webhookId: string): Promise<boolean> {
    if (!HELIUS_API_KEY) {
      console.warn('Helius API key not available, cannot delete webhook');
      return false;
    }

    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${HELIUS_API_KEY}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        if (this.webhookId === webhookId) {
          this.webhookId = null;
          this.monitoredAddresses.clear();
        }
        console.log('✅ Webhook deleted successfully');
        return true;
      }

      const data = await response.json();
      throw new Error(
        `Helius webhook deletion failed: ${data.error?.message || response.statusText}`
      );
    } catch (error) {
      console.error('Failed to delete Helius webhook:', error);
      return false;
    }
  }

  /**
   * Get all webhooks for your API key
   */
  public async getWebhooks(): Promise<any[]> {
    if (!HELIUS_API_KEY) {
      console.warn('Helius API key not available, cannot get webhooks');
      return [];
    }

    try {
      const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(
          `Failed to get webhooks: ${data.error.message || JSON.stringify(data.error)}`
        );
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to get webhooks:', error);
      return [];
    }
  }

  /**
   * Parse webhook payload and extract transaction details
   */
  public parseWebhookPayload(payload: WebhookPayload[]): {
    signature: string;
    type: 'received' | 'sent';
    amount: number;
    from: string;
    to: string;
    memo?: string;
    timestamp: number;
  }[] {
    const transactions: any[] = [];

    for (const tx of payload) {
      if (!tx.nativeTransfers || tx.nativeTransfers.length === 0) {
        continue;
      }

      for (const transfer of tx.nativeTransfers) {
        transactions.push({
          signature: tx.signature,
          type: transfer.amount > 0 ? 'received' : 'sent',
          amount: Math.abs(transfer.amount) / LAMPORTS_PER_SOL,
          from: transfer.fromUserAccount,
          to: transfer.toUserAccount,
          timestamp: tx.timestamp,
        });
      }

      // Extract memo from instructions if available
      if (tx.instructions) {
        for (const instruction of tx.instructions) {
          if (instruction.programId === 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo') {
            // Try to extract memo from instruction data
            const memo = this.extractMemo(instruction);
            if (memo && transactions.length > 0) {
              transactions[transactions.length - 1].memo = memo;
            }
          }
        }
      }
    }

    return transactions;
  }

  /**
   * Extract memo from instruction data
   */
  private extractMemo(instruction: any): string | undefined {
    try {
      if (instruction.parsed) {
        if (typeof instruction.parsed === 'string') {
          return instruction.parsed;
        }
        if (instruction.parsed.memo) {
          return instruction.parsed.memo;
        }
      }
      if (instruction.data) {
        // Decode base64 or hex memo data
        const buffer = Buffer.from(instruction.data, 'base64');
        return buffer.toString('utf-8').replace(/\0/g, '').trim();
      }
    } catch (error) {
      // Memo extraction failed
    }
    return undefined;
  }

  /**
   * Get current webhook ID
   */
  public getWebhookId(): string | null {
    return this.webhookId;
  }

  /**
   * Get monitored addresses
   */
  public getMonitoredAddresses(): string[] {
    return Array.from(this.monitoredAddresses);
  }
}

// Export singleton instance
export const transactionWebhookService = TransactionWebhookService.getInstance();
