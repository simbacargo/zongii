import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Switch, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { productAPI, categoryAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

const MATERIALS = ['PVC', 'CPVC', 'PEX', 'COPPER', 'BRASS', 'STAINLESS', 'ABS'];
const UNITS_OF_MEASURE = ['UNIT', 'FT', 'RL', 'BX'];

const fmt = (n: any) => {
  const v = Number(n);
  if (v >= 1_000_000) return `TZS ${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1_000) return `TZS ${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `TZS ${v.toLocaleString()}`;
};

export default function NewProductScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [upcCode, setUpcCode] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [binLocation, setBinLocation] = useState('');
  const [supplier, setSupplier] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [photo, setPhoto] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [stock, setStock] = useState('0');
  const [reorderPoint, setReorderPoint] = useState('5');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isLeadFree, setIsLeadFree] = useState(false);

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

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to upload a product image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      setPhoto({ uri: asset.uri, name: `product_photo.${ext}`, type: asset.mimeType ?? `image/${ext}` });
    }
  }

  async function submit() {
    if (!name.trim()) return Alert.alert('Error', 'Product name is required.');
    if (!minPrice && !maxPrice) return Alert.alert('Error', 'Enter at least a min or max selling price.');
    setSaving(true);
    try {
      await productAPI.create({
        name: name.trim(),
        part_number: partNumber.trim() || undefined,
        upc_code: upcCode.trim() || undefined,
        brand: brand.trim() || undefined,
        description: description.trim() || undefined,
        material: material || undefined,
        unit_of_measure: unitOfMeasure || undefined,
        buying_price: buyingPrice ? Number(buyingPrice) : null,
        wholesale_price: wholesalePrice ? Number(wholesalePrice) : null,
        min_price: minPrice ? Number(minPrice) : null,
        max_price: maxPrice ? Number(maxPrice) : null,
        weight: weight ? Number(weight) : null,
        bin_location: binLocation.trim() || undefined,
        supplier: supplier.trim() || undefined,
        tax_rate: taxRate ? Number(taxRate) : null,
        quantity_at_hand: Number(stock),
        reorder_point: Number(reorderPoint),
        is_active: isActive,
        is_lead_free: isLeadFree,
        category_ids: selectedCategories.length > 0 ? selectedCategories : undefined,
        ...(photo ? { product_photo: photo } : {}),
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

      <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
        {photo
          ? <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
          : <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoHint}>Tap to add photo</Text>
            </View>
        }
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. PVC Pipe 4 inch" placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>Part Number</Text>
        <TextInput style={styles.input} value={partNumber} onChangeText={setPartNumber} placeholder="e.g. PVC-4IN-WH" placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>UPC Code</Text>
        <TextInput style={styles.input} value={upcCode} onChangeText={setUpcCode} placeholder="Barcode / UPC" placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>Brand</Text>
        <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. Wavin" placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Product description..."
          placeholderTextColor={C.textFaint}
          multiline
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Material</Text>
        <View style={styles.chipWrap}>
          {MATERIALS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, material === m && styles.chipActive]}
              onPress={() => setMaterial(prev => prev === m ? '' : m)}
            >
              <Text style={[styles.chipText, material === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Unit of Measure</Text>
        <View style={styles.chipWrap}>
          {UNITS_OF_MEASURE.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.chip, unitOfMeasure === u && styles.chipActive]}
              onPress={() => setUnitOfMeasure(prev => prev === u ? '' : u)}
            >
              <Text style={[styles.chipText, unitOfMeasure === u && styles.chipTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Min Price (TZS) *</Text>
            <TextInput style={styles.input} value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Max Price (TZS)</Text>
            <TextInput style={styles.input} value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
          </View>
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Buying Price (TZS)</Text>
          <TextInput style={styles.input} value={buyingPrice} onChangeText={setBuyingPrice} keyboardType="numeric" placeholder="optional" placeholderTextColor={C.textFaint} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Wholesale Price (TZS)</Text>
          <TextInput style={styles.input} value={wholesalePrice} onChangeText={setWholesalePrice} keyboardType="numeric" placeholder="optional" placeholderTextColor={C.textFaint} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Tax Rate (%)</Text>
          <TextInput style={styles.input} value={taxRate} onChangeText={setTaxRate} keyboardType="numeric" placeholder="e.g. 18" placeholderTextColor={C.textFaint} />
        </View>
        {buyingPrice && (minPrice || maxPrice) ? (
          <View style={styles.marginCard}>
            <Text style={styles.marginLabel}>Margin (vs max)</Text>
            <Text style={styles.marginValue}>
              {fmt(Number(maxPrice || minPrice) - Number(buyingPrice))}
              {' '}({Number(buyingPrice) > 0 ? (((Number(maxPrice || minPrice) - Number(buyingPrice)) / Number(buyingPrice)) * 100).toFixed(1) : 0}%)
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
        <Text style={[styles.label, { marginTop: 12 }]}>Bin Location</Text>
        <TextInput style={styles.input} value={binLocation} onChangeText={setBinLocation} placeholder="e.g. A-12" placeholderTextColor={C.textFaint} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.label}>Supplier</Text>
        <TextInput style={styles.input} value={supplier} onChangeText={setSupplier} placeholder="Supplier name" placeholderTextColor={C.textFaint} />
        <Text style={[styles.label, { marginTop: 12 }]}>Weight (kg)</Text>
        <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="e.g. 0.5" placeholderTextColor={C.textFaint} />
        <View style={[styles.switchRow, { marginTop: 14 }]}>
          <Text style={styles.switchLabel}>Lead Free</Text>
          <Switch value={isLeadFree} onValueChange={setIsLeadFree} trackColor={{ true: C.primary }} />
        </View>
      </View>

      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.tagWrap}>
            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.tag, selectedCategories.includes(c.id) && styles.tagActive]}
                onPress={() => toggleCategory(c.id)}
              >
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
  root:           { flex: 1, backgroundColor: C.bg },
  content:        { padding: 16, paddingBottom: 40 },
  photoBox:       { marginBottom: 14, borderRadius: 16, overflow: 'hidden', height: 360, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  photoPreview:   { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoIcon:      { fontSize: 40 },
  photoHint:      { fontSize: 13, color: C.textMuted, fontWeight: '600' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section:        { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:   { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  label:          { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:          { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  row:            { flexDirection: 'row' },
  flex1:          { flex: 1 },
  marginCard:     { marginTop: 12, padding: 10, backgroundColor: C.primaryLight, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
  marginLabel:    { fontSize: 12, fontWeight: '700', color: C.primary },
  marginValue:    { fontSize: 13, fontWeight: '800', color: C.primary },
  chipWrap:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:           { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  chipActive:     { backgroundColor: C.primaryLight, borderColor: C.primary },
  chipText:       { fontSize: 12, fontWeight: '600', color: C.textMuted },
  chipTextActive: { color: C.primary, fontWeight: '700' },
  tagWrap:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:            { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  tagActive:      { backgroundColor: C.primaryLight, borderColor: C.primary },
  tagText:        { fontSize: 12, fontWeight: '600', color: C.textMuted },
  tagTextActive:  { color: C.primary, fontWeight: '700' },
  switchRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel:    { fontSize: 14, fontWeight: '600', color: C.text },
  btn:            { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText:        { color: '#fff', fontWeight: '800', fontSize: 16 },
});
