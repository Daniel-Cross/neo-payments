// React Native polyfills for Solana Web3.js
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";

// Make Buffer available globally for Solana Web3.js
global.Buffer = global.Buffer || Buffer;
