import { useState, useCallback } from "react";
import { paymentService, PaymentProvider, PaymentRequest } from "../services/paymentService";
import { useWalletStore } from "../store/walletStore";
import { showSuccessToast, showErrorToast } from "../utils/toast";

export interface PaymentFlowState {
  isLoading: boolean;
  selectedProvider: PaymentProvider | null;
  paymentUrl: string | null;
  error: string | null;
}

export const usePaymentFlow = () => {
  const { selectedWallet } = useWalletStore();
  const [state, setState] = useState<PaymentFlowState>({
    isLoading: false,
    selectedProvider: null,
    paymentUrl: null,
    error: null,
  });

  const initiatePayment = useCallback(async (
    amount: number,
    paymentMethod: string,
    currency: string = "USD"
  ) => {
    if (!selectedWallet) {
      showErrorToast("No wallet selected");
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Select the best payment provider
      const provider = paymentService.selectBestProvider(amount, currency);
      
      if (!provider) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "No payment provider available for this amount and currency",
        }));
        return false;
      }

      setState(prev => ({ ...prev, selectedProvider: provider }));

      // Create payment request
      const paymentRequest: PaymentRequest = {
        amount,
        currency,
        walletAddress: selectedWallet.publicKey,
        paymentMethod,
        userEmail: undefined, // Could be added from user profile
        redirectUrl: "neo-payments://payment-callback", // Custom URL scheme
      };

      // Initiate payment
      const response = await paymentService.initiatePayment(paymentRequest, provider);

      if (response.success && response.paymentUrl) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          paymentUrl: response.paymentUrl!,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || "Failed to initiate payment",
        }));
        return false;
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred. Please try again.",
      }));
      return false;
    }
  }, [selectedWallet]);

  const handlePaymentCallback = useCallback(async (transactionId: string, status: string) => {
    try {
      const result = await paymentService.handlePaymentCallback(transactionId, status);
      
      if (result.success) {
        showSuccessToast("Payment completed successfully! SOL has been added to your wallet.");
        // Refresh wallet balance
        // This would typically trigger a balance update in the wallet store
      } else {
        showErrorToast(result.error || "Payment failed");
      }
      
      return result.success;
    } catch (error) {
      console.error("Payment callback handling failed:", error);
      showErrorToast("Failed to process payment. Please contact support.");
      return false;
    }
  }, []);

  const getPaymentStatus = useCallback(async (transactionId: string) => {
    try {
      return await paymentService.getPaymentStatus(transactionId);
    } catch (error) {
      console.error("Failed to get payment status:", error);
      return {
        status: "failed" as const,
        error: "Failed to retrieve payment status",
      };
    }
  }, []);

  const calculateFees = useCallback((amount: number, provider: PaymentProvider | null) => {
    if (!provider) return { subtotal: amount, fees: 0, total: amount };
    return paymentService.calculateTotalCost(amount, provider);
  }, []);

  const getAvailableProviders = useCallback((userCountry?: string) => {
    return paymentService.getAvailableProviders(userCountry);
  }, []);

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      selectedProvider: null,
      paymentUrl: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    initiatePayment,
    handlePaymentCallback,
    getPaymentStatus,
    calculateFees,
    getAvailableProviders,
    resetState,
  };
};
