import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { orderAPI, pickingAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import { usePermissions } from '@/context/AuthContext';

// ── Sale Order constants ──────────────────────────────────────────────────────
const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PICKING:  'Pending',
  PICKING:          'Picking',
  PARTIALLY_PICKED: 'Partial',
  PICKED:           'Picked',
  VERIFIED:         'Verified',
  RE_PICK_REQUIRED: 'Re-pick',
  DISPATCHED:       'Dispatched',
  REJECTED:         'Rejected',
  CANCELLED:        'Cancelled',
};
const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING_PICKING:  '#d97706',
  PICKING:          '#4f46e5',
  PARTIALLY_PICKED: '#7c3aed',
  PICKED:           '#0891b2',
  VERIFIED:         '#16a34a',
  RE_PICK_REQUIRED: '#dc2626',
  DISPATCHED:       '#10b981',
  REJECTED:         '#dc2626',
  CANCELLED:        '#94a3b8',
};

// ── Picking Order constants ───────────────────────────────────────────────────
const PICK_STATUS_LABEL: Record<string, string> = {
  PENDING:          'Waiting',
  ACCEPTED:         'In Progress',
  PARTIALLY_PICKED: 'Partial',
  COMPLETED:        'Completed',
  CANCELLED:        'Cancelled',
};
const PICK_STATUS_COLOR: Record<string, string> = {
  PENDING:          '#d97706',
  ACCEPTED:         '#4f46e5',
  PARTIALLY_PICKED: '#7c3aed',
  COMPLETED:        '#10b981',
  CANCELLED:        '#94a3b8',
};

type OrderFilter = 'active' | 'verified' | 'dispatched' | 'all';
const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'active',     label: 'Active'     },
  { key: 'verified',   label: 'Verified'   },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'all',        label: 'All'        },
];
const ACTIVE_STATUSES = ['PENDING_PICKING', 'PICKING', 'PARTIALLY_PICKED', 'PICKED', 'RE_PICK_REQUIRED'];

type PickFilter = 'open' | 'completed' | 'all';
const PICK_FILTERS: { key: PickFilter; label: string }[] = [
  { key: 'open',      label: 'Open'      },
  { key: 'completed', label: 'Completed' },
  { key: 'all',       label: 'All'       },
];

const fmt = (n: any) => `TZS ${Number(n ?? 0).toLocaleString()}`;

// ── Picker view ───────────────────────────────────────────────────────────────
function PickerOrdersList() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<PickFilter>('open');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f: PickFilter = filter) => {
    try {
      const res = await pickingAPI.list();
      let data: any[] = res.data.results ?? res.data;
      if (f === 'open')      data = data.filter(o => ['PENDING', 'ACCEPTED', 'PARTIALLY_PICKED'].includes(o.status));
      if (f === 'completed') data = data.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));
      setOrders(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filter]));

  if (loading && orders.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.filters}>
        {PICK_FILTERS.map(({ key, label }) => (
          <TouchableOpacity key={key} style={[styles.filterBtn, filter === key && styles.filterActive]}
            onPress={() => { setFilter(key); setLoading(true); load(key); }}>
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>{filter === 'open' ? 'No open picking tasks' : 'No orders found'}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const color = PICK_STATUS_COLOR[item.status] ?? '#94a3b8';
          const label = PICK_STATUS_LABEL[item.status] ?? item.status;
          const code  = item.picking_code ?? `PK${String(item.id).padStart(3, '0')}`;
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/pick/${item.id}`)}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.code}>{code}</Text>
                  {item.sale_order_code && <Text style={styles.subCode}>Order {item.sale_order_code}</Text>}
                </View>
                <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
                  <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.meta}>{item.items?.length ?? 0} product{(item.items?.length ?? 0) !== 1 ? 's' : ''}</Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ── Manager view ──────────────────────────────────────────────────────────────
function ManagerOrdersList() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<OrderFilter>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f: OrderFilter = filter) => {
    try {
      const statusParam =
        f === 'verified'   ? 'VERIFIED'   :
        f === 'dispatched' ? 'DISPATCHED' : undefined;
      const res = await orderAPI.list(statusParam);
      let data: any[] = res.data.results ?? res.data;
      if (f === 'active') data = data.filter(o => ACTIVE_STATUSES.includes(o.workflow_status));
      setOrders(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filter]));

  if (loading && orders.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.filters}>
        {ORDER_FILTERS.map(({ key, label }) => (
          <TouchableOpacity key={key} style={[styles.filterBtn, filter === key && styles.filterActive]}
            onPress={() => { setFilter(key); setLoading(true); load(key); }}>
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const color = ORDER_STATUS_COLOR[item.workflow_status] ?? '#94a3b8';
          const label = ORDER_STATUS_LABEL[item.workflow_status] ?? item.workflow_status;
          const code  = item.order_code ?? `ZO${String(item.id).padStart(3, '0')}`;
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/${item.id}`)}>
              <View style={styles.cardTop}>
                <Text style={styles.code}>{code}</Text>
                <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
                  <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
              </View>
              {item.customer_name && <Text style={styles.meta}>{item.customer_name}</Text>}
              <View style={styles.cardBottom}>
                <Text style={styles.meta}>
                  {item.sales?.length ?? 0} item{(item.sales?.length ?? 0) !== 1 ? 's' : ''}
                  {item.total_amount ? `  ·  ${fmt(item.total_amount)}` : ''}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ── Root — picks which view to show ──────────────────────────────────────────
export default function OrdersScreen() {
  const { isPicker, isManager, isAdmin } = usePermissions();
  // Pure pickers (not also manager/admin) get the picking workflow view
  if (isPicker && !isManager && !isAdmin) return <PickerOrdersList />;
  return <ManagerOrdersList />;
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filters:          { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, gap: 6 },
  filterBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.bg },
  filterActive:     { backgroundColor: C.primary },
  filterText:       { fontSize: 12, fontWeight: '600', color: C.textMuted },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  list:             { padding: 12, paddingBottom: 40, gap: 10 },
  card:             { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  code:             { fontSize: 16, fontWeight: '800', color: C.text },
  subCode:          { fontSize: 11, color: C.textMuted, marginTop: 2 },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:        { fontSize: 11, fontWeight: '700' },
  cardBottom:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  meta:             { fontSize: 12, color: C.textMuted },
  date:             { fontSize: 11, color: C.textFaint },
  empty:            { alignItems: 'center', paddingTop: 80 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyText:        { fontSize: 15, fontWeight: '600', color: C.textMuted },
});
