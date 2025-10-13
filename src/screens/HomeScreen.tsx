import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWalletStore } from "../store/walletStore";
import { GradientBackground } from "../components/GradientBackground";
import OnboardingContent from "../components/OnboardingContent";
import WalletContent from "../components/WalletContent";
import { GradientType } from "../constants/enums";

const HomeScreen = () => {
  const { isConnected } = useWalletStore();

  return (
    <GradientBackground
      gradient={GradientType.PRIMARY}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isConnected ? <WalletContent /> : <OnboardingContent />}
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
});

export default HomeScreen;
