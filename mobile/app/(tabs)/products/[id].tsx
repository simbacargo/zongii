import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productAPI, categoryAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';

const fmt = (n: any) => `TZS ${Number(n).toLocaleString()}`;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);

  async function fetchProduct() {
    try {
      const [pRes, cRes] = await Promise.all([productAPI.get(id), categoryAPI.list()]);
      const p = pRes.data;
      setProduct(p);
      setCategories(cRes.data.results ?? cRes.data);
      setName(p.name);
      setPartNumber(p.part_number ?? '');
      setBrand(p.brand ?? '');
      setBuyingPrice(String(p.buying_price));
      setRetailPrice(String(p.retail_price));
      setReorderPoint(String(p.reorder_point ?? 5));
      setSelectedCategories((p.categories ?? []).map((c: any) => c.id ?? c));
      setIsActive(p.is_active);
    } catch {
      Alert.alert('Error', 'Failed to load product.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProduct(); }, [id]);

  function toggleCategory(cid: number) {
    setSelectedCategories(prev => prev.includes(cid) ? prev.filter(c => c !== cid) : [...prev, cid]);
  }

  async function save() {
    if (!name.trim()) return Alert.alert('Error', 'Product name is required.');
    setSaving(true);
    try {
      await productAPI.update(id, {
        name: name.trim(),
        part_number: partNumber.trim() || null,
        brand: brand.trim() || null,
        buying_price: Number(buyingPrice),
        retail_price: Number(retailPrice),
        reorder_point: Number(reorderPoint),
        category_ids: selectedCategories,
        is_active: isActive,
      });
      await fetchProduct();
      setEditing(false);
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to update product.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    Alert.alert('Deactivate Product', 'Remove this product from active listings?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate', style: 'destructive', onPress: async () => {
          try { await productAPI.deactivate(id); await fetchProduct(); }
          catch { Alert.alert('Error', 'Failed to deactivate product.'); }
        },
      },
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  if (!product) return null;

  const margin = Number(product.retail_price) - Number(product.buying_price);
  const marginPct = Number(product.buying_price) > 0 ? ((margin / Number(product.buying_price)) * 100).toFixed(1) : '0';

  if (editing) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Part Number</Text>
          <TextInput style={styles.input} value={partNumber} onChangeText={setPartNumber} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Brand</Text>
          <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholderTextColor={C.textFaint} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Buying Price</Text>
              <TextInput style={styles.input} value={buyingPrice} onChangeText={setBuyingPrice} keyboardType="numeric" placeholderTextColor={C.textFaint} />
            </View>
            <View style={{ width: 12 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Retail Price</Text>
              <TextInput style={styles.input} value={retailPrice} onChangeText={setRetailPrice} keyboardType="numeric" placeholderTextColor={C.textFaint} />
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock</Text>
          <Text style={styles.label}>Reorder Point</Text>
          <TextInput style={styles.input} value={reorderPoint} onChangeText={setReorderPoint} keyboardType="numeric" placeholderTextColor={C.textFaint} />
        </View>
        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.tagWrap}>
              {categories.map(c => (
                <TouchableOpacity key={c.id} style={[styles.tag, selectedCategories.includes(c.id) && styles.tagActive]} onPress={() => toggleCategory(c.id)}>
                  <Text style={[styles.tagText, selectedCategories.includes(c.id) && styles.tagTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Active</Text>
            <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: C.primary }} />
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn, { flex: 1 }]} onPress={() => setEditing(false)}>
            <Text style={[styles.btnText, { color: C.textMuted }]}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity style={[styles.btn, { flex: 2 }, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
        </View>
        {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
        {product.part_number ? <Text style={styles.partNumber}>{product.part_number}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.statGrid}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Buying Price</Text><Text style={styles.statValue}>{fmt(product.buying_price)}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Retail Price</Text><Text style={[styles.statValue, { color: C.primary }]}>{fmt(product.retail_price)}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Margin</Text><Text style={styles.statValue}>{fmt(margin)} ({marginPct}%)</Text></View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stock</Text>
        <View style={styles.statGrid}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Available</Text><Text style={[styles.statValue, product.available_stock <= (product.reorder_point ?? 5) && { color: C.red }]}>{product.available_stock}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Reorder At</Text><Text style={styles.statValue}>{product.reorder_point ?? 5}</Text></View>
        </View>
        {product.available_stock <= (product.reorder_point ?? 5) && (
          <View style={styles.lowStockBanner}><Text style={styles.lowStockText}>⚠ Low stock — reorder needed</Text></View>
        )}
      </View>

      {product.categories?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.tagWrap}>
            {product.categories.map((c: any) => (
              <View key={c.id ?? c} style={styles.tagActive}>
                <Text style={styles.tagTextActive}>{c.name ?? c}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {isManagerOrAdmin && (
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>Edit Product</Text>
          </TouchableOpacity>
          {product.is_active && (
            <TouchableOpacity style={styles.deactivateBtn} onPress={deactivate}>
              <Text style={styles.deactivateBtnText}>Deactivate</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.bg },
  content:         { padding: 16, paddingBottom: 40 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard:      { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  productName:     { fontSize: 18, fontWeight: '800', color: C.text, flex: 1, marginRight: 8 },
  brand:           { fontSize: 13, color: C.textMuted, marginBottom: 2 },
  partNumber:      { fontSize: 12, color: C.textFaint, fontFamily: 'monospace' },
  section:         { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:    { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  statGrid:        { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statBox:         { flex: 1, minWidth: 90, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: 'center' },
  statLabel:       { fontSize: 10, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' },
  statValue:       { fontSize: 13, fontWeight: '800', color: C.text, textAlign: 'center' },
  lowStockBanner:  { marginTop: 10, backgroundColor: C.redLight, borderRadius: 8, padding: 10 },
  lowStockText:    { color: C.red, fontWeight: '700', fontSize: 12 },
  tagWrap:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:             { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  tagActive:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.primaryLight },
  tagText:         { fontSize: 12, fontWeight: '600', color: C.textMuted },
  tagTextActive:   { color: C.primary, fontWeight: '700', fontSize: 12 },
  actionsSection:  { gap: 10 },
  editBtn:         { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editBtnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
  deactivateBtn:   { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.amber },
  deactivateBtnText:{ color: C.amber, fontWeight: '700', fontSize: 14 },
  label:           { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:           { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  row:             { flexDirection: 'row' },
  flex1:           { flex: 1 },
  switchRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel:     { fontSize: 14, fontWeight: '600', color: C.text },
  btn:             { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtn:       { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  btnText:         { color: '#fff', fontWeight: '800', fontSize: 16 },
});
