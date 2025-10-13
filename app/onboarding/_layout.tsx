import { Stack } from "expo-router";
import { useTheme } from "../../src/contexts/ThemeContext";
import { ThemeProvider } from "../../src/contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { toastConfig } from "../../src/utils/toast";
import "../../src/utils/polyfills";

export default function OnboardingLayout() {
  return (
    <ThemeProvider>
      <OnboardingStack />
      <StatusBar style="light" />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}

function OnboardingStack() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background.NAVY,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create-wallet" />
      <Stack.Screen name="import-wallet" />
    </Stack>
  );
}
