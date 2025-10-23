import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWalletStore } from "../store/walletStore";
import { GradientBackground } from "../components/GradientBackground";
import OnboardingContent from "../components/OnboardingContent";
import WalletContent from "../components/WalletContent";
import { GradientType } from "../constants/enums";
import { useDeepLink } from "../hooks/useDeepLink";

const HomeScreen = () => {
  const { isConnected } = useWalletStore();
  
  // Initialize deep link handling (this will handle navigation automatically)
  useDeepLink();

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {isConnected ? <WalletContent /> : <OnboardingContent />}
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default HomeScreen;
