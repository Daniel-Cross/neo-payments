import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { parseDeepLink, DeepLinkData } from '../utils/deepLinkHandler';

export interface DeepLinkState {
  data: DeepLinkData | null;
  isProcessing: boolean;
}

export function useDeepLink() {
  const [deepLinkState, setDeepLinkState] = useState<DeepLinkState>({
    data: null,
    isProcessing: false,
  });

  useEffect(() => {
    // Handle initial URL when app is opened via deep link
    const handleInitialURL = async () => {
      try {
        setDeepLinkState(prev => ({ ...prev, isProcessing: true }));

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const parsedData = parseDeepLink(initialUrl);

          // Navigate based on deep link type
          if (parsedData.type === 'send' && parsedData.walletAddress) {
            // Navigate to send screen with parameters
            const params = new URLSearchParams();
            params.append('address', parsedData.walletAddress);
            if (parsedData.amount) params.append('amount', parsedData.amount);
            if (parsedData.memo) params.append('memo', parsedData.memo);

            router.push(`/send?${params.toString()}`);
          } else if (parsedData.type === 'receive') {
            // For receive links, just navigate to home (QR code display)
            router.push('/(tabs)');
          } else if (parsedData.type === 'request' && parsedData.requestId) {
            // Navigate to request screen
            router.push(`/request?requestId=${parsedData.requestId}`);
          }

          setDeepLinkState({
            data: parsedData,
            isProcessing: false,
          });
        } else {
          setDeepLinkState(prev => ({ ...prev, isProcessing: false }));
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
        setDeepLinkState(prev => ({ ...prev, isProcessing: false }));
      }
    };

    // Handle URL when app is already running
    const handleURL = (event: { url: string }) => {
      try {
        setDeepLinkState(prev => ({ ...prev, isProcessing: true }));

        const parsedData = parseDeepLink(event.url);

        // Navigate based on deep link type
        if (parsedData.type === 'send' && parsedData.walletAddress) {
          // Navigate to send screen with parameters
          const params = new URLSearchParams();
          params.append('address', parsedData.walletAddress);
          if (parsedData.amount) params.append('amount', parsedData.amount);
          if (parsedData.memo) params.append('memo', parsedData.memo);

          router.push(`/send?${params.toString()}`);
        } else if (parsedData.type === 'receive') {
          // For receive links, just navigate to home (QR code display)
          router.push('/(tabs)');
        } else if (parsedData.type === 'request' && parsedData.requestId) {
          // Navigate to request screen
          router.push(`/request?requestId=${parsedData.requestId}`);
        }

        setDeepLinkState({
          data: parsedData,
          isProcessing: false,
        });
      } catch (error) {
        console.error('Error handling URL:', error);
        setDeepLinkState(prev => ({ ...prev, isProcessing: false }));
      }
    };

    // Set up listeners
    const subscription = Linking.addEventListener('url', handleURL);

    // Handle initial URL
    handleInitialURL();

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, []);

  const clearDeepLinkData = () => {
    setDeepLinkState({
      data: null,
      isProcessing: false,
    });
  };

  return {
    ...deepLinkState,
    clearDeepLinkData,
  };
}
