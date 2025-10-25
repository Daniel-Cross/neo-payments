import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useWalletStore } from "../store/walletStore";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientType } from "../constants/enums";
import { TransactionDetails, transactionService } from "../services/transactionService";

const HistoryScreen = () => {
  const { theme } = useTheme();
  const { selectedWallet, getTransactionHistory, publicKey } = useWalletStore();
  
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [decryptedMemos, setDecryptedMemos] = useState<Map<string, string>>(new Map());

  // Load transaction history when component mounts or wallet changes
  useEffect(() => {
    if (selectedWallet && publicKey) {
      loadTransactionHistory();
    } else {
      setTransactions([]);
      setDecryptedMemos(new Map());
    }
  }, [selectedWallet, publicKey]);

  // Decrypt memos when transactions are loaded
  useEffect(() => {
    const decryptMemos = async () => {
      if (transactions.length === 0 || !selectedWallet) {
        setDecryptedMemos(new Map());
        return;
      }

      const memos = new Map<string, string>();

      for (const tx of transactions) {
        if (tx.memo) {
          try {
            const result = await transactionService.tryDecryptMemo(tx.memo, selectedWallet.keypair);
            memos.set(tx.signature, result.text);
          } catch (error) {
            console.warn(`Failed to decrypt memo for transaction ${tx.signature}:`, error);
            memos.set(tx.signature, tx.memo); // Fallback to raw memo
          }
        }
      }

      setDecryptedMemos(memos);
    };

    decryptMemos();
  }, [transactions, selectedWallet]);

  const loadTransactionHistory = async () => {
    if (!selectedWallet) return;
    
    setIsLoading(true);
    try {
      // Load a smaller number of transactions initially to avoid rate limiting
      const history = await getTransactionHistory();
      setTransactions(history);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      // Don't show error to user, just log it and show empty state
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactionHistory();
    setIsRefreshing(false);
  };

  // Helper functions to determine transaction type and styling
  const getTransactionType = (transaction: TransactionDetails) => {
    if (!selectedWallet) return 'unknown';
    return transaction.from === selectedWallet.publicKey ? 'sent' : 'received';
  };

  const getTransactionIcon = (transaction: TransactionDetails) => {
    const type = getTransactionType(transaction);
    return type === "sent" ? "↓" : "↑";
  };

  const getTransactionColor = (transaction: TransactionDetails) => {
    const type = getTransactionType(transaction);
    return type === "sent" ? theme.text.ERROR_RED : theme.text.SUCCESS_GREEN;
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(4)} SOL`;
  };

  const formatDate = (blockTime: number) => {
    if (!blockTime) return 'Unknown';
    const date = new Date(blockTime * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
          Transaction History
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.LIGHT_GREY }]}>
          {selectedWallet ? `${selectedWallet.name} - ${formatAddress(selectedWallet.publicKey)}` : 'No wallet selected'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.text.SOFT_WHITE}
          />
        }
      >
            {isLoading ? (
              <GradientCard style={styles.loadingCard}>
                <ActivityIndicator size="large" color={theme.text.SOFT_WHITE} />
                <Text style={[styles.loadingText, { color: theme.text.LIGHT_GREY }]}>
                  Loading transactions...
                </Text>
                <Text style={[styles.loadingSubtext, { color: theme.text.LIGHT_GREY }]}>
                  Fetching transaction history
                </Text>
              </GradientCard>
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => {
            const type = getTransactionType(transaction);
            return (
              <GradientCard key={transaction.signature} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text
                      style={[
                        styles.transactionIcon,
                        { color: getTransactionColor(transaction) },
                      ]}
                    >
                      {getTransactionIcon(transaction)}
                    </Text>
                    <View style={styles.transactionDetails}>
                      <Text
                        style={[
                          styles.transactionType,
                          { color: theme.text.SOFT_WHITE },
                        ]}
                      >
                        {type === "sent" ? "Sent to" : "Received from"}
                      </Text>
                      <Text
                        style={[
                          styles.transactionAddress,
                          { color: theme.text.LIGHT_GREY },
                        ]}
                      >
                        {type === "sent" ? formatAddress(transaction.to) : formatAddress(transaction.from)}
                      </Text>
                      {decryptedMemos.get(transaction.signature) && (
                        <Text
                          style={[
                            styles.memo,
                            { color: theme.text.LIGHT_GREY },
                          ]}
                        >
                          "{decryptedMemos.get(transaction.signature)}"
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text
                      style={[
                        styles.amount,
                        { color: getTransactionColor(transaction) },
                      ]}
                    >
                      {type === "sent" ? "-" : "+"}
                      {formatAmount(transaction.amount)}
                    </Text>
                    <Text style={[styles.date, { color: theme.text.LIGHT_GREY }]}>
                      {formatDate(transaction.blockTime)}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          transaction.status === "success"
                            ? theme.text.SUCCESS_GREEN
                            : theme.text.ERROR_RED,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: "#000" }]}>
                      {transaction.status}
                    </Text>
                  </View>
                  <Text style={[styles.feeText, { color: theme.text.LIGHT_GREY }]}>
                    Fee: {(transaction.fee / 1000000000).toFixed(6)} SOL
                  </Text>
                </View>
              </GradientCard>
            );
          })
            ) : (
              <GradientCard style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: theme.text.LIGHT_GREY }]}>
                  {selectedWallet ? 'No transactions found' : 'Please select a wallet to view transaction history'}
                </Text>
              </GradientCard>
            )}
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionCard: {
    marginBottom: 16,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionAddress: {
    fontSize: 14,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 40,
  },
      emptyText: {
        fontSize: 16,
        textAlign: "center",
      },
      emptySubtext: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 8,
        fontStyle: "italic",
      },
  loadingCard: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
      loadingText: {
        fontSize: 16,
        textAlign: "center",
      },
      loadingSubtext: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 4,
      },
  memo: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  feeText: {
    fontSize: 10,
    marginLeft: 8,
  },
});

export default HistoryScreen;
