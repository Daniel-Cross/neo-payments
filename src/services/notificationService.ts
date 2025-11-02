import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface TransactionNotification {
  signature: string;
  type: 'received' | 'sent';
  amount: number;
  from: string;
  to: string;
  memo?: string;
  timestamp: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Register for push notifications and get the Expo push token
   */
  public async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'ce6d91f4-c1ae-4e40-ad45-b187b5ec5d6f',
      });

      this.expoPushToken = tokenData.data;
      console.log('📱 Push notification token:', this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Get the current Expo push token
   */
  public getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Send a local notification for a transaction
   */
  public async showTransactionNotification(notification: TransactionNotification): Promise<void> {
    try {
      const title =
        notification.type === 'received'
          ? `Received ${notification.amount} SOL`
          : `Sent ${notification.amount} SOL`;

      const body = notification.memo
        ? notification.memo
        : notification.type === 'received'
        ? `From: ${notification.from.slice(0, 4)}...${notification.from.slice(-4)}`
        : `To: ${notification.to.slice(0, 4)}...${notification.to.slice(-4)}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'transaction',
            signature: notification.signature,
            transactionType: notification.type,
            amount: notification.amount,
            from: notification.from,
            to: notification.to,
            memo: notification.memo,
            timestamp: notification.timestamp,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to show transaction notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Set notification badge count
   */
  public async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
