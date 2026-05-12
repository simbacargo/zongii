import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { dashboardAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import KPICard from '@/components/KPICard';

const fmt = (n: number) =>
  n >= 1_000_000 ? `TZS ${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `TZS ${(n / 1_000).toFixed(0)}K`
  : `TZS ${n}`;

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const C = useColors();
  const styles = makeStyles(C);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p = period) => {
    try {
      const res = await dashboardAPI.get(p);
      setData(res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [period]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [period]));

  function switchPeriod(p: 'week' | 'month') {
    setPeriod(p);
    setLoading(true);
    load(p);
  }

  if (loading && !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  const d = data ?? {};

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstname || user?.username} 👋</Text>
          <Text style={styles.greetingSub}>Here's what's happening today</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={logout}>
          <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggle}>
        {(['week', 'month'] as const).map(p => (
          <TouchableOpacity key={p} style={[styles.toggleBtn, period === p && styles.toggleActive]} onPress={() => switchPeriod(p)}>
            <Text style={[styles.toggleText, period === p && styles.toggleTextActive]}>
              {p === 'week' ? 'Last 7 Days' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <KPICard label="Revenue" value={fmt(Number(d.revenue ?? 0))} sub={`${d.total_sales_count ?? 0} sales`} icon="💰" accent={C.primary} accentBg={C.primaryLight} />
        <View style={{ width: 10 }} />
        <KPICard label="Net Profit" value={fmt(Number(d.profit ?? 0))} icon="📈" accent={C.green} accentBg={C.greenLight} />
      </View>
      <View style={[styles.row, { marginTop: 10 }]}>
        <KPICard label="Pending" value={String(d.pending_count ?? 0)} sub="Awaiting approval" icon="⏳" accent={d.pending_count > 0 ? C.amber : C.text} accentBg={d.pending_count > 0 ? C.amberLight : C.border} />
        <View style={{ width: 10 }} />
        <KPICard label="Low Stock" value={String(d.low_stock_count ?? 0)} sub="Products to reorder" icon="⚠️" accent={d.low_stock_count > 0 ? C.red : C.text} accentBg={d.low_stock_count > 0 ? C.redLight : C.border} />
      </View>

      {Number(d.total_debt) > 0 && (
        <View style={styles.debtBanner}>
          <Text style={styles.debtLabel}>💳  Outstanding Debt</Text>
          <Text style={styles.debtAmount}>{fmt(Number(d.total_debt))}</Text>
        </View>
      )}

      {d.top_products?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          {d.top_products.map((p: any, i: number) => (
            <View key={p.id} style={[styles.topRow, i === d.top_products.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.rankBadge}><Text style={styles.rankText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.topName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.topSub}>{p.total_sold} units sold</Text>
              </View>
              <Text style={styles.topRevenue}>{fmt(Number(p.total_revenue ?? 0))}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quick Actions</Text>
      <View style={styles.actions}>
        {[
          { label: 'New Sale',     icon: '🛒', route: '/sales/new'     },
          { label: 'Add Product',  icon: '📦', route: '/products/new'  },
          { label: 'Add Customer', icon: '👤', route: '/customers/new' },
          { label: 'Low Stock',    icon: '📉', route: '/products'      },
        ].map(a => (
          <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => router.push(a.route as any)}>
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.bg },
  content:         { padding: 16, paddingBottom: 32 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting:        { fontSize: 22, fontWeight: '900', color: C.text },
  greetingSub:     { fontSize: 13, color: C.textMuted, marginTop: 2 },
  avatarBtn:       { width: 40, height: 40, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { color: '#fff', fontWeight: '900', fontSize: 16 },
  toggle:          { flexDirection: 'row', backgroundColor: C.border, borderRadius: 12, padding: 3, marginBottom: 16 },
  toggleBtn:       { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  toggleActive:    { backgroundColor: C.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText:      { fontSize: 13, fontWeight: '600', color: C.textMuted },
  toggleTextActive:{ color: C.primary, fontWeight: '800' },
  row:             { flexDirection: 'row' },
  debtBanner:      { backgroundColor: C.orangeLight, borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: C.orange, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  debtLabel:       { fontSize: 13, fontWeight: '600', color: C.orange },
  debtAmount:      { fontSize: 15, fontWeight: '900', color: C.orange },
  section:         { backgroundColor: C.card, borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle:    { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 10 },
  topRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  rankBadge:       { width: 28, height: 28, borderRadius: 8, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rankText:        { fontSize: 12, fontWeight: '900', color: C.primary },
  topName:         { fontSize: 13, fontWeight: '700', color: C.text },
  topSub:          { fontSize: 11, color: C.textMuted },
  topRevenue:      { fontSize: 12, fontWeight: '800', color: C.text },
  actions:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard:      { backgroundColor: C.card, borderRadius: 14, padding: 16, alignItems: 'center', width: '47%', borderWidth: 1, borderColor: C.border },
  actionIcon:      { fontSize: 28, marginBottom: 8 },
  actionLabel:     { fontSize: 13, fontWeight: '700', color: C.text },
});
