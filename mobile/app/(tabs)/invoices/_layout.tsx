import { Stack } from 'expo-router';
import { useColors } from '@/lib/theme';

export default function InvoicesLayout() {
  const C = useColors();
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: C.card },
      headerShadowVisible: false,
      headerTitleStyle: { fontWeight: '800', color: C.text, fontSize: 18 },
      headerTintColor: C.primary,
    }}>
      <Stack.Screen name="index" options={{ title: 'Invoices & Quotes' }} />
      <Stack.Screen name="[id]"  options={{ title: 'Document' }} />
      <Stack.Screen name="new"   options={{ title: 'New Document' }} />
    </Stack>
  );
}
