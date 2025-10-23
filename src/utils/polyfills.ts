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

// TextEncoder/TextDecoder polyfills for Hermes
if (typeof global.TextEncoder === 'undefined') {
  try {
    const { TextEncoder, TextDecoder } = require('text-encoding');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
  } catch (error) {
    console.warn('Failed to load text-encoding polyfill:', error);
  }
}

// Ensure crypto is available globally
if (typeof global.crypto === 'undefined') {
  try {
    // @ts-ignore
    global.crypto = require('react-native-get-random-values');
  } catch (error) {
    console.warn('Failed to load crypto polyfill:', error);
  }
}

// Additional Hermes-specific polyfills
if (typeof global.process === 'undefined') {
  try {
    global.process = require('process');
  } catch (error) {
    console.warn('Failed to load process polyfill:', error);
  }
}

// Ensure btoa/atob are available (needed by some crypto libraries)
if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof global.atob === 'undefined') {
  global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
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

  // Test TextEncoder/TextDecoder
  if (typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
    console.warn('WARNING: TextEncoder/TextDecoder polyfills are not available');
  }

  console.log('✅ All polyfills loaded successfully');
} catch (error) {
  console.error('CRITICAL: Polyfill verification failed:', error);
  throw error;
}
