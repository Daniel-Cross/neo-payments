import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientBackground } from '../components/GradientBackground';
import { GradientCard } from '../components/GradientCard';
import { GradientButton } from '../components/GradientButton';
import { GradientType, ButtonVariant, Route } from '../constants/enums';
import { useWalletStore } from '../store/walletStore';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const SettingsScreen = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { disconnectWallet } = useWalletStore();

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      Toast.show({
        type: 'success',
        text1: 'Wallet Disconnected',
        text2: 'Your wallet has been disconnected and removed from secure storage.',
      });
      router.replace(Route.TABS);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to disconnect wallet. Please try again.',
      });
    }
  };

  const settingsSections = [
    // {
    //   title: 'Appearance',
    //   items: [
    //     {
    //       label: 'Dark Mode',
    //       type: 'switch',
    //       value: themeMode === 'dark',
    //       onToggle: toggleTheme,
    //     },
    //   ],
    // },
    {
      title: 'Wallet',
      items: [
        {
          label: 'Disconnect Wallet',
          type: 'button',
          onPress: handleDisconnectWallet,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          label: 'Face ID Authentication',
          type: 'switch',
          value: false,
          onToggle: () => {},
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          label: 'Version',
          type: 'text',
          value: '1.0.0',
        },
        {
          label: 'Privacy Policy',
          type: 'button',
          onPress: () => {},
        },
        {
          label: 'Terms of Service',
          type: 'button',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.text.SOFT_WHITE }]}>
              {item.label}
            </Text>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{
                false: theme.background.PURPLE_LIGHTER,
                true: theme.colors.ELECTRIC_BLUE,
              }}
              thumbColor={item.value ? '#fff' : '#f4f3f4'}
            />
          </View>
        );
      case 'button':
        return (
          <GradientButton
            title={item.label}
            onPress={item.onPress}
            variant={ButtonVariant.SECONDARY}
            style={styles.settingButton}
          />
        );
      case 'text':
        return (
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.text.SOFT_WHITE }]}>
              {item.label}
            </Text>
            <Text style={[styles.settingValue, { color: theme.text.LIGHT_GREY }]}>
              {item.value}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <GradientBackground gradient={GradientType.PRIMARY} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.text.LIGHT_GREY }]}>
          Customize your Neo experience
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <GradientCard key={sectionIndex} style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.text.SOFT_WHITE }]}>
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.settingContainer}>
                {renderSettingItem(item)}
              </View>
            ))}
          </GradientCard>
        ))}
      </ScrollView>
    </GradientBackground>
  );
};

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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingContainer: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
  },
  settingButton: {
    marginVertical: 4,
  },
});

export default SettingsScreen;
