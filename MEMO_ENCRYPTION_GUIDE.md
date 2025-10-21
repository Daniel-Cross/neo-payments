# Memo Encryption Guide

## Overview

Memos sent with transactions are automatically encrypted so only the recipient can read them.

## How It Works

### Sending (Already Implemented ✅)

When sending a transaction with a memo in `SendSolModal`:

```typescript
// Memo is automatically encrypted before sending
const encryptedMemo = await transactionService.encryptMemoForRecipient(memo, recipientAddress);
```

### Receiving (Implementation Needed)

When displaying transaction history, decrypt memos for the user:

```typescript
// In your transaction history display component:
import { transactionService } from '../services/transactionService';
import { useWalletStore } from '../store/walletStore';

// Get the current wallet's keypair
const { selectedWallet } = useWalletStore();

// For each transaction with a memo:
const displayMemo = async transaction => {
  if (!transaction.memo) return null;

  // Try to decrypt the memo
  const result = await transactionService.tryDecryptMemo(transaction.memo, selectedWallet?.keypair);

  return result.text;
  // Returns:
  // - Decrypted text if successful
  // - "🔒 Encrypted message" if encrypted but no keypair
  // - "🔒 Encrypted (not for you)" if encrypted for someone else
  // - Plain text if not encrypted
};
```

## Example: Update HistoryScreen

```typescript
// In src/screens/HistoryScreen.tsx
const [decryptedMemos, setDecryptedMemos] = useState<Map<string, string>>(new Map());
const { selectedWallet } = useWalletStore();

// Decrypt memos when transactions load
useEffect(() => {
  const decryptMemos = async () => {
    const memos = new Map();

    for (const tx of transactions) {
      if (tx.memo) {
        const result = await transactionService.tryDecryptMemo(tx.memo, selectedWallet?.keypair);
        memos.set(tx.signature, result.text);
      }
    }

    setDecryptedMemos(memos);
  };

  if (transactions.length > 0) {
    decryptMemos();
  }
}, [transactions, selectedWallet]);

// Display in UI:
{
  decryptedMemos.get(transaction.signature) && (
    <Text style={styles.memoText}>📝 {decryptedMemos.get(transaction.signature)}</Text>
  );
}
```

## API Reference

### `encryptMemoForRecipient(memo: string, recipientAddress: string): Promise<string>`

Encrypts a memo for the recipient. Only they can decrypt it.

### `isEncryptedMemo(memo: string): boolean`

Check if a memo is encrypted (format: `base64:base64:base64`)

### `tryDecryptMemo(memo: string, keypair?: Keypair): Promise<{text, wasEncrypted, decrypted}>`

Safely try to decrypt a memo. Returns appropriate display text:

- **Decrypted**: Original memo text
- **Encrypted (no keypair)**: 🔒 Encrypted message
- **Encrypted (wrong recipient)**: 🔒 Encrypted (not for you)
- **Plain text**: Original text

### `decryptMemoPayload(encryptedMemo: string, keypair: Keypair): Promise<string>`

Direct decryption (throws error if fails). Use `tryDecryptMemo` instead for UI display.

## Security Notes

1. ✅ **End-to-end encryption**: Only sender and recipient can read
2. ✅ **On-chain privacy**: Encrypted memos are stored on Solana blockchain
3. ✅ **Ephemeral keys**: Each memo uses a unique encryption key
4. ⚠️ **Keypair required**: Users must have their keypair to decrypt received memos
5. ⚠️ **Fallback**: If encryption fails, memo is sent as plain text

## Testing

Send a test transaction with memo:

```
From: Your wallet
To: Another wallet you control
Memo: "Hello, secret message!"
```

Then view the transaction in the recipient wallet to see the decrypted memo.
