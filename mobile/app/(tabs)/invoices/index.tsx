import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { documentAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

const STATUS_COLOR: Record<string, string> = {
  draft:     '#94a3b8',
  sent:      '#4f46e5',
  paid:      '#16a34a',
  accepted:  '#10b981',
  rejected:  '#dc2626',
  cancelled: '#dc2626',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', paid: 'Paid',
  accepted: 'Accepted', rejected: 'Rejected', cancelled: 'Cancelled',
};

type DocFilter = 'all' | 'invoice' | 'quotation';
type StatusFilter = 'all' | 'draft' | 'sent' | 'paid' | 'accepted' | 'rejected';

const DOC_FILTERS: { key: DocFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'invoice', label: 'Invoices' },
  { key: 'quotation', label: 'Quotes' },
];

const fmt = (n: any) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function InvoicesListScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [docs, setDocs]     = useState<any[]>([]);
  const [docFilter, setDocFilter]       = useState<DocFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (df = docFilter, sf = statusFilter) => {
    try {
      const res = await documentAPI.list({
        ...(df !== 'all'   ? { doc_type: df as 'invoice'|'quotation' } : {}),
        ...(sf !== 'all'   ? { status: sf } : {}),
      });
      setDocs(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [docFilter, statusFilter]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [docFilter, statusFilter]));

  if (loading && docs.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      {/* Type filter */}
      <View style={styles.filterBar}>
        {DOC_FILTERS.map(({ key, label }) => (
          <TouchableOpacity key={key}
            style={[styles.filterBtn, docFilter === key && styles.filterActive]}
            onPress={() => { setDocFilter(key); setLoading(true); load(key, statusFilter); }}>
            <Text style={[styles.filterText, docFilter === key && styles.filterTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status filter */}
      <View style={[styles.filterBar, { borderTopWidth: 0, backgroundColor: C.bg }]}>
        {(['all', 'draft', 'sent', 'paid', 'accepted', 'rejected'] as StatusFilter[]).map(sf => (
          <TouchableOpacity key={sf}
            style={[styles.statusBtn, statusFilter === sf && { backgroundColor: STATUS_COLOR[sf] ?? C.primary, borderColor: STATUS_COLOR[sf] ?? C.primary }]}
            onPress={() => { setStatusFilter(sf); setLoading(true); load(docFilter, sf); }}>
            <Text style={[styles.statusText, statusFilter === sf && { color: '#fff' }]}>
              {sf === 'all' ? 'All' : STATUS_LABEL[sf]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/invoices/new')}>
        <Text style={styles.fabText}>+ New</Text>
      </TouchableOpacity>

      <FlatList
        data={docs}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const color = STATUS_COLOR[item.status] ?? '#94a3b8';
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/invoices/${item.id}`)}>
              <View style={styles.cardTop}>
                <View style={styles.flex1}>
                  <Text style={styles.docNumber}>{item.number}</Text>
                  <Text style={styles.docType}>{item.doc_type === 'invoice' ? 'Invoice' : 'Quotation'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
                  <Text style={[styles.badgeText, { color }]}>{STATUS_LABEL[item.status] ?? item.status}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.customer}>{item.customer_name}</Text>
                <Text style={styles.total}>{fmt(item.total)}</Text>
              </View>
              <Text style={styles.date}>
                {new Date(item.issue_date ?? item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {item.due_date ? `  ·  Due ${new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filterBar:        { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, gap: 6 },
  filterBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.bg },
  filterActive:     { backgroundColor: C.primary },
  filterText:       { fontSize: 12, fontWeight: '600', color: C.textMuted },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  statusBtn:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  statusText:       { fontSize: 11, fontWeight: '600', color: C.textMuted },
  fab:              { position: 'absolute', bottom: 20, right: 16, zIndex: 10, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 50, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText:          { color: '#fff', fontWeight: '800', fontSize: 14 },
  list:             { padding: 12, paddingBottom: 100, gap: 10 },
  card:             { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  flex1:            { flex: 1, marginRight: 8 },
  docNumber:        { fontSize: 15, fontWeight: '800', color: C.text },
  docType:          { fontSize: 11, color: C.textMuted, marginTop: 2 },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:        { fontSize: 11, fontWeight: '700' },
  cardBottom:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  customer:         { fontSize: 13, fontWeight: '700', color: C.text },
  total:            { fontSize: 14, fontWeight: '900', color: C.primary },
  date:             { fontSize: 11, color: C.textFaint },
  empty:            { alignItems: 'center', paddingTop: 80 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyText:        { fontSize: 15, fontWeight: '600', color: C.textMuted },
});
