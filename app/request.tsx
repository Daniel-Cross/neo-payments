import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { GradientBackground } from '../src/components/GradientBackground';
import { GradientCard } from '../src/components/GradientCard';
import { GradientButton } from '../src/components/GradientButton';
import { GradientType, ButtonVariant } from '../src/constants/enums';
import { requestService, PaymentRequest } from '../src/services/requestService';
import { useWalletStore } from '../src/store/walletStore';

export default function RequestScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { selectedWallet } = useWalletStore();
  
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      loadRequest();
    } else {
      setIsLoading(false);
    }
  }, [requestId]);

  const loadRequest = () => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }

    try {
      const foundRequest = requestService.getRequest(requestId);
      setRequest(foundRequest || null);
    } catch (error) {
      console.error('Failed to load request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = () => {
    if (!request || !selectedWallet) return;

    if (request.to !== selectedWallet.publicKey) {
      Alert.alert('Error', 'This request is not for your wallet');
      return;
    }

    try {
      const result = requestService.acceptRequest(request.id);
      if (result.success) {
        Alert.alert(
          'Request Accepted',
          'The request has been accepted. You can now send the payment.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to send screen with pre-filled data
                router.push({
                  pathname: '/send',
                  params: {
                    address: request.from,
                    amount: request.amount.toString(),
                    memo: request.message || '',
                  },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to accept request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDeclineRequest = () => {
    if (!request) return;

    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this payment request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            try {
              const result = requestService.declineRequest(request.id);
              if (result.success) {
                Alert.alert('Request Declined', 'The request has been declined.');
                router.back();
              } else {
                Alert.alert('Error', result.error || 'Failed to decline request');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to decline request');
            }
          },
        },
      ]
    );
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(6)} SOL`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <GradientBackground gradient={GradientType.PRIMARY} style={styles.container}>
        <GradientCard style={styles.loadingCard}>
          <Text style={[styles.loadingText, { color: theme.text.SOFT_WHITE }]}>
            Loading request...
          </Text>
        </GradientCard>
      </GradientBackground>
    );
  }

  if (!request) {
    return (
      <GradientBackground gradient={GradientType.PRIMARY} style={styles.container}>
        <GradientCard style={styles.errorCard}>
          <Text style={[styles.errorText, { color: theme.text.ERROR_RED }]}>
            Request not found
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.text.LIGHT_GREY }]}>
            The payment request you're looking for doesn't exist or has expired.
          </Text>
          <GradientButton
            title="Go Back"
            onPress={() => router.back()}
            variant={ButtonVariant.PRIMARY}
            style={styles.backButton}
          />
        </GradientCard>
      </GradientBackground>
    );
  }

  const isForCurrentWallet = selectedWallet && request.to === selectedWallet.publicKey;
  const canRespond = isForCurrentWallet && request.status === 'pending';

  return (
    <GradientBackground gradient={GradientType.PRIMARY} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
          Payment Request
        </Text>
      </View>

      <GradientCard style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={[styles.requestType, { color: theme.text.SOFT_WHITE }]}>
            Payment Request
          </Text>
          <Text style={[styles.requestAmount, { color: theme.text.SOFT_WHITE }]}>
            {formatAmount(request.amount)}
          </Text>
        </View>

        <View style={styles.requestInfo}>
          <Text style={[styles.requestFrom, { color: theme.text.LIGHT_GREY }]}>
            From: {request.fromName || formatAddress(request.from)}
          </Text>
          
          {request.message && (
            <Text style={[styles.requestMessage, { color: theme.text.LIGHT_GREY }]}>
              "{request.message}"
            </Text>
          )}

          <Text style={[styles.requestDate, { color: theme.text.LIGHT_GREY }]}>
            Created: {formatDate(request.createdAt)}
          </Text>

          <Text style={[styles.statusText, { color: theme.text.LIGHT_GREY }]}>
            Status: {request.status.toUpperCase()}
          </Text>
        </View>

        {canRespond && (
          <View style={styles.requestActions}>
            <GradientButton
              title="Accept & Pay"
              onPress={handleAcceptRequest}
              variant={ButtonVariant.PRIMARY}
              style={styles.actionButton}
            />
            <GradientButton
              title="Decline"
              onPress={handleDeclineRequest}
              variant={ButtonVariant.SECONDARY}
              style={styles.actionButton}
            />
          </View>
        )}

        {!isForCurrentWallet && (
          <View style={styles.notForYouCard}>
            <Text style={[styles.notForYouText, { color: theme.text.LIGHT_GREY }]}>
              This request is not for your wallet
            </Text>
          </View>
        )}
      </GradientCard>
    </GradientBackground>
  );
}

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
    fontWeight: 'bold',
  },
  loadingCard: {
    margin: 20,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  errorCard: {
    margin: 20,
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 10,
  },
  requestCard: {
    margin: 20,
    padding: 20,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestType: {
    fontSize: 20,
    fontWeight: '600',
  },
  requestAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  requestInfo: {
    marginBottom: 20,
  },
  requestFrom: {
    fontSize: 16,
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  requestDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  notForYouCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  notForYouText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
