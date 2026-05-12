import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { saleAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import StatusBadge from '@/components/StatusBadge';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';
const FILTERS: Filter[] = ['all', 'pending', 'approved', 'rejected'];
const fmt = (n: any) => `TZS ${Number(n).toLocaleString()}`;

export default function SalesListScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [sales, setSales] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f: Filter = filter) => {
    try {
      const res = await saleAPI.list(f === 'all' ? undefined : f);
      setSales(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filter]));

  function switchFilter(f: Filter) {
    setFilter(f);
    setLoading(true);
    load(f);
  }

  if (loading && sales.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => switchFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/sales/new')}>
        <Text style={styles.fabText}>+ New Sale</Text>
      </TouchableOpacity>

      <FlatList
        data={sales}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>No sales found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/sales/${item.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.productName} numberOfLines={1}>{item.product_name}</Text>
              <Text style={styles.amount}>{fmt(item.total_amount)}</Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.meta}>{item.customer_name ?? 'Walk-in'} · {item.quantity_sold} units</Text>
              <StatusBadge status={item.rejected ? 'rejected' : item.aproved ? 'approved' : 'pending'} />
            </View>
            <Text style={styles.date}>{new Date(item.date_sold).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filters:          { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, gap: 6 },
  filterBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.bg },
  filterActive:     { backgroundColor: C.primary },
  filterText:       { fontSize: 12, fontWeight: '600', color: C.textMuted },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  fab:              { position: 'absolute', bottom: 20, right: 16, zIndex: 10, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 50, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText:          { color: '#fff', fontWeight: '800', fontSize: 14 },
  list:             { padding: 12, paddingBottom: 100, gap: 10 },
  card:             { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  productName:      { fontSize: 14, fontWeight: '700', color: C.text, flex: 1, marginRight: 8 },
  amount:           { fontSize: 15, fontWeight: '900', color: C.primary },
  cardBottom:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta:             { fontSize: 12, color: C.textMuted },
  date:             { fontSize: 11, color: C.textFaint, marginTop: 6 },
  empty:            { alignItems: 'center', paddingTop: 80 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyText:        { fontSize: 15, fontWeight: '600', color: C.textMuted },
});
