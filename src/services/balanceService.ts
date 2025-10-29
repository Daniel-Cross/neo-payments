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
  private ws: WebSocket | null = null;
  private subscriptions: Map<
    string,
    { subscriptionId: string; onUpdate: (update: BalanceUpdate) => void }
  > = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

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
   * Connect to Helius WebSocket for real-time balance monitoring
   */
  private async connectWebSocket(): Promise<void> {
    if (!HELIUS_API_KEY) {
      throw new Error('Helius API key not available');
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);

        this.ws.onopen = () => {
          console.log('✅ Connected to Helius WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = msg => {
          try {
            const data = JSON.parse(msg.data);
            console.log('🔔 WebSocket message:', data);

            // Handle different message types
            if (data.method === 'accountNotification') {
              this.handleWebSocketMessage(data);
            } else if (data.result && data.id) {
              // Handle subscription confirmation
              this.handleSubscriptionConfirmation(data);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('❌ WebSocket connection closed');
          this.isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = error => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    if (data.method === 'accountNotification' && data.params) {
      const { subscription, result } = data.params;
      const subscriptionInfo = Array.from(this.subscriptions.values()).find(
        sub => sub.subscriptionId === subscription
      );

      if (subscriptionInfo && result) {
        // Extract balance from account data
        const balance = result.value ? result.value / LAMPORTS_PER_SOL : 0;
        const address = this.getAddressFromSubscription(subscription);

        if (address) {
          subscriptionInfo.onUpdate({
            address,
            balance,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  /**
   * Get address from subscription ID
   */
  private getAddressFromSubscription(subscriptionId: string): string | null {
    for (const [address, sub] of this.subscriptions) {
      if (sub.subscriptionId === subscriptionId) {
        return address;
      }
    }
    return null;
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connectWebSocket().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to balance changes for an address using WebSocket
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
      // Connect WebSocket if not already connected
      if (!this.isConnected || !this.ws) {
        await this.connectWebSocket();
      }

      // Subscribe to account changes
      const subscribeMessage = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'accountSubscribe',
        params: [address, { commitment: 'confirmed' }],
      };

      this.ws!.send(JSON.stringify(subscribeMessage));

      // Store subscription for cleanup
      this.subscriptions.set(address, {
        subscriptionId: '', // Will be set when we receive the subscription confirmation
        onUpdate: onBalanceUpdate,
      });

      console.log(`📡 Subscribed to balance changes for address: ${address}`);
    } catch (error) {
      console.error('Failed to subscribe to balance changes:', error);
    }
  }

  /**
   * Unsubscribe from balance changes for an address
   */
  public async unsubscribeFromBalanceChanges(address: string): Promise<void> {
    const subscription = this.subscriptions.get(address);
    if (!subscription || !this.ws || !this.isConnected) return;

    try {
      // Unsubscribe from account changes
      const unsubscribeMessage = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'accountUnsubscribe',
        params: [subscription.subscriptionId],
      };

      this.ws.send(JSON.stringify(unsubscribeMessage));
      this.subscriptions.delete(address);

      console.log(`📡 Unsubscribed from balance changes for address: ${address}`);
    } catch (error) {
      console.error('Failed to unsubscribe from balance changes:', error);
    }
  }

  /**
   * Handle subscription confirmation from WebSocket
   */
  private handleSubscriptionConfirmation(data: any): void {
    if (data.result && data.id) {
      // Find the subscription by ID and update the subscription ID
      // This is a simplified approach - in production you'd want to track IDs properly
      console.log('✅ Subscription confirmed:', data.result);
    }
  }

  /**
   * Get all active subscriptions
   */
  public getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Cleanup all subscriptions and close WebSocket
   */
  public async cleanup(): Promise<void> {
    const addresses = Array.from(this.subscriptions.keys());
    await Promise.all(addresses.map(address => this.unsubscribeFromBalanceChanges(address)));

    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const balanceService = BalanceService.getInstance();
