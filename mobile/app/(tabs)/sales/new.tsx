import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { productAPI, customerAPI, orderAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

type CartItem = {
  productId: number;
  productName: string;
  brand: string;
  availableStock: number;
  qty: string;
  price: string;
};

const fmt = (n: number) => `TZS ${n.toLocaleString()}`;

export default function NewSaleScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);

  const [products, setProducts]   = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  // Product search
  const [search, setSearch]     = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes]           = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([productAPI.list(), customerAPI.list()]);
      setProducts(p.data.results ?? p.data);
      setCustomers(c.data.results ?? c.data);
      setLoading(false);
    })();
  }, []);

  const filteredProducts = search.length > 0
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.part_number?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  function addToCart(product: any) {
    const existing = cart.findIndex(i => i.productId === product.id);
    if (existing !== -1) {
      // Increment qty instead of adding duplicate
      setCart(prev => prev.map((item, idx) =>
        idx === existing
          ? { ...item, qty: String(Number(item.qty) + 1) }
          : item
      ));
    } else {
      setCart(prev => [...prev, {
        productId:      product.id,
        productName:    product.name,
        brand:          product.brand ?? '',
        availableStock: product.available_stock ?? 0,
        qty:            '1',
        price:          String(product.min_price ?? product.buying_price ?? ''),
      }]);
    }
    setSearch('');
    setShowDropdown(false);
  }

  function removeFromCart(idx: number) {
    setCart(prev => prev.filter((_, i) => i !== idx));
  }

  function updateCartItem(idx: number, field: 'qty' | 'price', value: string) {
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  const cartTotal = cart.reduce((sum, item) => {
    const line = Number(item.qty) * Number(item.price);
    return sum + (isNaN(line) ? 0 : line);
  }, 0);

  const selectedCustomer = customers.find(c => String(c.id) === customerId);

  async function submit() {
    if (cart.length === 0) return Alert.alert('Empty cart', 'Add at least one product.');

    for (const item of cart) {
      if (!item.qty || Number(item.qty) <= 0) return Alert.alert('Error', `Enter a valid quantity for ${item.productName}.`);
      if (!item.price || Number(item.price) <= 0) return Alert.alert('Error', `Enter a valid price for ${item.productName}.`);
      if (Number(item.qty) > item.availableStock) {
        return Alert.alert('Stock error', `Only ${item.availableStock} units of "${item.productName}" in stock.`);
      }
    }

    setSaving(true);
    try {
      await orderAPI.create({
        customer: customerId ? Number(customerId) : null,
        notes:    notes.trim() || '',
        items:    cart.map(item => ({
          product:        item.productId,
          quantity_sold:  Number(item.qty),
          price_per_unit: Number(item.price),
        })),
      });
      Alert.alert('Order placed!', 'The sales order has been created.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const err = e?.response?.data;
      let msg = 'Failed to create order.';
      if (Array.isArray(err)) {
        msg = err.map(e => Object.entries(e).map(([k, v]) => `${k}: ${v}`).join('\n')).join('\n');
      } else if (typeof err === 'object') {
        msg = Object.values(err).flat().join('\n');
      }
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* ── Product search ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Products</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name or part number…"
          placeholderTextColor={C.textFaint}
          value={search}
          onChangeText={t => { setSearch(t); setShowDropdown(t.length > 0); }}
        />
        {showDropdown && filteredProducts.length > 0 && (
          <View style={styles.dropdown}>
            {filteredProducts.slice(0, 8).map(p => (
              <TouchableOpacity key={p.id} style={styles.dropItem} onPress={() => addToCart(p)}>
                <View style={styles.dropRow}>
                  <View style={styles.flex1}>
                    <Text style={styles.dropName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.dropSub}>
                      {p.brand}  ·  {p.available_stock} in stock
                      {p.min_price != null ? `  ·  ${fmt(Number(p.min_price))}` : ''}
                    </Text>
                  </View>
                  <View style={styles.addBadge}>
                    <Text style={styles.addBadgeText}>+ Add</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {filteredProducts.length === 0 && (
              <Text style={styles.dropEmpty}>No products found</Text>
            )}
          </View>
        )}
        {showDropdown && search.length > 0 && filteredProducts.length === 0 && (
          <Text style={styles.dropEmpty}>No products matching "{search}"</Text>
        )}
      </View>

      {/* ── Cart ── */}
      {cart.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cart — {cart.length} item{cart.length !== 1 ? 's' : ''}</Text>
          {cart.map((item, idx) => {
            const lineTotal = Number(item.qty) * Number(item.price);
            const overStock = Number(item.qty) > item.availableStock;
            return (
              <View key={item.productId} style={[styles.cartItem, idx === cart.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.cartItemHeader}>
                  <View style={styles.flex1}>
                    <Text style={styles.cartName} numberOfLines={1}>{item.productName}</Text>
                    {item.brand ? <Text style={styles.cartBrand}>{item.brand}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cartInputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Qty</Text>
                    <TextInput
                      style={[styles.smallInput, overStock && styles.inputError]}
                      value={item.qty}
                      onChangeText={v => updateCartItem(idx, 'qty', v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    {overStock && (
                      <Text style={styles.stockWarn}>max {item.availableStock}</Text>
                    )}
                  </View>
                  <Text style={styles.times}>×</Text>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.inputLabel}>Price (TZS)</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={item.price}
                      onChangeText={v => updateCartItem(idx, 'price', v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>
                  <View style={styles.lineTotalBox}>
                    <Text style={styles.inputLabel}>Total</Text>
                    <Text style={styles.lineTotal}>
                      {!isNaN(lineTotal) ? fmt(lineTotal) : '—'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.cartFooter}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>{fmt(cartTotal)}</Text>
          </View>
        </View>
      )}

      {/* ── Customer ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer (Optional)</Text>
        <TouchableOpacity style={styles.customerSelector} onPress={() => setShowCustomerPicker(!showCustomerPicker)}>
          <Text style={[styles.customerSelectorText, !selectedCustomer && { color: C.textFaint }]}>
            {selectedCustomer
              ? `${selectedCustomer.name}${Number(selectedCustomer.remaining_balance) > 0 ? `  ·  Owes ${fmt(Number(selectedCustomer.remaining_balance))}` : ''}`
              : 'Walk-in customer (no account)'}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 12 }}>{showCustomerPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showCustomerPicker && (
          <View style={styles.customerList}>
            <TouchableOpacity
              style={[styles.customerOption, !customerId && styles.customerActive]}
              onPress={() => { setCustomerId(''); setShowCustomerPicker(false); }}
            >
              <Text style={[styles.customerOptionText, !customerId && styles.customerActiveText]}>
                👤  Walk-in customer
              </Text>
            </TouchableOpacity>
            {customers.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.customerOption, customerId === String(c.id) && styles.customerActive]}
                onPress={() => { setCustomerId(String(c.id)); setShowCustomerPicker(false); }}
              >
                <Text style={[styles.customerOptionText, customerId === String(c.id) && styles.customerActiveText]}>
                  {c.name}
                  {Number(c.remaining_balance) > 0 ? `  ·  Owes ${fmt(Number(c.remaining_balance))}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Notes ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. urgent delivery, special discount…"
          placeholderTextColor={C.textFaint}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, (saving || cart.length === 0) && { opacity: 0.5 }]}
        onPress={submit}
        disabled={saving || cart.length === 0}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>
              Place Order  ·  {cart.length} item{cart.length !== 1 ? 's' : ''}
              {cartTotal > 0 ? `  ·  ${fmt(cartTotal)}` : ''}
            </Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:               { flex: 1, backgroundColor: C.bg },
  content:            { padding: 16, paddingBottom: 48 },
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center' },

  section:            { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:       { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },

  input:              { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },

  dropdown:           { marginTop: 6, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden' },
  dropItem:           { padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  dropRow:            { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex1:              { flex: 1 },
  dropName:           { fontSize: 14, fontWeight: '700', color: C.text },
  dropSub:            { fontSize: 11, color: C.textMuted, marginTop: 2 },
  addBadge:           { backgroundColor: C.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  addBadgeText:       { color: C.primary, fontWeight: '800', fontSize: 12 },
  dropEmpty:          { padding: 12, color: C.textMuted, fontStyle: 'italic', fontSize: 13 },

  cartItem:           { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  cartItemHeader:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  cartName:           { fontSize: 14, fontWeight: '700', color: C.text },
  cartBrand:          { fontSize: 11, color: C.textMuted, marginTop: 2 },
  removeBtn:          { fontSize: 16, color: C.red, fontWeight: '700', paddingTop: 2 },
  cartInputRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  inputGroup:         { flex: 1 },
  inputLabel:         { fontSize: 10, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  smallInput:         { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, fontWeight: '700', color: C.text, textAlign: 'center' },
  inputError:         { borderColor: C.red },
  stockWarn:          { fontSize: 10, color: C.red, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  times:              { fontSize: 16, color: C.textFaint, paddingBottom: 10 },
  lineTotalBox:       { flex: 1.4, alignItems: 'flex-end' },
  lineTotal:          { fontSize: 13, fontWeight: '800', color: C.primary },
  cartFooter:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  totalLabel:         { fontSize: 13, fontWeight: '700', color: C.textMuted },
  totalValue:         { fontSize: 20, fontWeight: '900', color: C.primary },

  customerSelector:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  customerSelectorText:{ fontSize: 14, color: C.text, flex: 1 },
  customerList:       { marginTop: 8, gap: 6 },
  customerOption:     { padding: 12, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  customerActive:     { backgroundColor: C.primaryLight, borderColor: C.primary },
  customerOptionText: { fontSize: 14, color: C.text },
  customerActiveText: { fontWeight: '700', color: C.primary },

  submitBtn:          { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitText:         { color: '#fff', fontWeight: '800', fontSize: 15 },
});
