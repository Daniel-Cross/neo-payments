import { PublicKey } from "@solana/web3.js";

export interface PaymentProvider {
  name: string;
  supportedCountries: string[];
  supportedCurrencies: string[];
  minAmount: number;
  maxAmount: number;
  fees: {
    percentage: number;
    fixed: number;
  };
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  walletAddress: string;
  paymentMethod: string;
  userEmail?: string;
  redirectUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

// Mock payment providers for now
const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    name: "MoonPay",
    supportedCountries: ["US", "CA", "GB", "EU", "AU"],
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
    minAmount: 20,
    maxAmount: 10000,
    fees: {
      percentage: 4.5,
      fixed: 0,
    },
  },
  {
    name: "Ramp",
    supportedCountries: ["US", "CA", "GB", "EU"],
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD"],
    minAmount: 10,
    maxAmount: 5000,
    fees: {
      percentage: 3.5,
      fixed: 0,
    },
  },
  {
    name: "Transak",
    supportedCountries: ["US", "CA", "GB", "EU", "AU", "IN"],
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "INR"],
    minAmount: 15,
    maxAmount: 15000,
    fees: {
      percentage: 3.9,
      fixed: 0,
    },
  },
];

export class PaymentService {
  private static instance: PaymentService;
  private currentProvider: PaymentProvider | null = null;

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Get available payment providers based on user location and preferences
   */
  public getAvailableProviders(userCountry?: string): PaymentProvider[] {
    if (!userCountry) {
      return PAYMENT_PROVIDERS;
    }

    return PAYMENT_PROVIDERS.filter(provider =>
      provider.supportedCountries.includes(userCountry)
    );
  }

  /**
   * Select the best payment provider based on amount and preferences
   */
  public selectBestProvider(
    amount: number,
    currency: string = "USD",
    userCountry?: string
  ): PaymentProvider | null {
    const availableProviders = this.getAvailableProviders(userCountry);
    
    // Filter by currency support and amount limits
    const suitableProviders = availableProviders.filter(provider =>
      provider.supportedCurrencies.includes(currency) &&
      amount >= provider.minAmount &&
      amount <= provider.maxAmount
    );

    if (suitableProviders.length === 0) {
      return null;
    }

    // Sort by fees (lower is better)
    suitableProviders.sort((a, b) => {
      const aTotalFee = (amount * a.fees.percentage / 100) + a.fees.fixed;
      const bTotalFee = (amount * b.fees.percentage / 100) + b.fees.fixed;
      return aTotalFee - bTotalFee;
    });

    return suitableProviders[0];
  }

  /**
   * Calculate total cost including fees
   */
  public calculateTotalCost(
    amount: number,
    provider: PaymentProvider
  ): { subtotal: number; fees: number; total: number } {
    const fees = (amount * provider.fees.percentage / 100) + provider.fees.fixed;
    return {
      subtotal: amount,
      fees: fees,
      total: amount + fees,
    };
  }

  /**
   * Initiate payment with selected provider
   */
  public async initiatePayment(
    request: PaymentRequest,
    provider: PaymentProvider
  ): Promise<PaymentResponse> {
    try {
      // Validate wallet address
      try {
        new PublicKey(request.walletAddress);
      } catch (error) {
        return {
          success: false,
          error: "Invalid Solana wallet address",
        };
      }

      // Validate amount
      if (request.amount < provider.minAmount || request.amount > provider.maxAmount) {
        return {
          success: false,
          error: `Amount must be between $${provider.minAmount} and $${provider.maxAmount}`,
        };
      }

      // For now, return a mock response
      // In a real implementation, this would integrate with the actual payment provider API
      const mockPaymentUrl = this.generateMockPaymentUrl(request, provider);
      
      return {
        success: true,
        paymentUrl: mockPaymentUrl,
        transactionId: this.generateTransactionId(),
      };
    } catch (error) {
      console.error("Payment initiation failed:", error);
      return {
        success: false,
        error: "Failed to initiate payment. Please try again.",
      };
    }
  }

  /**
   * Handle payment callback/redirect
   */
  public async handlePaymentCallback(
    transactionId: string,
    status: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would verify the payment with the provider
      // and update the user's wallet balance
      
      if (status === "completed") {
        return { success: true };
      } else if (status === "failed") {
        return { success: false, error: "Payment failed" };
      } else {
        return { success: false, error: "Payment is still processing" };
      }
    } catch (error) {
      console.error("Payment callback handling failed:", error);
      return { success: false, error: "Failed to process payment callback" };
    }
  }

  /**
   * Get payment status
   */
  public async getPaymentStatus(transactionId: string): Promise<{
    status: "pending" | "completed" | "failed";
    amount?: number;
    solAmount?: number;
    error?: string;
  }> {
    try {
      // In a real implementation, this would query the payment provider
      // For now, return a mock status
      return {
        status: "completed",
        amount: 100,
        solAmount: 0.5,
      };
    } catch (error) {
      console.error("Failed to get payment status:", error);
      return {
        status: "failed",
        error: "Failed to retrieve payment status",
      };
    }
  }

  private generateMockPaymentUrl(request: PaymentRequest, provider: PaymentProvider): string {
    const params = new URLSearchParams({
      amount: request.amount.toString(),
      currency: request.currency,
      walletAddress: request.walletAddress,
      paymentMethod: request.paymentMethod,
      provider: provider.name,
    });

    return `https://mock-payment-provider.com/pay?${params.toString()}`;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
