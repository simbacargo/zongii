import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { documentAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import { usePermissions } from '@/context/AuthContext';

const STATUS_COLOR: Record<string, string> = {
  draft: '#94a3b8', sent: '#4f46e5', paid: '#16a34a',
  accepted: '#10b981', rejected: '#dc2626', cancelled: '#dc2626',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', paid: 'Paid',
  accepted: 'Accepted', rejected: 'Rejected', cancelled: 'Cancelled',
};

const TRANSITIONS: Record<string, { status: string; label: string; color: string }[]> = {
  draft: [
    { status: 'sent',      label: 'Mark as Sent',    color: '#4f46e5' },
    { status: 'cancelled', label: 'Cancel',           color: '#dc2626' },
  ],
  sent: [
    { status: 'paid',      label: 'Mark as Paid',     color: '#16a34a' },
    { status: 'accepted',  label: 'Mark as Accepted', color: '#10b981' },
    { status: 'rejected',  label: 'Reject',           color: '#dc2626' },
    { status: 'cancelled', label: 'Cancel',           color: '#94a3b8' },
  ],
};

const fmt = (n: any) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const C = useColors();
  const styles  = makeStyles(C);
  const { isManager, isAccountant } = usePermissions();

  const [doc, setDoc]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const canAct = isManager || isAccountant;

  async function fetchDoc() {
    try {
      const res = await documentAPI.get(id);
      setDoc(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load document.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDoc(); }, [id]);

  async function doTransition(newStatus: string, label: string) {
    Alert.alert(label, `Change status to "${STATUS_LABEL[newStatus]}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label, onPress: async () => {
          setActing(true);
          try {
            await documentAPI.setStatus(id, newStatus);
            await fetchDoc();
          } catch (e: any) {
            const err = e?.response?.data;
            const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to update status.';
            Alert.alert('Error', msg);
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  }

  async function doDelete() {
    Alert.alert('Delete Document', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setActing(true);
          try {
            await documentAPI.delete(id);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete document.');
            setActing(false);
          }
        },
      },
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  if (!doc) return null;

  const color = STATUS_COLOR[doc.status] ?? '#94a3b8';
  const transitions = TRANSITIONS[doc.status] ?? [];
  const discountPct = Number(doc.discount_percent ?? 0);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.flex1}>
            <Text style={styles.docNumber}>{doc.number}</Text>
            <Text style={styles.docType}>{doc.doc_type === 'invoice' ? '📄 Invoice' : '💬 Quotation'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{STATUS_LABEL[doc.status] ?? doc.status}</Text>
          </View>
        </View>
        <Text style={styles.meta}>
          Issued: {new Date(doc.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        {doc.due_date && (
          <Text style={styles.meta}>
            Due: {new Date(doc.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        )}
        {doc.created_by_username && <Text style={styles.meta}>Created by {doc.created_by_username}</Text>}
      </View>

      {/* Customer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.customerName}>{doc.customer_name}</Text>
      </View>

      {/* Line Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {(doc.items ?? []).map((item: any, i: number) => (
          <View key={item.id ?? i} style={[styles.lineItem, i === (doc.items.length - 1) && { borderBottomWidth: 0 }]}>
            <View style={styles.lineTop}>
              <Text style={styles.lineDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.lineTotal}>{fmt(item.total)}</Text>
            </View>
            <Text style={styles.lineSub}>
              {item.quantity} {item.unit} × {fmt(item.unit_price)}
            </Text>
          </View>
        ))}

        <View style={styles.totalsBox}>
          <Row label="Subtotal" value={fmt(doc.subtotal)} C={C} />
          {discountPct > 0 && (
            <Row label={`Discount (${discountPct}%)`} value={`-${fmt(doc.discount_amount)}`} C={C} />
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmt(doc.total)}</Text>
          </View>
        </View>
      </View>

      {/* Notes / Terms */}
      {(doc.notes || doc.terms) && (
        <View style={styles.section}>
          {doc.notes ? (
            <>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.noteText}>{doc.notes}</Text>
            </>
          ) : null}
          {doc.terms ? (
            <>
              <Text style={[styles.sectionTitle, { marginTop: doc.notes ? 12 : 0 }]}>Terms</Text>
              <Text style={styles.noteText}>{doc.terms}</Text>
            </>
          ) : null}
        </View>
      )}

      {/* Status transitions */}
      {canAct && transitions.length > 0 && (
        <View style={styles.actionsSection}>
          {transitions.map(t => (
            <TouchableOpacity
              key={t.status}
              style={[styles.actionBtn, { backgroundColor: t.color }, acting && { opacity: 0.6 }]}
              onPress={() => doTransition(t.status, t.label)}
              disabled={acting}
            >
              {acting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionText}>{t.label}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Edit + Delete (draft only) */}
      {canAct && doc.status === 'draft' && (
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/invoices/new?edit=${id}`)}>
            <Text style={styles.editBtnText}>Edit Document</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.deleteBtn, acting && { opacity: 0.6 }]} onPress={doDelete} disabled={acting}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value, C }: { label: string; value: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ fontSize: 12, color: C.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: '700', color: C.text }}>{value}</Text>
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  content:       { padding: 16, paddingBottom: 48 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard:    { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  headerRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  flex1:         { flex: 1, marginRight: 8 },
  docNumber:     { fontSize: 20, fontWeight: '800', color: C.text },
  docType:       { fontSize: 12, color: C.textMuted, marginTop: 2 },
  badge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  meta:          { fontSize: 12, color: C.textMuted, marginTop: 3 },
  section:       { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:  { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  customerName:  { fontSize: 15, fontWeight: '700', color: C.text },
  lineItem:      { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  lineTop:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  lineDesc:      { fontSize: 13, fontWeight: '700', color: C.text, flex: 1, marginRight: 8 },
  lineTotal:     { fontSize: 13, fontWeight: '800', color: C.primary },
  lineSub:       { fontSize: 11, color: C.textMuted },
  totalsBox:     { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  totalRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  totalLabel:    { fontSize: 14, fontWeight: '700', color: C.text },
  totalValue:    { fontSize: 18, fontWeight: '900', color: C.primary },
  noteText:      { fontSize: 13, color: C.text, lineHeight: 20 },
  actionsSection:{ gap: 10, marginBottom: 10 },
  actionBtn:     { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionText:    { color: '#fff', fontWeight: '800', fontSize: 14 },
  editBtn:       { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editBtnText:   { color: '#fff', fontWeight: '800', fontSize: 14 },
  deleteBtn:     { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.red },
  deleteBtnText: { color: C.red, fontWeight: '700', fontSize: 14 },
});
