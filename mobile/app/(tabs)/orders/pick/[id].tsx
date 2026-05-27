import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { pickingAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

const STATUS_LABEL: Record<string, string> = {
  PENDING:          'Waiting to be Accepted',
  ACCEPTED:         'In Progress',
  PARTIALLY_PICKED: 'Partially Picked',
  COMPLETED:        'Completed',
  CANCELLED:        'Cancelled',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:          '#d97706',
  ACCEPTED:         '#4f46e5',
  PARTIALLY_PICKED: '#7c3aed',
  COMPLETED:        '#10b981',
  CANCELLED:        '#94a3b8',
};

export default function PickingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  // picked quantities keyed by item id
  const [pickedQtys, setPickedQtys] = useState<Record<number, string>>({});

  async function fetchOrder() {
    try {
      const res = await pickingAPI.get(id);
      const data = res.data;
      setOrder(data);
      // Pre-fill qty inputs with already-picked amounts
      const initial: Record<number, string> = {};
      for (const item of data.items ?? []) {
        initial[item.id] = String(item.picked_qty ?? 0);
      }
      setPickedQtys(initial);
    } catch {
      Alert.alert('Error', 'Failed to load picking order.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrder(); }, [id]);

  async function handleAccept() {
    Alert.alert('Accept Order', 'Start picking this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept', onPress: async () => {
          setActing(true);
          try {
            await pickingAPI.accept(id);
            await fetchOrder();
          } catch (e: any) {
            const err = e?.response?.data;
            const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to accept order.';
            Alert.alert('Error', msg);
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  }

  async function handleSubmit() {
    const items = (order?.items ?? []).map((item: any) => ({
      id: item.id,
      picked_qty: Number(pickedQtys[item.id] ?? 0),
    }));

    const hasQty = items.some((i: any) => i.picked_qty > 0);
    if (!hasQty) return Alert.alert('Error', 'Enter picked quantities for at least one item.');

    Alert.alert('Submit Picking', 'Submit your picked quantities?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit', onPress: async () => {
          setActing(true);
          try {
            await pickingAPI.submit(id, items);
            await fetchOrder();
            Alert.alert('Done', 'Picking submitted successfully.');
          } catch (e: any) {
            const err = e?.response?.data;
            const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to submit picking.';
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

  const statusColor = STATUS_COLOR[order.status] ?? '#94a3b8';
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;
  const code = order.picking_code ?? `PK${String(order.id).padStart(3, '0')}`;

  const isPending   = order.status === 'PENDING';
  const isPickable  = order.status === 'ACCEPTED' || order.status === 'PARTIALLY_PICKED';
  const isDone      = order.status === 'COMPLETED' || order.status === 'CANCELLED';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.code}>{code}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        {order.sale_order_code && (
          <Text style={styles.orderRef}>Sale Order: {order.sale_order_code}</Text>
        )}
        <Text style={styles.date}>
          Created {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Items ({order.items?.length ?? 0})
          {isPickable ? '  — enter quantities picked' : ''}
        </Text>

        {(order.items ?? []).length === 0 ? (
          <Text style={styles.emptyItems}>No items in this picking order.</Text>
        ) : (
          (order.items ?? []).map((item: any, i: number) => {
            const complete = Number(pickedQtys[item.id] ?? item.picked_qty ?? 0) >= item.requested_qty;
            return (
              <View key={item.id} style={[styles.item, i === order.items.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                  {complete && !isDone && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemSub}>Requested: <Text style={styles.itemSubBold}>{item.requested_qty}</Text></Text>
                  {!isPickable && (
                    <Text style={styles.itemSub}>Picked: <Text style={[styles.itemSubBold, item.picked_qty >= item.requested_qty && { color: C.green }]}>{item.picked_qty}</Text></Text>
                  )}
                </View>
                {isPickable && (
                  <View style={styles.qtyRow}>
                    <Text style={styles.qtyLabel}>Picked:</Text>
                    <TextInput
                      style={[styles.qtyInput, complete && styles.qtyInputDone]}
                      value={pickedQtys[item.id] ?? '0'}
                      onChangeText={v => setPickedQtys(prev => ({ ...prev, [item.id]: v }))}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <Text style={styles.qtyOf}>/ {item.requested_qty}</Text>
                  </View>
                )}
                {item.notes ? <Text style={styles.itemNote}>{item.notes}</Text> : null}
              </View>
            );
          })
        )}
      </View>

      {order.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{order.notes}</Text>
        </View>
      ) : null}

      {isPending && (
        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn, acting && { opacity: 0.6 }]} onPress={handleAccept} disabled={acting}>
          {acting ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Accept & Start Picking</Text>}
        </TouchableOpacity>
      )}

      {isPickable && (
        <TouchableOpacity style={[styles.actionBtn, styles.submitBtn, acting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={acting}>
          {acting ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Submit Picking</Text>}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  content:       { padding: 16, paddingBottom: 48 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard:    { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  headerRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  code:          { fontSize: 20, fontWeight: '800', color: C.text },
  badge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  orderRef:      { fontSize: 12, color: C.textMuted, marginBottom: 4 },
  date:          { fontSize: 12, color: C.textFaint },
  section:       { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:  { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  emptyItems:    { color: C.textMuted, fontStyle: 'italic', fontSize: 13 },
  item:          { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  itemHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  itemName:      { fontSize: 14, fontWeight: '700', color: C.text, flex: 1, marginRight: 8 },
  checkmark:     { fontSize: 16, color: C.green, fontWeight: '800' },
  itemMeta:      { flexDirection: 'row', gap: 16 },
  itemSub:       { fontSize: 12, color: C.textMuted },
  itemSubBold:   { fontWeight: '700', color: C.text },
  itemNote:      { fontSize: 11, color: C.textFaint, marginTop: 4, fontStyle: 'italic' },
  qtyRow:        { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  qtyLabel:      { fontSize: 12, fontWeight: '700', color: C.textMuted, width: 50 },
  qtyInput:      { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, fontWeight: '700', color: C.text, width: 70, textAlign: 'center' },
  qtyInputDone:  { borderColor: C.green, color: C.green },
  qtyOf:         { fontSize: 13, color: C.textMuted },
  notes:         { fontSize: 13, color: C.text, lineHeight: 20 },
  actionBtn:     { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  acceptBtn:     { backgroundColor: '#d97706' },
  submitBtn:     { backgroundColor: '#4f46e5' },
  actionText:    { color: '#fff', fontWeight: '800', fontSize: 15 },
});
