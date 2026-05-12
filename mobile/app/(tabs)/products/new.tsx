import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { productAPI, categoryAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

export default function NewProductScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [reorderPoint, setReorderPoint] = useState('5');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await categoryAPI.list();
        setCategories(res.data.results ?? res.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  function toggleCategory(id: number) {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function submit() {
    if (!name.trim()) return Alert.alert('Error', 'Product name is required.');
    if (!buyingPrice || Number(buyingPrice) <= 0) return Alert.alert('Error', 'Enter a valid buying price.');
    if (!retailPrice || Number(retailPrice) <= 0) return Alert.alert('Error', 'Enter a valid retail price.');
    setSaving(true);
    try {
      await productAPI.create({
        name: name.trim(),
        part_number: partNumber.trim() || undefined,
        brand: brand.trim() || undefined,
        buying_price: Number(buyingPrice),
        retail_price: Number(retailPrice),
        available_stock: Number(stock),
        reorder_point: Number(reorderPoint),
        category_ids: selectedCategories,
        is_active: isActive,
      });
      Alert.alert('Success', 'Product added!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to create product.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. PVC Pipe 4 inch" placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>Part Number</Text>
        <TextInput style={styles.input} value={partNumber} onChangeText={setPartNumber} placeholder="e.g. PVC-4IN-WH" placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>Brand</Text>
        <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. Wavin" placeholderTextColor={C.textFaint} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Buying Price (TZS) *</Text>
            <TextInput style={styles.input} value={buyingPrice} onChangeText={setBuyingPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Retail Price (TZS) *</Text>
            <TextInput style={styles.input} value={retailPrice} onChangeText={setRetailPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
          </View>
        </View>
        {buyingPrice && retailPrice ? (
          <View style={styles.marginCard}>
            <Text style={styles.marginLabel}>Margin</Text>
            <Text style={styles.marginValue}>
              TZS {(Number(retailPrice) - Number(buyingPrice)).toLocaleString()}
              {' '}({Number(buyingPrice) > 0 ? (((Number(retailPrice) - Number(buyingPrice)) / Number(buyingPrice)) * 100).toFixed(1) : 0}%)
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stock</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Initial Stock</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Reorder Point</Text>
            <TextInput style={styles.input} value={reorderPoint} onChangeText={setReorderPoint} keyboardType="numeric" placeholder="5" placeholderTextColor={C.textFaint} />
          </View>
        </View>
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

      <TouchableOpacity style={[styles.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Product</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  content:     { padding: 16, paddingBottom: 40 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section:     { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  label:       { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:       { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  row:         { flexDirection: 'row' },
  flex1:       { flex: 1 },
  marginCard:  { marginTop: 12, padding: 10, backgroundColor: C.primaryLight, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
  marginLabel: { fontSize: 12, fontWeight: '700', color: C.primary },
  marginValue: { fontSize: 13, fontWeight: '800', color: C.primary },
  tagWrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  tagActive:   { backgroundColor: C.primaryLight, borderColor: C.primary },
  tagText:     { fontSize: 12, fontWeight: '600', color: C.textMuted },
  tagTextActive:{ color: C.primary, fontWeight: '700' },
  switchRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: '800', fontSize: 16 },
});
