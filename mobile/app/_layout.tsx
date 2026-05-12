import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });

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
