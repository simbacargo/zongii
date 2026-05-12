import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { saleAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';

const fmt = (n: any) => `TZS ${Number(n).toLocaleString()}`;

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const { user } = useAuth();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    (async () => {
      try {
        const res = await saleAPI.get(id);
        setSale(res.data);
      } catch {
        Alert.alert('Error', 'Failed to load sale.', [{ text: 'OK', onPress: () => router.back() }]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleAction(action: 'approve' | 'reject') {
    setActing(true);
    try {
      if (action === 'approve') await saleAPI.approve(id);
      else await saleAPI.reject(id);
      const res = await saleAPI.get(id);
      setSale(res.data);
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : `Failed to ${action} sale.`;
      Alert.alert('Error', msg);
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    Alert.alert('Delete Sale', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setActing(true);
          try {
            await saleAPI.delete(id);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete sale.');
            setActing(false);
          }
        },
      },
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  if (!sale) return null;

  const status = sale.rejected ? 'rejected' : sale.aproved ? 'approved' : 'pending';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.saleId}>Sale #{sale.id}</Text>
          <StatusBadge status={status} />
        </View>
        <Text style={styles.dateText}>
          {new Date(sale.date_sold).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product</Text>
        <Text style={styles.productName}>{sale.product_name}</Text>
        <View style={styles.rowWrap}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Qty Sold</Text>
            <Text style={styles.statValue}>{sale.quantity_sold}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Price / Unit</Text>
            <Text style={styles.statValue}>{fmt(sale.price_per_unit)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statValue, { color: C.primary }]}>{fmt(sale.total_amount)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer</Text>
        {sale.customer_name
          ? <Text style={styles.customerName}>{sale.customer_name}</Text>
          : <Text style={styles.walkin}>Walk-in Customer</Text>
        }
      </View>

      {isManagerOrAdmin && status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn, acting && { opacity: 0.6 }]} onPress={() => handleAction('approve')} disabled={acting}>
            {acting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionText}>Approve</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn, acting && { opacity: 0.6 }]} onPress={() => handleAction('reject')} disabled={acting}>
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {isManagerOrAdmin && (
        <TouchableOpacity style={[styles.deleteBtn, acting && { opacity: 0.6 }]} onPress={handleDelete} disabled={acting}>
          <Text style={styles.deleteText}>Delete Sale</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  content:     { padding: 16, paddingBottom: 40 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard:  { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  saleId:      { fontSize: 18, fontWeight: '800', color: C.text },
  dateText:    { fontSize: 13, color: C.textMuted },
  section:     { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  productName: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  rowWrap:     { flexDirection: 'row', gap: 8 },
  statBox:     { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: 'center' },
  statLabel:   { fontSize: 10, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  statValue:   { fontSize: 13, fontWeight: '800', color: C.text },
  customerName:{ fontSize: 15, fontWeight: '700', color: C.text },
  walkin:      { fontSize: 14, color: C.textMuted, fontStyle: 'italic' },
  actionRow:   { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn:   { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  approveBtn:  { backgroundColor: '#10b981' },
  rejectBtn:   { backgroundColor: '#ef4444' },
  actionText:  { color: '#fff', fontWeight: '800', fontSize: 15 },
  deleteBtn:   { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.red },
  deleteText:  { color: C.red, fontWeight: '700', fontSize: 14 },
});
