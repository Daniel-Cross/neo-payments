import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as bip39 from "bip39";

/**
 * Derives a public key from a private key input
 * Supports both base58 (Phantom format) and hex formats
 */
export const derivePublicKeyFromPrivateKey = (privateKeyInput: string): string => {
  try {
    // Clean the input
    const cleanPrivateKey = privateKeyInput.trim();

    if (!cleanPrivateKey || cleanPrivateKey.length === 0) {
      throw new Error("Private key cannot be empty");
    }

    let privateKeyBytes: Uint8Array;

    try {
      // Try base58 first (Phantom format)
      privateKeyBytes = bs58.decode(cleanPrivateKey);
    } catch (base58Error) {
      try {
        // Try hex format (remove '0x' prefix if present)
        const hexKey = cleanPrivateKey.replace("0x", "");

        // Check if it's a valid hex string
        if (!/^[0-9a-fA-F]+$/.test(hexKey)) {
          throw new Error("Private key must be in base58 or hexadecimal format");
        }

        // Check if it's the correct length (64 bytes = 128 hex characters)
        if (hexKey.length !== 128) {
          throw new Error(
            `Hex private key must be 64 bytes (128 hex characters). Got ${hexKey.length} characters`
          );
        }

        // Convert hex string to Uint8Array
        privateKeyBytes = new Uint8Array(
          hexKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
        );
      } catch (hexError) {
        throw new Error("Private key must be in base58 (Phantom) or hexadecimal format");
      }
    }

    // Validate the byte array length
    if (privateKeyBytes.length !== 64) {
      throw new Error(
        `Invalid private key length: expected 64 bytes, got ${privateKeyBytes.length}`
      );
    }

    // Create keypair and return public key
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    return keypair.publicKey.toString();
  } catch (error) {
    throw new Error(`Failed to derive public key from private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Derives a public key from a seed phrase (mnemonic)
 */
export const derivePublicKeyFromSeedPhrase = async (seedPhrase: string): Promise<string> => {
  try {
    // Clean and validate seed phrase
    const cleanSeedPhrase = seedPhrase.trim().toLowerCase();
    
    if (!bip39.validateMnemonic(cleanSeedPhrase)) {
      throw new Error("Invalid seed phrase");
    }

    // Generate seed from mnemonic
    const seed = await bip39.mnemonicToSeed(cleanSeedPhrase);

    // For Solana, we need to use the first 32 bytes of the seed
    // and create a keypair from it
    const seedBytes = seed.slice(0, 32);
    const keypair = Keypair.fromSeed(seedBytes);
    
    return keypair.publicKey.toString();
  } catch (error) {
    throw new Error(`Failed to derive public key from seed phrase: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Determines if the input is a seed phrase based on word count
 */
export const isSeedPhrase = (text: string): boolean => {
  const words = text.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
};

/**
 * Derives a public key from either a private key or seed phrase
 */
export const derivePublicKeyFromInput = async (input: string): Promise<string> => {
  if (isSeedPhrase(input)) {
    return await derivePublicKeyFromSeedPhrase(input);
  } else {
    return derivePublicKeyFromPrivateKey(input);
  }
};
