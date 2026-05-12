import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { customerAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

const fmt = (n: any) => `TZS ${Number(n).toLocaleString()}`;

export default function CustomersListScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDebtors, setShowDebtors] = useState(false);

  const load = useCallback(async (debtors = showDebtors, q = search) => {
    try {
      const res = debtors ? await customerAPI.debtors() : await customerAPI.list(q);
      setCustomers(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [showDebtors, search]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [showDebtors]));

  function onSearch(text: string) {
    setSearch(text);
    if (!showDebtors) load(false, text);
  }

  const totalDebt = customers.reduce((sum, c) => sum + Number(c.remaining_balance ?? 0), 0);

  if (loading && customers.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        {!showDebtors && (
          <TextInput style={styles.searchInput} placeholder="Search customers..." placeholderTextColor={C.textFaint} value={search} onChangeText={onSearch} />
        )}
        <TouchableOpacity style={[styles.debtorToggle, showDebtors && styles.debtorToggleActive]} onPress={() => { setShowDebtors(!showDebtors); setSearch(''); }}>
          <Text style={[styles.debtorToggleText, showDebtors && { color: '#fff' }]}>{showDebtors ? 'All' : 'Debtors'}</Text>
        </TouchableOpacity>
      </View>

      {showDebtors && totalDebt > 0 && (
        <View style={styles.debtBanner}>
          <Text style={styles.debtBannerLabel}>Total Outstanding</Text>
          <Text style={styles.debtBannerValue}>{fmt(totalDebt)}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/customers/new')}>
        <Text style={styles.fabText}>+ New Customer</Text>
      </TouchableOpacity>

      <FlatList
        data={customers}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>{showDebtors ? 'No outstanding balances' : 'No customers found'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/customers/${item.id}`)}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.customerName}>{item.name}</Text>
                {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
              </View>
              {Number(item.remaining_balance) > 0 && (
                <View style={styles.debtBadge}>
                  <Text style={styles.debtBadgeText}>{fmt(item.remaining_balance)}</Text>
                </View>
              )}
            </View>
            {item.address ? <Text style={styles.address} numberOfLines={1}>{item.address}</Text> : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:                { flex: 1, backgroundColor: C.bg },
  center:              { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar:              { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  searchInput:         { flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: C.text },
  debtorToggle:        { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  debtorToggleActive:  { backgroundColor: C.red, borderColor: C.red },
  debtorToggleText:    { fontSize: 12, fontWeight: '700', color: C.textMuted },
  debtBanner:          { backgroundColor: C.redLight, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border },
  debtBannerLabel:     { fontSize: 12, fontWeight: '700', color: C.red },
  debtBannerValue:     { fontSize: 16, fontWeight: '900', color: C.red },
  fab:                 { position: 'absolute', bottom: 20, right: 16, zIndex: 10, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 50, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText:             { color: '#fff', fontWeight: '800', fontSize: 14 },
  list:                { padding: 12, paddingBottom: 100, gap: 10 },
  card:                { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  cardTop:             { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:              { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText:          { fontSize: 18, fontWeight: '800', color: C.primary },
  cardInfo:            { flex: 1 },
  customerName:        { fontSize: 14, fontWeight: '700', color: C.text },
  phone:               { fontSize: 12, color: C.textMuted, marginTop: 2 },
  debtBadge:           { backgroundColor: C.redLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  debtBadgeText:       { fontSize: 11, fontWeight: '800', color: C.red },
  address:             { fontSize: 11, color: C.textFaint, marginTop: 8, marginLeft: 54 },
  empty:               { alignItems: 'center', paddingTop: 80 },
  emptyIcon:           { fontSize: 48, marginBottom: 12 },
  emptyText:           { fontSize: 15, fontWeight: '600', color: C.textMuted },
});
