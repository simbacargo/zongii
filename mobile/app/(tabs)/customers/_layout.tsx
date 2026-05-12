import { Stack } from 'expo-router';
import { useColors } from '@/lib/theme';

export default function CustomersLayout() {
  const C = useColors();
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: C.card }, headerShadowVisible: false, headerTitleStyle: { fontWeight: '800', color: C.text }, headerTintColor: C.primary }}>
      <Stack.Screen name="index" options={{ title: 'Customers' }} />
      <Stack.Screen name="new"   options={{ title: 'Add Customer', presentation: 'modal' }} />
      <Stack.Screen name="[id]"  options={{ title: 'Customer Detail' }} />
    </Stack>
  );
}
