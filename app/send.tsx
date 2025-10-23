import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWalletStore } from '../src/store/walletStore';
import { GradientBackground } from '../src/components/GradientBackground';
import SendSolModal from '../src/components/SendSolModal';
import { GradientType } from '../src/constants/enums';

export default function SendScreen() {
  const router = useRouter();
  const { isConnected } = useWalletStore();
  const [showSendModal, setShowSendModal] = useState(false);
  
  // Get parameters from the deep link URL
  const { address, amount, memo } = useLocalSearchParams<{
    address?: string;
    amount?: string;
    memo?: string;
  }>();

  useEffect(() => {
    // If wallet is not connected, redirect to home
    if (!isConnected) {
      router.replace('/(tabs)');
      return;
    }

    // If we have an address parameter, open the send modal
    if (address) {
      setShowSendModal(true);
    } else {
      // If no address, redirect to home
      router.replace('/(tabs)');
    }
  }, [isConnected, address, router]);

  const handleClose = () => {
    setShowSendModal(false);
    // Navigate back to home after closing
    router.replace('/(tabs)');
  };

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.content}>
          {/* Send SOL Modal */}
          <SendSolModal
            visible={showSendModal}
            onClose={handleClose}
            initialRecipientAddress={address}
            initialAmount={amount}
            initialMemo={memo}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
