import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { orderAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';

const fmt = (n: any) => `TZS ${Number(n ?? 0).toLocaleString()}`;

const STATUS_LABELS: Record<string, string> = {
  PENDING_PICKING:  'Pending Picking',
  PICKING:          'Picking In Progress',
  PARTIALLY_PICKED: 'Partially Picked',
  PICKED:           'Picked — Awaiting Verification',
  VERIFIED:         'Verified',
  RE_PICK_REQUIRED: 'Re-pick Required',
  DISPATCHED:       'Dispatched',
  REJECTED:         'Rejected',
  CANCELLED:        'Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const isManagerOrAdmin = user?.is_admin || user?.role === 'manager' || user?.role === 'admin';

  async function fetchOrder() {
    try {
      const res = await orderAPI.get(id);
      setOrder(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load order.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrder(); }, [id]);

  async function handleAction(action: 'verify' | 'dispatch') {
    const label = action === 'verify' ? 'Verify' : 'Dispatch';
    Alert.alert(`${label} Order`, `Mark this order as ${label.toLowerCase()}ed?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label, onPress: async () => {
          setActing(true);
          try {
            if (action === 'verify') await orderAPI.verify(id);
            else await orderAPI.dispatch(id);
            await fetchOrder();
          } catch (e: any) {
            const err = e?.response?.data;
            const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : `Failed to ${action} order.`;
            Alert.alert('Error', msg);
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  if (!order) return null;

  const statusColor = STATUS_COLOR[order.workflow_status] ?? '#94a3b8';
  const statusLabel = STATUS_LABELS[order.workflow_status] ?? order.workflow_status;
  const orderCode = order.order_code ?? `ZO${String(order.id).padStart(3, '0')}`;

  const canVerify   = isManagerOrAdmin && order.workflow_status === 'PICKED';
  const canDispatch = isManagerOrAdmin && order.workflow_status === 'VERIFIED';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.orderCode}>{orderCode}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>
          Created {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        {order.created_by_name && (
          <Text style={styles.meta}>By {order.created_by_name}</Text>
        )}
      </View>

      {order.customer_name && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.customerName}>{order.customer_name}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items ({order.sales?.length ?? 0})</Text>
        {(order.sales ?? []).length === 0 ? (
          <Text style={styles.emptyItems}>No items in this order.</Text>
        ) : (
          (order.sales ?? []).map((sale: any, i: number) => (
            <View key={sale.id ?? i} style={[styles.item, i === (order.sales.length - 1) && { borderBottomWidth: 0 }]}>
              <View style={styles.itemTop}>
                <Text style={styles.itemName} numberOfLines={2}>{sale.product_name}</Text>
                <Text style={styles.itemTotal}>{fmt(sale.total_amount)}</Text>
              </View>
              <Text style={styles.itemSub}>
                {sale.quantity_sold} × {fmt(sale.price_per_unit)}
              </Text>
            </View>
          ))
        )}
        {order.total_amount != null && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmt(order.total_amount)}</Text>
          </View>
        )}
      </View>

      {order.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{order.notes}</Text>
        </View>
      ) : null}

      {order.verified_by_name && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification</Text>
          <Text style={styles.meta}>Verified by {order.verified_by_name}</Text>
          {order.verified_at && (
            <Text style={styles.meta}>
              {new Date(order.verified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          )}
        </View>
      )}

      {(canVerify || canDispatch) && (
        <View style={styles.actionRow}>
          {canVerify && (
            <TouchableOpacity style={[styles.actionBtn, styles.verifyBtn, acting && { opacity: 0.6 }]} onPress={() => handleAction('verify')} disabled={acting}>
              {acting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionText}>Verify Order</Text>}
            </TouchableOpacity>
          )}
          {canDispatch && (
            <TouchableOpacity style={[styles.actionBtn, styles.dispatchBtn, acting && { opacity: 0.6 }]} onPress={() => handleAction('dispatch')} disabled={acting}>
              {acting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionText}>Dispatch</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  content:      { padding: 16, paddingBottom: 40 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard:   { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderCode:    { fontSize: 20, fontWeight: '800', color: C.text },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  dateText:     { fontSize: 13, color: C.textMuted },
  meta:         { fontSize: 12, color: C.textFaint, marginTop: 2 },
  section:      { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  customerName: { fontSize: 15, fontWeight: '700', color: C.text },
  emptyItems:   { color: C.textMuted, fontStyle: 'italic', fontSize: 13 },
  item:         { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  itemTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  itemName:     { fontSize: 13, fontWeight: '700', color: C.text, flex: 1, marginRight: 8 },
  itemTotal:    { fontSize: 13, fontWeight: '800', color: C.primary },
  itemSub:      { fontSize: 11, color: C.textMuted },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  totalLabel:   { fontSize: 13, fontWeight: '700', color: C.textMuted },
  totalValue:   { fontSize: 17, fontWeight: '900', color: C.primary },
  notes:        { fontSize: 13, color: C.text, lineHeight: 20 },
  actionRow:    { gap: 10 },
  actionBtn:    { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  verifyBtn:    { backgroundColor: '#16a34a' },
  dispatchBtn:  { backgroundColor: '#4f46e5' },
  actionText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
});
