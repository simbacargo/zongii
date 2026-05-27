import { Stack } from 'expo-router';
import { useColors } from '@/lib/theme';

export default function OrdersLayout() {
  const C = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.card },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: C.text, fontSize: 18 },
        headerTintColor: C.primary,
      }}
    >
      <Stack.Screen name="index"       options={{ title: 'Orders' }} />
      <Stack.Screen name="[id]"        options={{ title: 'Order Detail' }} />
      <Stack.Screen name="pick/[id]"   options={{ title: 'Picking Task' }} />
    </Stack>
  );
}
