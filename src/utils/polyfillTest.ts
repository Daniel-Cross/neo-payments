/**
 * Polyfill test utility
 * Run this to verify all polyfills are working correctly
 */

import './polyfills';

export const testPolyfills = (): boolean => {
  const tests = [
    {
      name: 'Buffer',
      test: () => {
        const buffer = Buffer.from('test');
        return buffer && buffer.length > 0;
      },
    },
    {
      name: 'crypto.getRandomValues',
      test: () => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return array.some(value => value !== 0);
      },
    },
    {
      name: 'TextEncoder',
      test: () => {
        const encoder = new TextEncoder();
        const encoded = encoder.encode('test');
        return encoded && encoded.length > 0;
      },
    },
    {
      name: 'TextDecoder',
      test: () => {
        const decoder = new TextDecoder();
        const decoded = decoder.decode(new Uint8Array([116, 101, 115, 116]));
        return decoded === 'test';
      },
    },
    {
      name: 'btoa/atob',
      test: () => {
        const encoded = btoa('test');
        const decoded = atob(encoded);
        return decoded === 'test';
      },
    },
    {
      name: 'process',
      test: () => {
        return typeof process !== 'undefined' && typeof process.nextTick === 'function';
      },
    },
  ];

  let allPassed = true;

  for (const test of tests) {
    try {
      const result = test.test();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      allPassed = false;
    }
  }

  return allPassed;
};

// Auto-run tests when this module is imported
if (__DEV__) {
  testPolyfills();
}
