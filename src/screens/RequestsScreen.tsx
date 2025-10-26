import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useWalletStore } from "../store/walletStore";
import { GradientBackground } from "../components/GradientBackground";
import { GradientCard } from "../components/GradientCard";
import { GradientButton } from "../components/GradientButton";
import { GradientType, ButtonVariant, RequestStatus } from "../constants/enums";
import { supabaseRequestService, PaymentRequest } from "../services/supabaseRequestService";
import CreateRequestModal from "../components/CreateRequestModal";

const RequestsScreen = () => {
  const { theme } = useTheme();
  const { selectedWallet } = useWalletStore();
  
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load requests when component mounts or wallet changes
  useEffect(() => {
    if (selectedWallet) {
      loadRequests();
    } else {
      setRequests([]);
    }
  }, [selectedWallet]);

  const loadRequests = async () => {
    if (!selectedWallet) return;
    
    setIsLoading(true);
    try {
      const incomingRequests = await supabaseRequestService.getIncomingRequests(selectedWallet.publicKey);
      setRequests(incomingRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRequests();
    setIsRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!selectedWallet) return;
    
    try {
      const result = await supabaseRequestService.acceptRequest(requestId, selectedWallet.publicKey);
      if (result.success) {
        await loadRequests(); // Reload to update status
        // TODO: Navigate to send modal with pre-filled data
      } else {
        alert(result.error || 'Failed to accept request');
      }
    } catch (error) {
      alert('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!selectedWallet) return;
    
    try {
      const result = await supabaseRequestService.declineRequest(requestId, selectedWallet.publicKey);
      if (result.success) {
        await loadRequests(); // Reload to update status
      } else {
        alert(result.error || 'Failed to decline request');
      }
    } catch (error) {
      alert('Failed to decline request');
    }
  };

  const handleRequestCreated = (requestId: string) => {
    // Refresh to show any new incoming requests
    loadRequests();
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(4)} SOL`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return theme.text.WARNING_ORANGE;
      case RequestStatus.ACCEPTED:
        return theme.text.SUCCESS_GREEN;
      case RequestStatus.DECLINED:
        return theme.text.ERROR_RED;
      case RequestStatus.EXPIRED:
        return theme.text.LIGHT_GREY;
      default:
        return theme.text.LIGHT_GREY;
    }
  };

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
          Incoming payment requests
        </Text>
      </View>

      {/* Create Request Button */}
      <View style={styles.buttonContainer}>
        <GradientButton 
        title="💸 Request Payment"
        onPress={() => setShowCreateModal(true)}
        />
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
              Loading requests...
            </Text>
          </GradientCard>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <GradientCard key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text
                  style={[styles.requestType, { color: theme.text.SOFT_WHITE }]}
                >
                  Payment Request
                </Text>
                <Text
                  style={[
                    styles.requestAmount,
                    { color: theme.text.SOFT_WHITE },
                  ]}
                >
                  {formatAmount(request.amount)}
                </Text>
              </View>

                  <View style={styles.requestInfo}>
                    <Text
                      style={[styles.requestFrom, { color: theme.text.LIGHT_GREY }]}
                    >
                      From: {request.requester_name || formatAddress(request.requester_wallet_address)}
                    </Text>
                
                {request.message && (
                  <Text
                    style={[
                      styles.requestMessage,
                      { color: theme.text.LIGHT_GREY },
                    ]}
                  >
                    "{request.message}"
                  </Text>
                )}

                    <Text
                      style={[styles.requestDate, { color: theme.text.LIGHT_GREY }]}
                    >
                      Created: {formatDate(new Date(request.created_at).getTime())}
                    </Text>

                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(request.status) },
                    ]}
                  >
                    Status: {request.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {request.status === RequestStatus.PENDING && (
                <View style={styles.requestActions}>
                  <GradientButton
                    title="Accept"
                    onPress={() => handleAcceptRequest(request.id)}
                    variant={ButtonVariant.PRIMARY}
                    style={styles.actionButton}
                  />
                  <GradientButton
                    title="Decline"
                    onPress={() => handleDeclineRequest(request.id)}
                    variant={ButtonVariant.SECONDARY}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </GradientCard>
          ))
        ) : (
          <GradientCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.text.LIGHT_GREY }]}>
              {selectedWallet 
                ? 'No incoming payment requests at the moment'
                : 'Please select a wallet to view payment requests'
              }
            </Text>
          </GradientCard>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.ELECTRIC_BLUE }]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <CreateRequestModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRequestCreated={handleRequestCreated}
      />
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
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  createRequestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createRequestIcon: {
    fontSize: 20,
  },
  createRequestText: {
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 12,
  },
  requestType: {
    fontSize: 18,
    fontWeight: "600",
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  requestInfo: {
    marginBottom: 16,
  },
  requestFrom: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: "italic",
  },
  requestDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
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
  loadingCard: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default RequestsScreen;
