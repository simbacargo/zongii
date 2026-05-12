import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { productAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import StatusBadge from '@/components/StatusBadge';

const fmt = (n: any) => `TZS ${Number(n).toLocaleString()}`;

export default function ProductsListScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q?: string) => {
    try {
      const res = await productAPI.list(q);
      setProducts(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  function onSearch(text: string) {
    setSearch(text);
    load(text);
  }

  if (loading && products.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search by name or part number..." placeholderTextColor={C.textFaint} value={search} onChangeText={onSearch} returnKeyType="search" />
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/products/new')}>
        <Text style={styles.fabText}>+ Add Product</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/products/${item.id}`)}>
            <View style={styles.cardTop}>
              <View style={styles.flex1}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                {item.part_number ? <Text style={styles.partNumber}>{item.part_number}</Text> : null}
              </View>
              <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Buy</Text>
                <Text style={styles.priceValue}>{fmt(item.buying_price)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Sell</Text>
                <Text style={[styles.priceValue, { color: C.primary }]}>{fmt(item.retail_price)}</Text>
              </View>
              <View style={[styles.stockBadge, item.available_stock <= (item.reorder_point ?? 5) && styles.stockLow]}>
                <Text style={[styles.stockText, item.available_stock <= (item.reorder_point ?? 5) && styles.stockTextLow]}>
                  {item.available_stock} in stock
                </Text>
              </View>
            </View>
            {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar:    { backgroundColor: C.card, padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  searchInput:  { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: C.text },
  fab:          { position: 'absolute', bottom: 20, right: 16, zIndex: 10, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 50, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText:      { color: '#fff', fontWeight: '800', fontSize: 14 },
  list:         { padding: 12, paddingBottom: 100, gap: 10 },
  card:         { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  flex1:        { flex: 1, marginRight: 8 },
  productName:  { fontSize: 14, fontWeight: '700', color: C.text },
  partNumber:   { fontSize: 11, color: C.textMuted, marginTop: 2 },
  cardBottom:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceRow:     { alignItems: 'center' },
  priceLabel:   { fontSize: 10, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  priceValue:   { fontSize: 12, fontWeight: '800', color: C.text },
  stockBadge:   { marginLeft: 'auto', backgroundColor: C.greenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stockLow:     { backgroundColor: C.redLight },
  stockText:    { fontSize: 11, fontWeight: '700', color: C.green },
  stockTextLow: { color: C.red },
  brand:        { fontSize: 11, color: C.textFaint, marginTop: 6 },
  empty:        { alignItems: 'center', paddingTop: 80 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 15, fontWeight: '600', color: C.textMuted },
});
