import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientType } from "../constants/enums";

const HistoryScreen = () => {
  const { theme } = useTheme();

  // Mock transaction history data
  const transactions = [
    {
      id: "1",
      type: "sent",
      amount: "2.5 SOL",
      to: "Alice",
      date: "2024-01-15",
      status: "confirmed",
    },
    {
      id: "2",
      type: "received",
      amount: "1.0 SOL",
      from: "Bob",
      date: "2024-01-14",
      status: "confirmed",
    },
    {
      id: "3",
      type: "sent",
      amount: "0.5 SOL",
      to: "Charlie",
      date: "2024-01-13",
      status: "pending",
    },
  ];

  const getTransactionIcon = (type: string) => {
    return type === "sent" ? "↓" : "↑";
  };

  const getTransactionColor = (type: string) => {
    return type === "sent" ? theme.text.ERROR_RED : theme.text.SUCCESS_GREEN;
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
          View all your Solana transactions
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <GradientCard key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text
                    style={[
                      styles.transactionIcon,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {getTransactionIcon(transaction.type)}
                  </Text>
                  <View style={styles.transactionDetails}>
                    <Text
                      style={[
                        styles.transactionType,
                        { color: theme.text.SOFT_WHITE },
                      ]}
                    >
                      {transaction.type === "sent"
                        ? "Sent to"
                        : "Received from"}
                    </Text>
                    <Text
                      style={[
                        styles.transactionAddress,
                        { color: theme.text.LIGHT_GREY },
                      ]}
                    >
                      {transaction.type === "sent"
                        ? transaction.to
                        : transaction.from}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.amount,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {transaction.type === "sent" ? "-" : "+"}
                    {transaction.amount}
                  </Text>
                  <Text style={[styles.date, { color: theme.text.LIGHT_GREY }]}>
                    {transaction.date}
                  </Text>
                </View>
              </View>

              <View style={styles.transactionFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        transaction.status === "confirmed"
                          ? theme.text.SUCCESS_GREEN
                          : theme.text.WARNING_ORANGE,
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: "#000" }]}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
            </GradientCard>
          ))
        ) : (
          <GradientCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.text.LIGHT_GREY }]}>
              No transactions yet
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
});

export default HistoryScreen;
