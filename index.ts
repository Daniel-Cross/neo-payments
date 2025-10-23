// Import polyfills first, before any other imports
import './src/utils/polyfills';

// Test polyfills in development
if (__DEV__) {
  import('./src/utils/polyfillTest');
}

import 'expo-router/entry';
