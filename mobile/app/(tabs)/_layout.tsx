import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColors } from '@/lib/theme';

function Icon({ name, color }: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome name={name} size={22} color={color} />;
}

export default function TabLayout() {
  const C = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textFaint,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: C.card },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: C.text, fontSize: 18 },
      }}
    >
      <Tabs.Screen name="index"     options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }} />
      <Tabs.Screen name="sales"     options={{ title: 'Sales',     tabBarIcon: ({ color }) => <Icon name="file-text-o" color={color} />, headerShown: false }} />
      <Tabs.Screen name="products"  options={{ title: 'Products',  tabBarIcon: ({ color }) => <Icon name="cube" color={color} />, headerShown: false }} />
      <Tabs.Screen name="customers" options={{ title: 'Customers', tabBarIcon: ({ color }) => <Icon name="users" color={color} />, headerShown: false }} />
    </Tabs>
  );
}
