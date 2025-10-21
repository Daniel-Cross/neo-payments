import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { useEffect } from 'react';
import { useTheme } from '../src/contexts/ThemeContext';

export default function ReceiveSolRoute() {
  const { theme } = useTheme();

  useEffect(() => {
    router.back();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Receive SOL',
          headerShown: false,
        }}
      />
      <View style={{ flex: 1, backgroundColor: theme.background.DARK_PURPLE }} />
    </>
  );
}
