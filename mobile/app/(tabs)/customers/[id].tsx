import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { customerAPI, saleAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';

const fmt = (n: any) => `TZS ${Number(n).toLocaleString()}`;

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const { user } = useAuth();
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  async function fetchCustomer() {
    try {
      const [cRes, sRes] = await Promise.all([customerAPI.get(id), saleAPI.list(undefined, id)]);
      const c = cRes.data;
      setCustomer(c);
      setSales(sRes.data.results ?? sRes.data);
      setName(c.name);
      setPhone(c.phone ?? '');
      setEmail(c.email ?? '');
      setAddress(c.address ?? '');
    } catch {
      Alert.alert('Error', 'Failed to load customer.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCustomer(); }, [id]);

  async function handlePay() {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return Alert.alert('Error', 'Enter a valid amount.');
    setPaying(true);
    try {
      await customerAPI.pay(id, amount);
      setShowPayForm(false);
      setPayAmount('');
      await fetchCustomer();
      Alert.alert('Success', 'Payment recorded!');
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to record payment.';
      Alert.alert('Error', msg);
    } finally {
      setPaying(false);
    }
  }

  async function saveEdit() {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    setSaving(true);
    try {
      await customerAPI.update(id, { name: name.trim(), phone: phone.trim() || null, email: email.trim() || null, address: address.trim() || null });
      await fetchCustomer();
      setEditing(false);
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to update customer.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  if (!customer) return null;

  if (editing) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Customer</Text>
          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Address</Text>
          <TextInput style={[styles.input, styles.multiline]} value={address} onChangeText={setAddress} multiline numberOfLines={3} placeholderTextColor={C.textFaint} />
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn, { flex: 1 }]} onPress={() => setEditing(false)}>
            <Text style={[styles.btnText, { color: C.textMuted }]}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity style={[styles.btn, { flex: 2 }, saving && { opacity: 0.6 }]} onPress={saveEdit} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customer.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.customerName}>{customer.name}</Text>
        {customer.phone ? <Text style={styles.infoLine}>{customer.phone}</Text> : null}
        {customer.email ? <Text style={styles.infoLine}>{customer.email}</Text> : null}
        {customer.address ? <Text style={styles.infoLine}>{customer.address}</Text> : null}
        {isManagerOrAdmin && (
          <TouchableOpacity style={styles.editLink} onPress={() => setEditing(true)}>
            <Text style={styles.editLinkText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.section, Number(customer.remaining_balance) > 0 && styles.debtSection]}>
        <Text style={styles.sectionTitle}>Balance</Text>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Outstanding Debt</Text>
            <Text style={[styles.balanceValue, Number(customer.remaining_balance) > 0 && { color: C.red }]}>
              {fmt(customer.remaining_balance ?? 0)}
            </Text>
          </View>
          {Number(customer.remaining_balance) > 0 && isManagerOrAdmin && (
            <TouchableOpacity style={styles.payBtn} onPress={() => setShowPayForm(!showPayForm)}>
              <Text style={styles.payBtnText}>{showPayForm ? 'Cancel' : 'Record Payment'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {showPayForm && (
          <View style={styles.payForm}>
            <TextInput style={styles.input} value={payAmount} onChangeText={setPayAmount} keyboardType="numeric" placeholder="Amount paid (TZS)" placeholderTextColor={C.textFaint} />
            <TouchableOpacity style={[styles.btn, styles.payConfirmBtn, paying && { opacity: 0.6 }]} onPress={handlePay} disabled={paying}>
              {paying ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Confirm Payment</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales History ({sales.length})</Text>
        {sales.length === 0 ? (
          <Text style={styles.emptySales}>No sales recorded for this customer.</Text>
        ) : (
          sales.map(sale => (
            <TouchableOpacity key={sale.id} style={styles.saleItem} onPress={() => router.push(`/sales/${sale.id}`)}>
              <View style={styles.saleItemTop}>
                <Text style={styles.saleProduct} numberOfLines={1}>{sale.product_name}</Text>
                <Text style={styles.saleAmount}>{fmt(sale.total_amount)}</Text>
              </View>
              <View style={styles.saleItemBottom}>
                <Text style={styles.saleMeta}>{sale.quantity_sold} units · {new Date(sale.date_sold).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                <StatusBadge status={sale.rejected ? 'rejected' : sale.aproved ? 'approved' : 'pending'} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  content:       { padding: 16, paddingBottom: 40 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileCard:   { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  avatar:        { width: 64, height: 64, borderRadius: 32, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:    { fontSize: 28, fontWeight: '800', color: C.primary },
  customerName:  { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4 },
  infoLine:      { fontSize: 13, color: C.textMuted, marginBottom: 2 },
  editLink:      { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  editLinkText:  { fontSize: 12, fontWeight: '700', color: C.primary },
  section:       { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  debtSection:   { borderColor: C.red, backgroundColor: C.redLight },
  sectionTitle:  { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  balanceRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel:  { fontSize: 12, color: C.textMuted, fontWeight: '600', marginBottom: 4 },
  balanceValue:  { fontSize: 22, fontWeight: '900', color: C.text },
  payBtn:        { backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  payBtnText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  payForm:       { marginTop: 14, gap: 10 },
  payConfirmBtn: { backgroundColor: '#10b981' },
  input:         { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  emptySales:    { color: C.textMuted, fontStyle: 'italic', fontSize: 13 },
  saleItem:      { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  saleItemTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  saleProduct:   { fontSize: 13, fontWeight: '700', color: C.text, flex: 1, marginRight: 8 },
  saleAmount:    { fontSize: 13, fontWeight: '800', color: C.primary },
  saleItemBottom:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saleMeta:      { fontSize: 11, color: C.textMuted },
  label:         { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  multiline:     { height: 80, textAlignVertical: 'top' },
  row:           { flexDirection: 'row' },
  btn:           { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtn:     { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  btnText:       { color: '#fff', fontWeight: '800', fontSize: 16 },
});
