// React Native polyfills for Solana Web3.js
import "react-native-get-random-values";
import { Buffer } from "buffer";

// Make Buffer available globally for Solana Web3.js
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

// Ensure crypto.getRandomValues is available
if (typeof global.crypto === "undefined") {
  global.crypto = require("react-native-get-random-values");
}
