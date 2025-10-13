import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "../src/contexts/ThemeContext";
import { toastConfig } from "../src/utils/toast";
import "../src/utils/polyfills";
import { useWalletStore } from "../src/store/walletStore";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigator />
      <StatusBar style="light" />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { isConnected, loadWallets } = useWalletStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadWallets();
      } catch (error) {
        console.error("Failed to load wallet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loadWallets]);

  // Show loading state while checking wallet status
  if (isLoading) {
    return null; // You could add a loading screen here
  }

  // Show onboarding if wallet is not connected
  if (!isConnected) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="onboarding" />
      </Stack>
    );
  }

  // Show main app with tabs if wallet is connected
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
