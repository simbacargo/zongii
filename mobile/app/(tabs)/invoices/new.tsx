import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { documentAPI, customerAPI, productAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

type LineItem = {
  description: string;
  unit: string;
  quantity: string;
  unit_price: string;
  productId: string;
  productSearch: string;
  showDropdown: boolean;
};

const UNITS = ['PCS', 'MTR', 'KG', 'BOX', 'SET', 'FT'];
const today = new Date().toISOString().split('T')[0];
const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

function emptyLine(): LineItem {
  return { description: '', unit: 'PCS', quantity: '1', unit_price: '', productId: '', productSearch: '', showDropdown: false };
}

export default function NewInvoiceScreen() {
  const router  = useRouter();
  const C = useColors();
  const styles  = makeStyles(C);
  const { edit } = useLocalSearchParams<{ edit?: string }>();

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts]   = useState<any[]>([]);

  // Form state
  const [docType, setDocType]           = useState<'invoice'|'quotation'>('invoice');
  const [customerId, setCustomerId]     = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [issueDate, setIssueDate]       = useState(today);
  const [dueDate, setDueDate]           = useState('');
  const [discountPct, setDiscountPct]   = useState('0');
  const [notes, setNotes]               = useState('');
  const [terms, setTerms]               = useState('');
  const [items, setItems]               = useState<LineItem[]>([emptyLine()]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cRes, pRes] = await Promise.all([customerAPI.list(), productAPI.list()]);
        setCustomers(cRes.data.results ?? cRes.data);
        setProducts(pRes.data.results ?? pRes.data);

        if (edit) {
          setIsEdit(true);
          const dRes = await documentAPI.get(edit);
          const d = dRes.data;
          setDocType(d.doc_type);
          setCustomerId(String(d.customer));
          const cust = (cRes.data.results ?? cRes.data).find((c: any) => String(c.id) === String(d.customer));
          setCustomerSearch(cust?.name ?? '');
          setIssueDate(d.issue_date ?? today);
          setDueDate(d.due_date ?? '');
          setDiscountPct(String(d.discount_percent ?? 0));
          setNotes(d.notes ?? '');
          setTerms(d.terms ?? '');
          setItems((d.items ?? []).map((i: any) => ({
            description:    i.description,
            unit:           i.unit ?? 'PCS',
            quantity:       String(i.quantity),
            unit_price:     String(i.unit_price),
            productId:      String(i.product ?? ''),
            productSearch:  i.description,
            showDropdown:   false,
          })));
        }
      } catch {}
      setLoading(false);
    })();
  }, [edit]);

  const filteredCustomers = customerSearch.length > 0 && !customerId
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))
    : [];

  function setItemField(idx: number, field: keyof LineItem, value: any) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function selectProduct(idx: number, product: any) {
    setItems(prev => prev.map((it, i) => i === idx ? {
      ...it,
      productId:    String(product.id),
      description:  it.description || product.name,
      productSearch: product.name,
      unit_price:   String(product.min_price ?? product.buying_price ?? ''),
      showDropdown: false,
    } : it));
  }

  function addLine() { setItems(prev => [...prev, emptyLine()]); }
  function removeLine(idx: number) {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, it) => {
    const v = Number(it.quantity) * Number(it.unit_price);
    return s + (isNaN(v) ? 0 : v);
  }, 0);
  const discount = subtotal * (Number(discountPct) / 100);
  const total    = subtotal - discount;

  async function submit() {
    if (!customerId) return Alert.alert('Error', 'Please select a customer.');
    if (!issueDate)  return Alert.alert('Error', 'Issue date is required.');
    if (items.some(it => !it.description.trim())) return Alert.alert('Error', 'All line items need a description.');
    if (items.some(it => !it.unit_price || Number(it.unit_price) <= 0)) return Alert.alert('Error', 'All line items need a valid price.');

    setSaving(true);
    try {
      const payload = {
        doc_type:         docType,
        customer:         Number(customerId),
        issue_date:       issueDate,
        due_date:         dueDate || null,
        discount_percent: Number(discountPct) || 0,
        notes:            notes.trim() || '',
        terms:            terms.trim() || '',
        items:            items.map(it => ({
          description: it.description.trim(),
          unit:        it.unit,
          quantity:    Number(it.quantity),
          unit_price:  Number(it.unit_price),
          ...(it.productId ? { product: Number(it.productId) } : {}),
        })),
      };

      if (isEdit && edit) {
        await documentAPI.update(edit, payload);
        Alert.alert('Updated', 'Document saved.', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await documentAPI.create(payload);
        Alert.alert('Created', `${docType === 'invoice' ? 'Invoice' : 'Quotation'} created.`, [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to save document.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Type</Text>
        <View style={styles.typeRow}>
          {(['invoice', 'quotation'] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.typeBtn, docType === t && styles.typeBtnActive]} onPress={() => setDocType(t)}>
              <Text style={[styles.typeBtnText, docType === t && styles.typeBtnTextActive]}>
                {t === 'invoice' ? '📄 Invoice' : '💬 Quotation'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Customer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer *</Text>
        <TextInput
          style={styles.input}
          placeholder="Search customer name or phone..."
          placeholderTextColor={C.textFaint}
          value={customerSearch}
          onChangeText={t => { setCustomerSearch(t); setCustomerId(''); setShowCustomerDrop(true); }}
        />
        {showCustomerDrop && filteredCustomers.length > 0 && (
          <View style={styles.dropdown}>
            {filteredCustomers.slice(0, 6).map(c => (
              <TouchableOpacity key={c.id} style={styles.dropItem}
                onPress={() => { setCustomerId(String(c.id)); setCustomerSearch(c.name); setShowCustomerDrop(false); }}>
                <Text style={styles.dropName}>{c.name}</Text>
                {c.phone ? <Text style={styles.dropSub}>{c.phone}</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
        {customerId && <Text style={styles.selectedHint}>✓ {customerSearch}</Text>}
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dates</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Issue Date *</Text>
            <TextInput style={styles.input} value={issueDate} onChangeText={setIssueDate} placeholder="YYYY-MM-DD" placeholderTextColor={C.textFaint} />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Due Date</Text>
            <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={C.textFaint} />
          </View>
        </View>
      </View>

      {/* Line Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Items</Text>
        {items.map((item, idx) => {
          const lineTotal = Number(item.quantity) * Number(item.unit_price);
          const filteredProds = item.productSearch.length > 0 && item.showDropdown
            ? products.filter(p =>
                p.name.toLowerCase().includes(item.productSearch.toLowerCase()) ||
                p.part_number?.toLowerCase().includes(item.productSearch.toLowerCase())
              ).slice(0, 5)
            : [];

          return (
            <View key={idx} style={[styles.lineItem, idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineNum}>Item {idx + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeLine(idx)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Product search */}
              <Text style={styles.label}>Product (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Search product to auto-fill..."
                placeholderTextColor={C.textFaint}
                value={item.productSearch}
                onChangeText={t => {
                  setItemField(idx, 'productSearch', t);
                  setItemField(idx, 'productId', '');
                  setItemField(idx, 'showDropdown', true);
                }}
              />
              {filteredProds.length > 0 && (
                <View style={styles.dropdown}>
                  {filteredProds.map(p => (
                    <TouchableOpacity key={p.id} style={styles.dropItem} onPress={() => selectProduct(idx, p)}>
                      <Text style={styles.dropName}>{p.name}</Text>
                      <Text style={styles.dropSub}>{p.brand}  ·  {p.min_price != null ? `TZS ${Number(p.min_price).toLocaleString()}` : ''}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[styles.label, { marginTop: 10 }]}>Description *</Text>
              <TextInput
                style={styles.input}
                value={item.description}
                onChangeText={t => setItemField(idx, 'description', t)}
                placeholder="Item description..."
                placeholderTextColor={C.textFaint}
              />

              <View style={[styles.row, { marginTop: 10, gap: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Qty</Text>
                  <TextInput style={styles.input} value={item.quantity} onChangeText={t => setItemField(idx, 'quantity', t)} keyboardType="numeric" selectTextOnFocus />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unit</Text>
                  <View style={styles.unitPicker}>
                    {UNITS.map(u => (
                      <TouchableOpacity key={u} style={[styles.unitBtn, item.unit === u && styles.unitBtnActive]} onPress={() => setItemField(idx, 'unit', u)}>
                        <Text style={[styles.unitText, item.unit === u && styles.unitTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.label}>Unit Price (TZS)</Text>
                  <TextInput style={styles.input} value={item.unit_price} onChangeText={t => setItemField(idx, 'unit_price', t)} keyboardType="numeric" selectTextOnFocus />
                </View>
              </View>

              {item.quantity && item.unit_price && !isNaN(lineTotal) && (
                <Text style={styles.lineTotal}>Line total: {fmt(lineTotal)}</Text>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.addLineBtn} onPress={addLine}>
          <Text style={styles.addLineBtnText}>+ Add Line Item</Text>
        </TouchableOpacity>
      </View>

      {/* Discount & Totals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discount</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={discountPct}
            onChangeText={setDiscountPct}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={C.textFaint}
          />
          <Text style={styles.pctLabel}>%</Text>
        </View>
        <View style={styles.totalsBox}>
          <TotalRow label="Subtotal"   value={fmt(subtotal)} C={C} />
          {Number(discountPct) > 0 && <TotalRow label={`Discount (${discountPct}%)`} value={`-${fmt(discount)}`} C={C} />}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{fmt(total)}</Text>
          </View>
        </View>
      </View>

      {/* Notes & Terms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes & Terms</Text>
        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} multiline placeholder="Any additional notes..." placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>Terms & Conditions</Text>
        <TextInput style={[styles.input, styles.multiline]} value={terms} onChangeText={setTerms} multiline placeholder="Payment terms, validity, etc." placeholderTextColor={C.textFaint} />
      </View>

      <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.submitText}>
            {isEdit ? 'Save Changes' : `Create ${docType === 'invoice' ? 'Invoice' : 'Quotation'}`}
            {total > 0 ? `  ·  ${fmt(total)}` : ''}
          </Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

function TotalRow({ label, value, C }: { label: string; value: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ fontSize: 12, color: C.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: '700', color: C.text }}>{value}</Text>
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.bg },
  content:         { padding: 16, paddingBottom: 48 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section:         { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:    { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  label:           { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:           { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  multiline:       { height: 72, textAlignVertical: 'top' },
  row:             { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  flex1:           { flex: 1 },
  typeRow:         { flexDirection: 'row', gap: 10 },
  typeBtn:         { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg },
  typeBtnActive:   { backgroundColor: C.primaryLight, borderColor: C.primary },
  typeBtnText:     { fontSize: 14, fontWeight: '600', color: C.textMuted },
  typeBtnTextActive:{ color: C.primary, fontWeight: '800' },
  dropdown:        { marginTop: 4, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, overflow: 'hidden' },
  dropItem:        { padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  dropName:        { fontSize: 13, fontWeight: '700', color: C.text },
  dropSub:         { fontSize: 11, color: C.textMuted, marginTop: 2 },
  selectedHint:    { fontSize: 12, color: C.green, fontWeight: '700', marginTop: 6 },
  lineItem:        { paddingVertical: 12 },
  lineHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineNum:         { fontSize: 12, fontWeight: '800', color: C.textMuted },
  removeText:      { fontSize: 12, color: C.red, fontWeight: '700' },
  lineTotal:       { fontSize: 12, fontWeight: '700', color: C.primary, marginTop: 8, textAlign: 'right' },
  unitPicker:      { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  unitBtn:         { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  unitBtnActive:   { backgroundColor: C.primaryLight, borderColor: C.primary },
  unitText:        { fontSize: 10, fontWeight: '600', color: C.textMuted },
  unitTextActive:  { color: C.primary, fontWeight: '800' },
  addLineBtn:      { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: C.primary, borderStyle: 'dashed' },
  addLineBtnText:  { color: C.primary, fontWeight: '700', fontSize: 13 },
  pctLabel:        { fontSize: 16, color: C.textMuted, fontWeight: '700', paddingBottom: 10, marginLeft: -4 },
  totalsBox:       { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  grandTotal:      { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border, marginTop: 4 },
  grandTotalLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  grandTotalValue: { fontSize: 18, fontWeight: '900', color: C.primary },
  submitBtn:       { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitText:      { color: '#fff', fontWeight: '800', fontSize: 15 },
});
