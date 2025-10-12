import "./src/utils/polyfills";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { GradientBackground } from "./src/components/GradientBackground";
import WalletScreen from "./src/screens/WalletScreen";
import { GradientType } from "./src/constants/enums";
import { toastConfig } from "./src/utils/toast";

export default function App() {
  return (
    <ThemeProvider>
      <GradientBackground
        gradient={GradientType.PRIMARY}
        style={styles.container}
      >
        <WalletScreen />
        <StatusBar style="light" />
      </GradientBackground>
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
