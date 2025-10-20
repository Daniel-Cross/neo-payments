import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';

export default function ReceiveSolRoute() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Receive SOL',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1a0b2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Receive SOL</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>
    </>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
