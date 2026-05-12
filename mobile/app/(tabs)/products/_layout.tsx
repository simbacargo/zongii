import { Stack } from 'expo-router';
import { useColors } from '@/lib/theme';

export default function ProductsLayout() {
  const C = useColors();
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: C.card }, headerShadowVisible: false, headerTitleStyle: { fontWeight: '800', color: C.text }, headerTintColor: C.primary }}>
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="new"   options={{ title: 'Add Product', presentation: 'modal' }} />
      <Stack.Screen name="[id]"  options={{ title: 'Product Detail' }} />
    </Stack>
  );
}
