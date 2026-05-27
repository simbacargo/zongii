import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { notificationAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import { usePermissions } from '@/context/AuthContext';

type HubItem = {
  label: string;
  icon: string;
  route: string;
  description: string;
  badge?: number;
  color: string;
};

export default function MoreScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const { isManager, isPicker, isAccountant } = usePermissions();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(useCallback(() => {
    notificationAPI.list().then(res => {
      const notifs: any[] = res.data.results ?? res.data;
      setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
    }).catch(() => {});
  }, []));

  const items: HubItem[] = [
    ...(isManager || isPicker ? [{
      label: isPicker && !isManager ? 'My Picks' : 'Orders',
      icon: isPicker && !isManager ? '📋' : '📦',
      route: '/orders',
      description: isPicker && !isManager
        ? 'View and complete your picking assignments'
        : 'Manage warehouse orders and dispatch',
      color: C.primary,
    }] : []),
    ...(isManager || isAccountant ? [{
      label: 'Invoices & Quotes',
      icon: '🧾',
      route: '/invoices',
      description: 'Create and manage invoices and quotations',
      color: '#4f46e5',
    }] : []),
    {
      label: 'Notifications',
      icon: '🔔',
      route: '/notifications',
      description: 'View alerts and activity updates',
      badge: unreadCount,
      color: unreadCount > 0 ? C.red : C.textMuted,
    },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        {items.map(item => (
          <TouchableOpacity
            key={item.route}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.75}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{item.icon}</Text>
              {(item.badge ?? 0) > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge! > 9 ? '9+' : item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={[styles.arrow, { backgroundColor: item.color + '18' }]}>
              <Text style={[styles.arrowText, { color: item.color }]}>Open →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  content:     { padding: 16, paddingBottom: 40 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:        { width: '47%', backgroundColor: C.card, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border },
  iconWrap:    { position: 'relative', marginBottom: 14, alignSelf: 'flex-start' },
  icon:        { fontSize: 38 },
  badge:       { position: 'absolute', top: -6, right: -10, backgroundColor: C.red, borderRadius: 8, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:   { color: '#fff', fontSize: 10, fontWeight: '800' },
  label:       { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 4 },
  description: { fontSize: 11, color: C.textMuted, lineHeight: 16, marginBottom: 12 },
  arrow:       { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  arrowText:   { fontSize: 11, fontWeight: '700' },
});
