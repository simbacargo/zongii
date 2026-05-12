import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { productAPI, customerAPI, saleAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

export default function NewSaleScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, c] = await Promise.all([productAPI.list(), customerAPI.list()]);
      setProducts(p.data.results ?? p.data);
      setCustomers(c.data.results ?? c.data);
      setLoading(false);
    })();
  }, []);

  const selectedProduct = products.find(p => String(p.id) === productId);
  const filteredProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.part_number?.toLowerCase().includes(productSearch.toLowerCase()))
    : products;

  function selectProduct(p: any) {
    setProductId(String(p.id));
    setPrice(String(p.retail_price ?? p.buying_price ?? ''));
    setProductSearch(p.name);
  }

  async function submit() {
    if (!productId) return Alert.alert('Error', 'Please select a product.');
    if (!qty || Number(qty) <= 0) return Alert.alert('Error', 'Enter a valid quantity.');
    if (!price || Number(price) <= 0) return Alert.alert('Error', 'Enter a valid price.');
    setSaving(true);
    try {
      await saleAPI.create({
        product: Number(productId),
        customer: customerId ? Number(customerId) : undefined,
        quantity_sold: Number(qty),
        price_per_unit: Number(price),
      });
      Alert.alert('Success', 'Sale recorded!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to create sale.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product</Text>
        <TextInput style={styles.input} placeholder="Search product name or part number..." placeholderTextColor={C.textFaint} value={productSearch} onChangeText={t => { setProductSearch(t); setProductId(''); setPrice(''); }} />
        {productSearch.length > 0 && !productId && (
          <View style={styles.dropdown}>
            {filteredProducts.slice(0, 8).map(p => (
              <TouchableOpacity key={p.id} style={styles.dropItem} onPress={() => selectProduct(p)}>
                <Text style={styles.dropName}>{p.name}</Text>
                <Text style={styles.dropSub}>{p.brand} · {p.available_stock} in stock · TZS {Number(p.retail_price).toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
            {filteredProducts.length === 0 && <Text style={styles.dropEmpty}>No products found</Text>}
          </View>
        )}
        {selectedProduct && (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedName}>{selectedProduct.name}</Text>
            <Text style={styles.selectedSub}>{selectedProduct.brand} · Stock: {selectedProduct.available_stock}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quantity & Price</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput style={styles.input} value={qty} onChangeText={setQty} keyboardType="numeric" placeholder="1" placeholderTextColor={C.textFaint} />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Price per Unit (TZS)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
          </View>
        </View>
        {productId && price && qty ? (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>TZS {(Number(qty) * Number(price)).toLocaleString()}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer (Optional)</Text>
        {['', ...customers].map((c: any, i) => (
          <TouchableOpacity
            key={i === 0 ? 'walkin' : c.id}
            style={[styles.customerOption, customerId === (i === 0 ? '' : String(c.id)) && styles.customerActive]}
            onPress={() => setCustomerId(i === 0 ? '' : String(c.id))}
          >
            <Text style={[styles.customerName, customerId === (i === 0 ? '' : String(c.id)) && styles.customerNameActive]}>
              {i === 0 ? '👤  Walk-in Customer' : `${c.name}${c.remaining_balance > 0 ? ` · Owes TZS ${c.remaining_balance}` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Record Sale</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  content:          { padding: 16, paddingBottom: 40 },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section:          { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:     { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  label:            { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:            { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  row:              { flexDirection: 'row' },
  flex1:            { flex: 1 },
  dropdown:         { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, marginTop: 4, overflow: 'hidden' },
  dropItem:         { padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  dropName:         { fontSize: 14, fontWeight: '700', color: C.text },
  dropSub:          { fontSize: 11, color: C.textMuted, marginTop: 2 },
  dropEmpty:        { padding: 12, color: C.textMuted, fontStyle: 'italic' },
  selectedCard:     { marginTop: 10, padding: 10, backgroundColor: C.primaryLight, borderRadius: 10 },
  selectedName:     { fontSize: 14, fontWeight: '700', color: C.primary },
  selectedSub:      { fontSize: 11, color: C.textMuted, marginTop: 2 },
  totalCard:        { marginTop: 12, padding: 12, backgroundColor: C.primaryLight, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:       { fontSize: 12, fontWeight: '700', color: C.primary },
  totalValue:       { fontSize: 20, fontWeight: '900', color: C.primary },
  customerOption:   { padding: 12, borderRadius: 10, marginBottom: 6, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  customerActive:   { backgroundColor: C.primaryLight, borderColor: C.primary },
  customerName:     { fontSize: 14, color: C.text },
  customerNameActive:{ fontWeight: '700', color: C.primary },
  btn:              { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText:          { color: '#fff', fontWeight: '800', fontSize: 16 },
});
