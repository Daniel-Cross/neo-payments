// Import crypto initialization first
import './cryptoInit';

// Now import crypto libraries (they're already initialized)
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as bip39 from 'bip39';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha2';
import { Buffer } from 'buffer';

/**
 * Derives a public key from a private key input
 * Supports both base58 (Phantom format) and hex formats
 */
export const derivePublicKeyFromPrivateKey = (privateKeyInput: string): string => {
  try {
    // Clean the input
    const cleanPrivateKey = privateKeyInput.trim();

    if (!cleanPrivateKey || cleanPrivateKey.length === 0) {
      throw new Error('Private key cannot be empty');
    }

    let privateKeyBytes: Uint8Array;

    try {
      // Try base58 first (Phantom format)
      privateKeyBytes = bs58.decode(cleanPrivateKey);
    } catch (base58Error) {
      try {
        // Try hex format (remove '0x' prefix if present)
        const hexKey = cleanPrivateKey.replace('0x', '');

        // Check if it's a valid hex string
        if (!/^[0-9a-fA-F]+$/.test(hexKey)) {
          throw new Error('Private key must be in base58 or hexadecimal format');
        }

        // Check if it's the correct length (64 bytes = 128 hex characters)
        if (hexKey.length !== 128) {
          throw new Error(
            `Hex private key must be 64 bytes (128 hex characters). Got ${hexKey.length} characters`
          );
        }

        // Convert hex string to Uint8Array
        privateKeyBytes = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      } catch (hexError) {
        throw new Error('Private key must be in base58 (Phantom) or hexadecimal format');
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
    throw new Error(
      `Failed to derive public key from private key: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

const deriveEd25519Key = (seed: Buffer | Uint8Array, path: string): Uint8Array => {
  try {
    const seedBytes = seed instanceof Uint8Array ? seed : new Uint8Array(seed);

    if (!seedBytes || seedBytes.length === 0) {
      throw new Error('Invalid seed: seed cannot be empty');
    }

    const MASTER_KEY = new TextEncoder().encode('ed25519 seed');
    let I = hmac(sha512, MASTER_KEY, seedBytes); // key, data order
    let privKey = I.slice(0, 32);
    let chainCode = I.slice(32);

    if (!path || typeof path !== 'string') {
      throw new Error('Invalid derivation path');
    }

    const parts = path.split('/').slice(1); // skip 'm'
    for (const part of parts) {
      if (!part) continue;

      const index = (parseInt(part.replace("'", ''), 10) + 0x80000000) >>> 0;

      if (isNaN(index)) {
        throw new Error(`Invalid derivation path component: ${part}`);
      }

      const data = Buffer.concat([Buffer.from([0x00]), Buffer.from(privKey), Buffer.alloc(4)]);
      data.writeUInt32BE(index, data.length - 4);
      I = hmac(sha512, chainCode, data);
      privKey = I.slice(0, 32);
      chainCode = I.slice(32);
    }
    return privKey;
  } catch (error) {
    throw new Error(
      `Failed to derive Ed25519 key: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Derives a keypair from a seed phrase using proper Ed25519 derivation
 * This matches Phantom's derivation exactly: m/44'/501'/0'/0' for first address
 * Uses SLIP-0010 Ed25519 key derivation (correct for Solana)
 */
export const deriveKeypairFromSeedPhrase = async (
  seedPhrase: string,
  accountIndex: number = 0
): Promise<Keypair> => {
  try {
    // Clean and validate seed phrase
    const cleanSeedPhrase = seedPhrase.trim().toLowerCase();

    if (!bip39.validateMnemonic(cleanSeedPhrase)) {
      throw new Error('Invalid seed phrase');
    }

    // 1. BIP39 mnemonic → seed
    const seed = await bip39.mnemonicToSeed(cleanSeedPhrase);

    // 2. Correct Solana derivation path (Phantom format)
    const derivationPath = `m/44'/501'/${accountIndex}'/0'`;

    // 3. ✅ SLIP-0010 ed25519 derivation (correct for Solana)
    const derivedPrivKey = deriveEd25519Key(seed, derivationPath);

    // 4. Solana keypair from derived seed
    const keypair = Keypair.fromSeed(Buffer.from(derivedPrivKey));

    return keypair;
  } catch (error) {
    throw new Error(
      `Failed to derive keypair from seed phrase: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Derives a public key from a seed phrase using proper BIP44 derivation
 * This matches Phantom's derivation: m/44'/501'/0'/0' for first address
 */
export const derivePublicKeyFromSeedPhrase = async (
  seedPhrase: string,
  accountIndex: number = 0
): Promise<string> => {
  const keypair = await deriveKeypairFromSeedPhrase(seedPhrase, accountIndex);
  return keypair.publicKey.toString();
};

/**
 * Derives multiple public keys from a seed phrase using BIP44 derivation paths
 * This matches Phantom's behavior for multiple addresses
 */
export const deriveMultiplePublicKeysFromSeedPhrase = async (
  seedPhrase: string,
  count: number = 5
): Promise<string[]> => {
  try {
    const publicKeys: string[] = [];

    for (let i = 0; i < count; i++) {
      const publicKey = await derivePublicKeyFromSeedPhrase(seedPhrase, i);
      publicKeys.push(publicKey);
    }

    return publicKeys;
  } catch (error) {
    throw new Error(
      `Failed to derive multiple public keys from seed phrase: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
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
