// Theme and UI enums
export enum ThemeMode {
  DARK = "dark",
  LIGHT = "light",
}

export enum GradientType {
  PRIMARY = "primary",
  CARD = "card",
  BUTTON = "button",
  ACCENT = "accent",
}

export enum ButtonVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  ACCENT = "accent",
}

export enum ButtonSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum CardVariant {
  DEFAULT = "default",
  ELEVATED = "elevated",
  OUTLINED = "outlined",
}

// Wallet and transaction enums
export enum WalletAction {
  CREATE = "create",
  IMPORT = "import",
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  EXPORT = "export",
}

export enum TransactionType {
  SEND = "send",
  RECEIVE = "receive",
  SWAP = "swap",
}

export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

// Storage and security enums
export enum StorageKey {
  WALLET_PRIVATE_KEY = "blink_wallet_private_key",
  WALLET_PUBLIC_KEY = "blink_wallet_public_key",
  TEST_KEY = "blink_test_key",
}

export enum SecureStorageService {
  BLINK_WALLET = "blink-wallet",
}

// UI text enums
export enum AlertTitle {
  WALLET_CREATED = "Wallet Created!",
  WALLET_IMPORTED = "Success",
  ERROR = "Error",
  SECURE_STORAGE_UNAVAILABLE = "Secure Storage Unavailable",
  DISCONNECT_WALLET = "Disconnect Wallet",
  PRIVATE_KEY = "Private Key",
}

export enum AlertMessage {
  WALLET_CREATED_SUCCESS = "Your new Solana wallet has been created successfully and stored securely on your device.",
  WALLET_IMPORTED_SUCCESS = "Wallet imported successfully and stored securely!",
  CREATE_WALLET_ERROR = "Failed to create wallet. Please try again.",
  IMPORT_WALLET_ERROR = "Failed to import wallet. Please try again.",
  INVALID_PRIVATE_KEY = "Invalid private key. Please check and try again.",
  ENTER_PRIVATE_KEY = "Please enter a valid private key.",
  SECURE_STORAGE_UNAVAILABLE_CREATE = "Your device does not support secure storage. Wallet creation is not available.",
  SECURE_STORAGE_UNAVAILABLE_IMPORT = "Your device does not support secure storage. Wallet import is not available.",
  DISCONNECT_CONFIRMATION = "Are you sure you want to disconnect your wallet? This will remove it from secure storage.",
  EXPORT_PRIVATE_KEY_ERROR = "Failed to export private key. Please try again.",
  PRIVATE_KEY_WARNING = "Keep this safe and never share it with anyone!",
}

export enum ButtonText {
  CANCEL = "Cancel",
  DISCONNECT = "Disconnect",
  IMPORT = "Import",
  COPY = "Copy",
  OK = "OK",
  REFRESH_BALANCE = "Refresh Balance",
  EXPORT_PRIVATE_KEY = "Export Private Key",
  SEND_SOL = "Send SOL",
  RECEIVE_SOL = "Receive SOL",
  CREATE_NEW_WALLET = "Create New Wallet",
  IMPORT_EXISTING_WALLET = "Import Existing Wallet",
  SECURE_STORAGE_UNAVAILABLE = "Secure Storage Unavailable",
  IMPORT_UNAVAILABLE = "Import Unavailable",
}

export enum ScreenTitle {
  MY_WALLET = "My Wallet",
  CONNECT_WALLET = "Connect Wallet",
  WELCOME_TO_BLINK = "Welcome to Blink",
}

export enum PlaceholderText {
  PRIVATE_KEY_INPUT = "Paste your private key here...",
}

export enum LabelText {
  SOL_BALANCE = "SOL Balance",
  WALLET_ADDRESS = "Wallet Address:",
  ENTER_PRIVATE_KEY = "Enter your private key:",
  WELCOME_SUBTITLE = "Connect your Solana wallet or create a new one to start sending and receiving SOL",
}

// Authentication prompts
export enum AuthPrompt {
  ACCESS_WALLET = "Authenticate to access your wallet",
  EXPORT_PRIVATE_KEY = "Authenticate to export your private key",
}

// RPC and network enums
export enum SolanaNetwork {
  MAINNET = "https://api.mainnet-beta.solana.com",
  DEVNET = "https://api.devnet.solana.com",
  TESTNET = "https://api.testnet.solana.com",
}

export enum ConnectionCommitment {
  CONFIRMED = "confirmed",
  FINALIZED = "finalized",
  PROCESSED = "processed",
}
