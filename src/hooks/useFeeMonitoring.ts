import { useState, useEffect, useCallback, useRef } from 'react';
import { useWalletStore } from '../store/walletStore';

/**
 * Custom hook for managing fee monitoring with countdown timer
 * Handles all the complex state and side effects for fee updates
 */
export const useFeeMonitoring = (isActive: boolean) => {
  const { optimalFee, isRefreshingFees, loadOptimalFee, startFeeMonitoring, stopFeeMonitoring } = useWalletStore();
  
  // Countdown timer state
  const [countdown, setCountdown] = useState<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feeMonitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown timer function
  const startCountdown = useCallback(() => {
    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Set countdown to 12 seconds
    setCountdown(12);
    
    // Start countdown interval
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Countdown finished, refresh fee and restart
          loadOptimalFee();
          return 12;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownIntervalRef.current = interval;
  }, [loadOptimalFee]);

  // Manual refresh function
  const refreshFee = useCallback(() => {
    loadOptimalFee();
    startCountdown();
  }, [loadOptimalFee, startCountdown]);

  // Start monitoring when active
  useEffect(() => {
    if (isActive) {
      // Start fee monitoring
      const interval = startFeeMonitoring();
      feeMonitoringIntervalRef.current = interval;
      
      // Start countdown timer
      startCountdown();
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
    }
    
    // Cleanup function
    return () => {
      if (feeMonitoringIntervalRef.current) {
        clearInterval(feeMonitoringIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isActive, startFeeMonitoring, startCountdown]);


  return {
    optimalFee,
    isRefreshingFees,
    countdown,
    refreshFee,
  };
};
