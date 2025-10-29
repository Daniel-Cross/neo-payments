// Theme and UI enums
export enum ThemeMode {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum GradientType {
  PRIMARY = 'primary',
  CARD = 'card',
  BUTTON = 'button',
  ACCENT = 'accent',
}

export enum TabName {
  HOME = 'home',
  REQUESTS = 'requests',
  HISTORY = 'history',
  SETTINGS = 'settings',
}

export enum IconName {
  LIGHTNING_BOLT = 'lightning-bolt',
  LIGHTNING_BOLT_OUTLINE = 'lightning-bolt-outline',
  ACCOUNT_ARROW_UP = 'account-arrow-up',
  ACCOUNT_ARROW_UP_OUTLINE = 'account-arrow-up-outline',
  CLOCK = 'clock',
  CLOCK_OUTLINE = 'clock-outline',
  COG = 'cog',
  COG_OUTLINE = 'cog-outline',
}

export enum Route {
  TABS = '/(tabs)',
  CREATE_WALLET = '/create-wallet',
  IMPORT_WALLET = '/import-wallet',
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export enum ButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum CardVariant {
  DEFAULT = 'default',
  ELEVATED = 'elevated',
  OUTLINED = 'outlined',
}

// Wallet and transaction enums
export enum WalletAction {
  CREATE = 'create',
  IMPORT = 'import',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  EXPORT = 'export',
}

export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  SWAP = 'swap',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

// Storage and security enums
export enum StorageKey {
  WALLET_PRIVATE_KEY = 'neo_wallet_private_key',
  WALLET_PUBLIC_KEY = 'neo_wallet_public_key',
  WALLETS_DATA = 'neo_wallets_data',
  TEST_KEY = 'neo_test_key',
  TEST_AUTH_KEY = 'neo_test_auth_key',
}

export enum SecureStorageService {
  NEO_WALLET = 'neo-wallet',
}

// UI text enums
export enum AlertTitle {
  WALLET_CREATED = 'Wallet Created!',
  WALLET_IMPORTED = 'Success',
  ERROR = 'Error',
  SECURE_STORAGE_UNAVAILABLE = 'Secure Storage Unavailable',
  DISCONNECT_WALLET = 'Disconnect Wallet',
  PRIVATE_KEY = 'Private Key',
  CONFIRM_TRANSACTION = 'Confirm Transaction',
}

export enum AlertMessage {
  WALLET_CREATED_SUCCESS = 'Your new Solana wallet has been created successfully and stored securely on your device.',
  WALLET_IMPORTED_SUCCESS = 'Wallet imported successfully and stored securely!',
  CREATE_WALLET_ERROR = 'Failed to create wallet. Please try again.',
  IMPORT_WALLET_ERROR = 'Failed to import wallet. Please try again.',
  INVALID_PRIVATE_KEY = 'Invalid private key. Please check and try again.',
  ENTER_PRIVATE_KEY = 'Please enter a valid private key.',
  SECURE_STORAGE_UNAVAILABLE_CREATE = 'Your device does not support secure storage. Wallet creation is not available.',
  SECURE_STORAGE_UNAVAILABLE_IMPORT = 'Your device does not support secure storage. Wallet import is not available.',
  DISCONNECT_CONFIRMATION = 'Are you sure you want to disconnect your wallet? This will remove it from secure storage.',
  EXPORT_PRIVATE_KEY_ERROR = 'Failed to export private key. Please try again.',
  PRIVATE_KEY_WARNING = 'Keep this safe and never share it with anyone!',
  CHECK_INPUTS_AND_TRY_AGAIN = 'Please check your inputs and try again',
  INSUFFICIENT_BALANCE = 'Insufficient balance to cover amount and fees',
  TRANSACTION_FAILED = 'Transaction failed',
}

export enum ButtonText {
  CANCEL = 'Cancel',
  DISCONNECT = 'Disconnect',
  IMPORT = 'Import',
  COPY = 'Copy',
  OK = 'OK',
  REFRESH_BALANCE = 'Refresh Balance',
  EXPORT_PRIVATE_KEY = 'Export Private Key',
  SEND_SOL = 'Send SOL',
  RECEIVE_SOL = 'Receive SOL',
  CREATE_NEW_WALLET = 'Create New Wallet',
  IMPORT_EXISTING_WALLET = 'Import Existing Wallet',
  SECURE_STORAGE_UNAVAILABLE = 'Secure Storage Unavailable',
  IMPORT_UNAVAILABLE = 'Import Unavailable',
  SENDING = 'Sending...',
  SEND = 'Send',
}

export enum ScreenTitle {
  MY_WALLET = 'My Wallet',
  CONNECT_WALLET = 'Connect Wallet',
  WELCOME_TO_NEO = 'Welcome to Neo',
}

export enum PlaceholderText {
  PRIVATE_KEY_INPUT = 'Paste your private key here...',
  SOLANA_ADDRESS = 'Enter Solana address...',
}

export enum LabelText {
  SOL_BALANCE = 'SOL Balance',
  WALLET_ADDRESS = 'Wallet Address:',
  ENTER_PRIVATE_KEY = 'Enter your private key:',
  WELCOME_SUBTITLE = 'Connect your Solana wallet or create a new one to start sending and receiving SOL',
  RECIPIENT_ADDRESS = 'Recipient Address',
  INSUFFICIENT_BALANCE = 'Insufficient balance',
  INVALID_AMOUNT = 'Invalid amount',
  INVALID_SOLANA_ADDRESS = 'Invalid Solana address',
}

// Authentication prompts
export enum AuthPrompt {
  ACCESS_WALLET = 'Authenticate to access your wallet',
  EXPORT_PRIVATE_KEY = 'Authenticate to export your private key',
}

// RPC and network enums
export enum SolanaNetwork {
  MAINNET = 'https://api.mainnet-beta.solana.com',
  DEVNET = 'https://api.devnet.solana.com',
  TESTNET = 'https://api.testnet.solana.com',
}

// RPC endpoints configuration
// Priority: API key endpoints first, then free fallbacks
export const getSolanaRpcEndpoints = (): string[] => {
  const apiKey = process.env.EXPO_PUBLIC_SOLANA_RPC_API_KEY;
  const provider = process.env.EXPO_PUBLIC_SOLANA_RPC_PROVIDER;

  // If API key is provided, use it as primary endpoint
  if (apiKey) {
    const endpoints: { [key: string]: string } = {
      helius: `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      alchemy: `https://solana-mainnet.g.alchemy.com/v2/${apiKey}`,
      genesysgo: `https://ssc-dao.genesysgo.net/${apiKey}`,
    };

    const primaryEndpoint = endpoints[provider as keyof typeof endpoints];
    if (primaryEndpoint) {
      return [
        primaryEndpoint,
        'https://api.mainnet-beta.solana.com', // Official fallback
        'https://rpc.ankr.com/solana', // Free fallback
        'https://solana.public-rpc.com', // Free fallback
      ];
    }
  }

  // Fallback to free endpoints if no API key
  return [
    'https://api.mainnet-beta.solana.com', // Official
    'https://rpc.ankr.com/solana', // Free
    'https://solana.public-rpc.com', // Free
    'https://solana-mainnet.g.alchemy.com/v2/demo', // Demo (limited)
  ];
};

// For backward compatibility
export const SOLANA_RPC_ENDPOINTS = getSolanaRpcEndpoints();

export enum ConnectionCommitment {
  CONFIRMED = 'confirmed',
  FINALIZED = 'finalized',
  PROCESSED = 'processed',
}

// Typography enums
export enum TypographyVariant {
  DISPLAY_LARGE = 'displayLarge',
  DISPLAY_MEDIUM = 'displayMedium',
  DISPLAY_SMALL = 'displaySmall',
  HEADLINE_LARGE = 'headlineLarge',
  HEADLINE_MEDIUM = 'headlineMedium',
  HEADLINE_SMALL = 'headlineSmall',
  TITLE_LARGE = 'titleLarge',
  TITLE_MEDIUM = 'titleMedium',
  TITLE_SMALL = 'titleSmall',
  BODY_LARGE = 'bodyLarge',
  BODY_MEDIUM = 'bodyMedium',
  BODY_SMALL = 'bodySmall',
  LABEL_LARGE = 'labelLarge',
  LABEL_MEDIUM = 'labelMedium',
  LABEL_SMALL = 'labelSmall',
  CAPTION = 'caption',
  MONOSPACE = 'monospace',
}

export enum TypographyWeight {
  LIGHT = '300',
  REGULAR = '400',
  MEDIUM = '500',
  SEMIBOLD = '600',
  BOLD = '700',
  EXTRABOLD = '800',
}

export enum TypographyAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export enum FeeOption {
  SLOW = 'slow',
  STANDARD = 'standard',
  FAST = 'fast',
}

export enum NetworkCongestion {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum PrivacyLevel {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  MAXIMUM = 'maximum',
}

export enum MemoPrivacy {
  NONE = 'none',
  ENCRYPTED = 'encrypted',
  HASHED = 'hashed',
}

// Input mode enums
export enum InputMode {
  CURRENCY = 'currency',
  SOL = 'sol',
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
}

// Currency enums
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
}

// Recipient selection enums
export enum RecipientType {
  WALLET_ADDRESS = 'wallet_address',
  CONTACTS = 'contacts',
  FAVORITES = 'favorites',
}

export enum RecipientSelectionText {
  SELECT_RECIPIENT = 'Select Recipient',
  WALLET_ADDRESS = 'Wallet Address',
  CONTACTS = 'Contacts',
  FAVORITES = 'Favorites',
  NO_CONTACTS = 'No contacts found',
  NO_FAVORITES = 'No favorites found',
  ADD_TO_FAVORITES = 'Add to Favorites',
  REMOVE_FROM_FAVORITES = 'Remove from Favorites',
}

// Deep link enums
export enum DeepLinkType {
  SEND = 'send',
  RECEIVE = 'receive',
  REQUEST = 'request',
  UNKNOWN = 'unknown',
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export enum RequestType {
  PAYMENT_REQUEST = 'payment_request',
}
