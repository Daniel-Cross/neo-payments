/**
 * Polyfill test utility
 * Run this to verify all polyfills are working correctly
 */

import './polyfills';

export const testPolyfills = (): boolean => {
  console.log('🧪 Testing polyfills...');

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
      if (result) {
        console.log(`✅ ${test.name}: PASS`);
      } else {
        console.log(`❌ ${test.name}: FAIL`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('🎉 All polyfill tests passed!');
  } else {
    console.log('💥 Some polyfill tests failed!');
  }

  return allPassed;
};

// Auto-run tests when this module is imported
if (__DEV__) {
  testPolyfills();
}
