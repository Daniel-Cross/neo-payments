import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "../src/contexts/ThemeContext";
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
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Kanit: require("../assets/fonts/Kanit-Regular.ttf"),
    KanitBold: require("../assets/fonts/Kanit-SemiBold.ttf"),
  });

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
  }, []); // Remove loadWallets from dependencies to prevent multiple calls

  // Show loading screen while fonts or wallet are loading
  if (!fontsLoaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background.DARK_PURPLE,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.ELECTRIC_BLUE} />
      </View>
    );
  }

  // Default to onboarding screen - only show home if wallet is connected
  if (isConnected) {
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

  // Show onboarding by default (when not connected)
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
