# Helius Webhooks Setup Guide

This guide explains how to set up Helius webhooks for transaction notifications with push notifications.

## Overview

The app uses Helius webhooks to receive real-time transaction notifications. When a transaction occurs involving your wallet addresses, Helius sends a webhook POST request to your backend endpoint, which can then trigger push notifications.

## Prerequisites

1. **Helius API Key** - You need a Helius API key with webhook access (Developer plan or higher)
2. **Backend Server** - A backend endpoint to receive webhook POST requests from Helius
3. **Expo Push Notifications** - Configured Expo project with push notification capabilities

## Setup Steps

### 1. Configure Environment Variables

Add these to your `.env` file:

```env
EXPO_PUBLIC_SOLANA_RPC_API_KEY=your_helius_api_key
EXPO_PUBLIC_WEBHOOK_URL=https://your-backend.com/webhooks/transactions
EXPO_PUBLIC_WEBHOOK_BASE_URL=https://your-backend.com
EXPO_PUBLIC_EAS_PROJECT_ID=ce6d91f4-c1ae-4e40-ad45-b187b5ec5d6f
```

### 2. Set Up Backend Endpoint

Create a backend endpoint (e.g., `/webhooks/transactions`) that:

1. Receives POST requests from Helius with transaction data
2. Validates the webhook payload
3. Sends push notifications using Expo Push Notifications API
4. Optionally stores transaction data in your database

Example backend endpoint structure:

```javascript
// Express.js example
app.post('/webhooks/transactions', async (req, res) => {
  const transactions = req.body;

  // Parse transactions
  const parsed = transactionWebhookService.parseWebhookPayload(transactions);

  // Send push notifications to relevant users
  for (const tx of parsed) {
    // Get user's Expo push token from your database
    const pushToken = await getUserPushToken(tx.to);

    if (pushToken) {
      await sendExpoPushNotification({
        to: pushToken,
        title: `Received ${tx.amount} SOL`,
        body: tx.memo || `From: ${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`,
        data: tx,
      });
    }
  }

  res.status(200).send('OK');
});
```

### 3. Register for Push Notifications

In your app, call `registerPushNotifications()` when the user logs in:

```typescript
const { registerPushNotifications } = useWalletStore();

// In your login/init flow
const pushToken = await registerPushNotifications();
if (pushToken) {
  // Store this token in your backend database
  // Associate it with the user's wallet address
}
```

### 4. Subscribe to Transaction Webhooks

When wallets are loaded, subscribe to webhooks:

```typescript
const { subscribeToTransactionWebhooks } = useWalletStore();

// After wallets are loaded
await subscribeToTransactionWebhooks();
```

This will:

- Create a Helius webhook monitoring all your wallet addresses
- Configure it to POST to your backend endpoint
- Monitor for TRANSFER, SWAP, NFT_SALE, and NFT_MINT transactions

## How It Works

1. **Transaction Occurs**: A transaction happens involving one of your monitored wallet addresses
2. **Helius Detects**: Helius webhook service detects the transaction
3. **Webhook Sent**: Helius sends POST request to your backend endpoint with transaction data
4. **Backend Processes**: Your backend:
   - Parses the transaction data
   - Looks up the user's Expo push token
   - Sends push notification via Expo Push Notifications API
5. **User Receives Notification**: User gets push notification on their device

## Webhook Payload Structure

Helius sends an array of transaction objects with this structure:

```json
[
  {
    "signature": "5VERv8NMxzbY...",
    "accountData": [],
    "description": "...",
    "events": [],
    "fee": 5000,
    "instructions": [],
    "nativeTransfers": [
      {
        "amount": 1000000000,
        "fromUserAccount": "SenderAddress...",
        "toUserAccount": "RecipientAddress..."
      }
    ],
    "slot": 123456789,
    "timestamp": 1640995200,
    "tokenTransfers": [],
    "type": "TRANSFER"
  }
]
```

## Managing Webhooks

The `transactionWebhookService` provides methods to:

- `createWebhook()` - Create a new webhook
- `updateWebhook()` - Update existing webhook with new addresses
- `deleteWebhook()` - Delete a webhook
- `getWebhooks()` - List all your webhooks

## Alternative: Mobile-Only Solution

If you don't have a backend, you can:

1. Use WebSocket subscriptions (already implemented for balance updates)
2. Poll for transactions periodically
3. Use local notifications when app is open

However, webhooks are better for push notifications because they work even when the app is closed.

## Troubleshooting

### Webhook Not Receiving Data

1. Check Helius dashboard to verify webhook is active
2. Test your backend endpoint with a POST request
3. Verify webhook URL is publicly accessible (not localhost)
4. Check Helius API key has webhook permissions

### Push Notifications Not Working

1. Verify Expo push token is registered
2. Check notification permissions are granted
3. Ensure backend is sending notifications correctly
4. Check device can receive notifications (not in Do Not Disturb mode)

### Rate Limiting

Helius webhooks have rate limits based on your plan. Monitor your usage in the Helius dashboard.

## Additional Resources

- [Helius Webhooks Documentation](https://docs.helius.dev/webhooks)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Helius Dashboard](https://dashboard.helius.dev/)
