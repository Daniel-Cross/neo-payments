/**
 * React Native polyfills for Solana Web3.js
 * CRITICAL: This file must be imported FIRST before any other code
 * DO NOT import any other modules before polyfills are set up
 */

// Import crypto polyfill FIRST (critical for Solana)
import 'react-native-get-random-values';

// Import URL polyfill SECOND
import 'react-native-url-polyfill/auto';

// Import Buffer
import { Buffer } from 'buffer';

// Ensure global object exists and is properly initialized
if (typeof global === 'undefined') {
  throw new Error('Global object is not defined - critical initialization error');
}

// Make Buffer available globally for Solana Web3.js
// @ts-ignore - Buffer polyfill for React Native
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Verify critical polyfills are working
try {
  // Test Buffer
  const testBuffer = Buffer.from('test');
  if (!testBuffer || testBuffer.length === 0) {
    throw new Error('Buffer polyfill is not working correctly');
  }

  // Test crypto.getRandomValues (needed for Solana key generation)
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    console.warn('WARNING: crypto.getRandomValues is not available');
  }
} catch (error) {
  console.error('CRITICAL: Polyfill verification failed:', error);
  throw error;
}
