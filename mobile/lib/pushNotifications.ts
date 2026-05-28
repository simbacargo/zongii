import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Remote push notifications were removed from Expo Go in SDK 53.
// This flag lets us skip registration gracefully without crashing.
const isExpoGo = Constants.appOwnership === 'expo';

export async function registerForPushNotifications(
  registerWithServer: (token: string) => Promise<unknown>,
): Promise<string | null> {
  if (isExpoGo || !Device.isDevice) {
    // Requires a development build or production build, not Expo Go
    return null;
  }

  // Configure how notifications appear when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Msaidizi',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4f46e5',
      sound: 'default',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await Notifications.getPermissionsAsync() as any;
  let hasPermission: boolean = existing.granted ?? existing.status === 'granted';
  if (!hasPermission) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await Notifications.requestPermissionsAsync() as any;
    hasPermission = result.granted ?? result.status === 'granted';
  }
  if (!hasPermission) {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  try {
    await registerWithServer(token);
  } catch {
    // Non-fatal: push will sync on next login
  }

  return token;
}
