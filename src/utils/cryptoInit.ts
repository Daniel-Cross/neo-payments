/**
 * Crypto initialization module
 * This ensures all crypto libraries are properly initialized after polyfills
 */

// Import polyfills first
import './polyfills';

// Now import crypto libraries
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';

// Verify crypto libraries are working
export const verifyCryptoLibraries = (): boolean => {
  try {
    // Test Buffer
    const testBuffer = Buffer.from('test');
    if (!testBuffer || testBuffer.length === 0) {
      throw new Error('Buffer is not working');
    }

    // Test bs58
    const testBs58 = bs58.encode(testBuffer);
    if (!testBs58) {
      throw new Error('bs58 is not working');
    }

    // Test bip39
    const testMnemonic = bip39.generateMnemonic();
    if (!testMnemonic) {
      throw new Error('bip39 is not working');
    }

    // Test Solana Keypair
    const testKeypair = Keypair.generate();
    if (!testKeypair.publicKey) {
      throw new Error('Solana Keypair is not working');
    }

    console.log('✅ All crypto libraries verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Crypto library verification failed:', error);
    return false;
  }
};

// Initialize crypto libraries
export const initializeCrypto = (): void => {
  console.log('🔧 Initializing crypto libraries...');

  const success = verifyCryptoLibraries();
  if (!success) {
    throw new Error('Failed to initialize crypto libraries');
  }

  console.log('✅ Crypto libraries initialized successfully');
};

// Auto-initialize when this module is imported
initializeCrypto();
