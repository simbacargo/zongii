import { Stack } from 'expo-router';
import { useColors } from '@/lib/theme';

export default function SalesLayout() {
  const C = useColors();
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: C.card }, headerShadowVisible: false, headerTitleStyle: { fontWeight: '800', color: C.text }, headerTintColor: C.primary }}>
      <Stack.Screen name="index" options={{ title: 'Sales' }} />
      <Stack.Screen name="new"   options={{ title: 'New Sale', presentation: 'modal' }} />
      <Stack.Screen name="[id]"  options={{ title: 'Sale Detail' }} />
    </Stack>
  );
}
