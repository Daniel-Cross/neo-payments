# Crypto Crash Fix - React Native Hermes

## Problem

The app was crashing on TestFlight builds with a Hermes JavaScript engine crash (SIGSEGV) when crypto libraries were used. This is a common issue in React Native production builds where polyfills aren't properly loaded before crypto libraries are imported.

## Root Cause

The crash was caused by:

1. Missing or improperly loaded polyfills for Hermes JavaScript engine
2. Crypto libraries being imported before polyfills were fully initialized
3. Missing TextEncoder/TextDecoder polyfills
4. Improper global object setup for crypto operations

## Solution Implemented

### 1. Enhanced Polyfills (`src/utils/polyfills.ts`)

- Added comprehensive polyfill loading with error handling
- Added TextEncoder/TextDecoder polyfills for Hermes
- Added btoa/atob polyfills
- Added process polyfill
- Added proper global crypto setup
- Added verification tests for all polyfills

### 2. Crypto Initialization Module (`src/utils/cryptoInit.ts`)

- Created centralized crypto library initialization
- Ensures all crypto libraries are loaded after polyfills
- Verifies crypto libraries are working correctly
- Provides early error detection

### 3. Updated All Crypto Imports

Updated all files that import crypto libraries to use the crypto initialization:

- `src/utils/keyDerivation.ts`
- `src/services/transactionService.ts`
- `src/store/walletStore.ts`
- `src/utils/secureStorage.ts`
- `src/components/SendSolModal.tsx`
- `src/utils/transactionTest.ts`

### 4. Build Configuration

- Added `metro.config.js` with proper polyfill aliases
- Added `babel.config.js` with module resolver for polyfills
- Added required dependencies: `text-encoding`, `process`, `babel-plugin-module-resolver`

### 5. Polyfill Testing (`src/utils/polyfillTest.ts`)

- Created comprehensive polyfill testing utility
- Automatically runs tests in development mode
- Provides detailed feedback on polyfill status

## Files Modified

### New Files

- `src/utils/cryptoInit.ts` - Crypto initialization module
- `src/utils/polyfillTest.ts` - Polyfill testing utility
- `metro.config.js` - Metro bundler configuration
- `babel.config.js` - Babel configuration

### Modified Files

- `src/utils/polyfills.ts` - Enhanced polyfill setup
- `package.json` - Added new dependencies
- `index.ts` - Added polyfill testing
- All crypto-importing files - Added crypto initialization imports

## Dependencies Added

```json
{
  "text-encoding": "^0.7.0",
  "process": "^0.11.10",
  "babel-plugin-module-resolver": "^5.0.0"
}
```

## Testing

The polyfill test utility will automatically run in development mode and log the status of all polyfills. Look for these logs:

- `✅ All polyfills loaded successfully`
- `🎉 All polyfill tests passed!`

## Expected Results

- No more Hermes crashes in production builds
- Proper crypto library initialization
- Consistent behavior between development and production builds
- Better error handling and debugging information

## Next Steps

1. Install new dependencies: `yarn install`
2. Clear Metro cache: `npx expo start --clear`
3. Build and test on TestFlight
4. Monitor logs for polyfill status

## Troubleshooting

If crashes persist:

1. Check that all polyfill tests pass in development
2. Verify metro and babel configurations are correct
3. Ensure all crypto imports use the crypto initialization
4. Check that polyfills are loaded before any crypto operations
