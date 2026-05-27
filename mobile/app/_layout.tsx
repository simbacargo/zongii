import { useEffect, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const ready = fontsLoaded && !isLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === 'login';
    if (!token && !inAuth) router.replace('/login');
    else if (token && inAuth) router.replace('/(tabs)');
  }, [ready, token]);

  // Navigate to the relevant screen when the user taps a push notification
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as {
        type?: string;
        entity_id?: number;
      };
      if (!data?.type) return;

      const { type, entity_id } = data;
      if (type === 'low_stock' && entity_id) {
        router.push(`/products/${entity_id}` as any);
      } else if (
        ['order_created', 'order_picked', 'order_verified',
         'order_dispatched', 'order_rejected', 're_pick'].includes(type) && entity_id
      ) {
        router.push(`/orders/${entity_id}` as any);
      } else {
        router.push('/notifications' as any);
      }
    });

    return () => { responseListener.current?.remove(); };
  }, []);

  if (!ready) return null;
  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
