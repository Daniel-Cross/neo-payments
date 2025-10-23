import * as Linking from 'expo-linking';
import { DeepLinkType } from '../constants/enums';

export interface DeepLinkData {
  type: DeepLinkType;
  walletAddress?: string;
  amount?: string;
  memo?: string;
}

/**
 * Parses a deep link URL and extracts relevant data
 * Supported formats:
 * - neo://send?address=WALLET_ADDRESS&amount=1.5&memo=Hello
 * - neo://receive?address=WALLET_ADDRESS
 * - https://neo.app/send?address=WALLET_ADDRESS&amount=1.5&memo=Hello
 * - https://neo.app/receive?address=WALLET_ADDRESS
 *
 * Note: Send deep links now navigate to /send route instead of opening modal
 */
export function parseDeepLink(url: string): DeepLinkData {
  try {
    const parsed = Linking.parse(url);

    if (!parsed.path || !parsed.queryParams) {
      return { type: DeepLinkType.UNKNOWN };
    }

    const path = parsed.path.toLowerCase();
    const params = parsed.queryParams;

    if (path === 'send') {
      return {
        type: DeepLinkType.SEND,
        walletAddress: params.address as string,
        amount: params.amount as string,
        memo: params.memo as string,
      };
    }

    if (path === 'receive') {
      return {
        type: DeepLinkType.RECEIVE,
        walletAddress: params.address as string,
      };
    }

    return { type: DeepLinkType.UNKNOWN };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return { type: DeepLinkType.UNKNOWN };
  }
}

/**
 * Generates a deep link URL for sending SOL
 */
export function generateSendDeepLink(
  walletAddress: string,
  amount?: string,
  memo?: string
): string {
  const baseUrl = 'neo://send';
  const params = new URLSearchParams();

  params.append('address', walletAddress);

  if (amount) {
    params.append('amount', amount);
  }

  if (memo) {
    params.append('memo', memo);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates a deep link URL for receiving SOL
 */
export function generateReceiveDeepLink(walletAddress: string): string {
  return `neo://receive?address=${encodeURIComponent(walletAddress)}`;
}

/**
 * Checks if a string is a valid deep link URL
 */
export function isDeepLink(url: string): boolean {
  return url.startsWith('neo://') || url.startsWith('https://neo.app');
}

/**
 * Extracts wallet address from various formats:
 * - Raw wallet address
 * - Deep link URL
 * - Other formats
 */
export function extractWalletAddress(input: string): string | null {
  // If it's a deep link, parse it
  if (isDeepLink(input)) {
    const parsed = parseDeepLink(input);
    return parsed.walletAddress || null;
  }

  // If it looks like a Solana wallet address (base58, 32-44 characters)
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if (solanaAddressRegex.test(input.trim())) {
    return input.trim();
  }

  return null;
}
