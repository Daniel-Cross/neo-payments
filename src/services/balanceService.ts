import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getSolanaRpcEndpoints } from '../constants/enums';

const HELIUS_API_KEY = process.env.EXPO_PUBLIC_SOLANA_RPC_API_KEY;

export interface BalanceUpdate {
  address: string;
  balance: number;
  timestamp: number;
}

export class BalanceService {
  private static instance: BalanceService;
  private webhookUrl: string | null = null;
  private subscriptions: Map<string, any> = new Map();

  public static getInstance(): BalanceService {
    if (!BalanceService.instance) {
      BalanceService.instance = new BalanceService();
    }
    return BalanceService.instance;
  }

  /**
   * Get balance using Helius Enhanced RPC getBalance endpoint
   * This is faster and more reliable than standard RPC calls
   */
  public async getBalance(address: string): Promise<number> {
    try {
      // Use Helius Enhanced RPC if API key is available
      if (HELIUS_API_KEY) {
        const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address, { commitment: 'confirmed' }],
          }),
        });

        const { result } = await response.json();
        return result.value / LAMPORTS_PER_SOL;
      } else {
        // Fallback to standard RPC endpoints
        return this.getBalanceWithFallback(address);
      }
    } catch (error) {
      console.warn('Helius balance fetch failed, using fallback:', error);
      return this.getBalanceWithFallback(address);
    }
  }

  /**
   * Fallback to standard RPC endpoints if Helius is not available
   */
  private async getBalanceWithFallback(address: string): Promise<number> {
    const rpcEndpoints = getSolanaRpcEndpoints();

    for (const endpoint of rpcEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address, { commitment: 'confirmed' }],
          }),
        });

        const { result } = await response.json();
        if (result && result.value !== undefined) {
          return result.value / LAMPORTS_PER_SOL;
        }
      } catch (error) {
        console.warn(`RPC endpoint ${endpoint} failed:`, error);
        continue;
      }
    }

    throw new Error('All RPC endpoints failed');
  }

  /**
   * Subscribe to balance changes for an address using Helius webhooks
   * This provides real-time updates without polling
   */
  public async subscribeToBalanceChanges(
    address: string,
    onBalanceUpdate: (update: BalanceUpdate) => void
  ): Promise<void> {
    if (!HELIUS_API_KEY) {
      console.warn('Helius API key not available, cannot subscribe to balance changes');
      return;
    }

    try {
      // Register webhook with Helius for this address
      const webhookResponse = await fetch(
        `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookURL: this.webhookUrl || 'https://your-backend.com/webhook', // You'll need to set this
            transactionTypes: ['Any'],
            accountAddresses: [address],
            webhookType: 'enhanced',
          }),
        }
      );

      if (webhookResponse.ok) {
        const webhook = await webhookResponse.json();
        console.log('Webhook registered for address:', address, webhook);

        // Store subscription for cleanup
        this.subscriptions.set(address, {
          webhookId: webhook.webhookID,
          onUpdate: onBalanceUpdate,
        });
      }
    } catch (error) {
      console.error('Failed to subscribe to balance changes:', error);
    }
  }

  /**
   * Unsubscribe from balance changes for an address
   */
  public async unsubscribeFromBalanceChanges(address: string): Promise<void> {
    const subscription = this.subscriptions.get(address);
    if (!subscription || !HELIUS_API_KEY) return;

    try {
      await fetch(
        `https://api.helius.xyz/v0/webhooks/${subscription.webhookId}?api-key=${HELIUS_API_KEY}`,
        { method: 'DELETE' }
      );

      this.subscriptions.delete(address);
    } catch (error) {
      console.error('Failed to unsubscribe from balance changes:', error);
    }
  }

  /**
   * Process webhook payload from Helius
   * This should be called by your backend when it receives webhook notifications
   */
  public processWebhookPayload(payload: any): BalanceUpdate[] {
    const updates: BalanceUpdate[] = [];

    try {
      // Parse Helius webhook payload
      if (payload && payload.length > 0) {
        for (const transaction of payload) {
          // Extract balance changes from transaction
          if (transaction.accountData) {
            for (const accountData of transaction.accountData) {
              if (accountData.account && accountData.nativeTransfers) {
                const address = accountData.account;
                const balance =
                  accountData.nativeTransfers.reduce(
                    (total: number, transfer: any) => total + (transfer.amount || 0),
                    0
                  ) / LAMPORTS_PER_SOL;

                updates.push({
                  address,
                  balance,
                  timestamp: Date.now(),
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to process webhook payload:', error);
    }

    return updates;
  }

  /**
   * Set webhook URL for receiving balance updates
   * This should be your backend endpoint that processes webhooks
   */
  public setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  /**
   * Get all active subscriptions
   */
  public getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Cleanup all subscriptions
   */
  public async cleanup(): Promise<void> {
    const addresses = Array.from(this.subscriptions.keys());
    await Promise.all(addresses.map(address => this.unsubscribeFromBalanceChanges(address)));
  }
}

// Export singleton instance
export const balanceService = BalanceService.getInstance();
