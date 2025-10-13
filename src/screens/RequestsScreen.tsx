import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { GradientType, ButtonVariant } from "../constants/enums";

const RequestsScreen = () => {
  const { theme } = useTheme();

  // Mock data for requests
  const requests = [
    {
      id: "1",
      type: "Payment Request",
      amount: "2.5 SOL",
      from: "Alice",
      message: "Payment for services",
      status: "pending",
    },
    {
      id: "2",
      type: "Payment Request",
      amount: "1.0 SOL",
      from: "Bob",
      message: "Split dinner bill",
      status: "pending",
    },
  ];

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
          Payment Requests
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.LIGHT_GREY }]}>
          Manage incoming and outgoing payment requests
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {requests.length > 0 ? (
          requests.map((request) => (
            <GradientCard key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text
                  style={[styles.requestType, { color: theme.text.SOFT_WHITE }]}
                >
                  {request.type}
                </Text>
                <Text
                  style={[
                    styles.requestAmount,
                    { color: theme.text.SOFT_WHITE },
                  ]}
                >
                  {request.amount}
                </Text>
              </View>

              <Text
                style={[styles.requestFrom, { color: theme.text.LIGHT_GREY }]}
              >
                From: {request.from}
              </Text>

              <Text
                style={[
                  styles.requestMessage,
                  { color: theme.text.LIGHT_GREY },
                ]}
              >
                {request.message}
              </Text>

              <View style={styles.requestActions}>
                <GradientButton
                  title="Accept"
                  onPress={() => {}}
                  variant={ButtonVariant.PRIMARY}
                  style={styles.actionButton}
                />
                <GradientButton
                  title="Decline"
                  onPress={() => {}}
                  variant={ButtonVariant.SECONDARY}
                  style={styles.actionButton}
                />
              </View>
            </GradientCard>
          ))
        ) : (
          <GradientCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.text.LIGHT_GREY }]}>
              No payment requests at the moment
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
  requestCard: {
    marginBottom: 16,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requestType: {
    fontSize: 18,
    fontWeight: "600",
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  requestFrom: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    marginBottom: 16,
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
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

export default RequestsScreen;
