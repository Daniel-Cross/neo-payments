import { useState, useEffect, useCallback, useRef } from 'react';
import { useWalletStore } from '../store/walletStore';

/**
 * Custom hook for managing fee monitoring with countdown timer
 * Handles all the complex state and side effects for fee updates
 */
export const useFeeMonitoring = (isActive: boolean) => {
  const { optimalFee, isRefreshingFees, loadOptimalFee } = useWalletStore();

  // Countdown timer state
  const [countdown, setCountdown] = useState<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feeMonitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(isActive);

  // Update ref when isActive changes
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Start countdown timer function
  const startCountdown = useCallback(() => {
    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Set countdown to 12 seconds
    setCountdown(12);

    // Start simple countdown interval
    const interval = setInterval(() => {
      if (!isActiveRef.current) {
        clearInterval(interval);
        return;
      }

      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown finished, refresh fee and restart
          loadOptimalFee();
          return 12;
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    countdownIntervalRef.current = interval;
  }, [loadOptimalFee]);

  // Manual refresh function
  const refreshFee = useCallback(() => {
    if (!isActiveRef.current) return;
    loadOptimalFee();
    startCountdown();
  }, [loadOptimalFee, startCountdown]);

  // Start monitoring when active
  useEffect(() => {
    if (isActive) {
      // Load initial fee after a small delay to avoid render-time state updates
      const initialLoadTimeout = setTimeout(() => {
        loadOptimalFee();
      }, 0);

      // Start fee monitoring interval (12 seconds)
      const interval = setInterval(() => {
        if (isActiveRef.current) {
          loadOptimalFee();
        }
      }, 20000);
      feeMonitoringIntervalRef.current = interval;

      // Start countdown timer
      startCountdown();

      // Cleanup timeout
      return () => {
        clearTimeout(initialLoadTimeout);
      };
    } else {
      // Clean up fee monitoring when inactive
      if (feeMonitoringIntervalRef.current) {
        clearInterval(feeMonitoringIntervalRef.current);
        feeMonitoringIntervalRef.current = null;
      }

      // Clean up countdown timer
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      // Reset countdown
      setCountdown(0);
    }

    // Cleanup function
    return () => {
      if (feeMonitoringIntervalRef.current) {
        clearInterval(feeMonitoringIntervalRef.current);
        feeMonitoringIntervalRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isActive, loadOptimalFee, startCountdown]);

  return {
    optimalFee,
    isRefreshingFees,
    countdown,
    refreshFee,
  };
};
