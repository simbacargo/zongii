import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColors } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';

function Icon({ name, color }: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome name={name} size={22} color={color} />;
}

export default function TabLayout() {
  const C = useColors();
  const { user } = useAuth();

  const isAdmin      = !!(user?.is_admin || user?.is_superuser);
  const isManager    = isAdmin || user?.role === 'manager';
  const isPicker     = !!(user?.is_picker) || isAdmin;
  const isSales      = !!(user?.is_sales) || isManager;
  const isAccountant = !!(user?.is_accountant) || isManager;

  // Core tabs — visible to those who need them, hidden for managers who use the More hub
  const showSales     = isSales || isAccountant || user?.role === 'staff';
  const showProducts  = isSales || isAdmin;
  const showCustomers = isSales || isAccountant || user?.role === 'staff';

  // Orders tab: only pure pickers (managers reach it via More)
  const showOrdersTab = isPicker && !isManager;

  // Invoices tab: only pure accountants (managers reach it via More)
  const showInvoicesTab = isAccountant && !isManager;

  // Notifications: bottom tab for everyone except managers (managers reach it via More)
  const showNotificationsTab = !isManager;

  // More hub: replaces Orders + Invoices + Notifications for managers
  const showMore = isManager;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textFaint,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: C.card },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: C.text, fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          tabBarIcon: ({ color }) => <Icon name="file-text-o" color={color} />,
          headerShown: false,
          href: showSales ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: isPicker && !isManager ? 'My Picks' : 'Orders',
          tabBarIcon: ({ color }) => <Icon name={isPicker && !isManager ? 'list-ul' : 'archive'} color={color} />,
          headerShown: false,
          href: showOrdersTab ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Icon name="cube" color={color} />,
          headerShown: false,
          href: showProducts ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => <Icon name="users" color={color} />,
          headerShown: false,
          href: showCustomers ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color }) => <Icon name="file-text" color={color} />,
          headerShown: false,
          href: showInvoicesTab ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Icon name="ellipsis-h" color={color} />,
          headerShown: false,
          href: showMore ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Icon name="bell" color={color} />,
          headerShown: false,
          href: showNotificationsTab ? undefined : null,
        }}
      />
    </Tabs>
  );
}
