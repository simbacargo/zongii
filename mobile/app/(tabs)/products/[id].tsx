import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Switch, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { productAPI, categoryAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import { usePermissions } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { SERVER_BASE } from '@/lib/constants';

const MATERIALS = ['PVC', 'CPVC', 'PEX', 'COPPER', 'BRASS', 'STAINLESS', 'ABS'];
const UNITS_OF_MEASURE = ['UNIT', 'FT', 'RL', 'BX'];

const fmt = (n: any) => {
  const v = Number(n);
  if (v >= 1_000_000) return `TZS ${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1_000) return `TZS ${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `TZS ${v.toLocaleString()}`;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const { isManager: isManagerOrAdmin } = usePermissions();
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRefillForm, setShowRefillForm] = useState(false);
  const [refillQty, setRefillQty] = useState('');
  const [refillNotes, setRefillNotes] = useState('');
  const [refilling, setRefilling] = useState(false);
  const [refillHistory, setRefillHistory] = useState<any[]>([]);

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
  const [reorderPoint, setReorderPoint] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isLeadFree, setIsLeadFree] = useState(false);

  async function fetchProduct() {
    try {
      const [pRes, cRes, rRes] = await Promise.all([
        productAPI.get(id),
        categoryAPI.list(),
        productAPI.refills(id).catch(() => ({ data: [] })),
      ]);
      const p = pRes.data;
      setProduct(p);
      setCategories(cRes.data.results ?? cRes.data);
      setRefillHistory(rRes.data.results ?? rRes.data);
      setName(p.name);
      setPartNumber(p.part_number ?? '');
      setUpcCode(p.upc_code ?? '');
      setBrand(p.brand ?? '');
      setDescription(p.description ?? '');
      setMaterial(p.material ?? '');
      setUnitOfMeasure(p.unit_of_measure ?? '');
      setBuyingPrice(p.buying_price != null ? String(p.buying_price) : '');
      setWholesalePrice(p.wholesale_price != null ? String(p.wholesale_price) : '');
      setMinPrice(p.min_price != null ? String(p.min_price) : '');
      setMaxPrice(p.max_price != null ? String(p.max_price) : '');
      setWeight(p.weight != null ? String(p.weight) : '');
      setBinLocation(p.bin_location ?? '');
      setSupplier(p.supplier ?? '');
      setTaxRate(p.tax_rate != null ? String(p.tax_rate) : '');
      setReorderPoint(String(p.reorder_point ?? 5));
      setSelectedCategories((p.categories ?? []).map((c: any) => c.id ?? c));
      setIsActive(p.is_active);
      setIsLeadFree(p.is_lead_free ?? false);
    } catch {
      Alert.alert('Error', 'Failed to load product.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  async function submitRefill() {
    const qty = Number(refillQty);
    if (!qty || qty <= 0) return Alert.alert('Error', 'Enter a valid quantity.');
    setRefilling(true);
    try {
      await productAPI.refill(id, { quantity_added: qty, notes: refillNotes.trim() || undefined });
      setShowRefillForm(false);
      setRefillQty('');
      setRefillNotes('');
      await fetchProduct();
      Alert.alert('Done', `Added ${qty} units to stock.`);
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to record refill.';
      Alert.alert('Error', msg);
    } finally {
      setRefilling(false);
    }
  }

  useEffect(() => { fetchProduct(); }, [id]);

  function toggleCategory(cid: number) {
    setSelectedCategories(prev => prev.includes(cid) ? prev.filter(c => c !== cid) : [...prev, cid]);
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

  async function save() {
    if (!name.trim()) return Alert.alert('Error', 'Product name is required.');
    setSaving(true);
    try {
      await productAPI.update(id, {
        name: name.trim(),
        part_number: partNumber.trim() || null,
        upc_code: upcCode.trim() || null,
        brand: brand.trim() || null,
        description: description.trim() || null,
        material: material || null,
        unit_of_measure: unitOfMeasure || null,
        buying_price: buyingPrice ? Number(buyingPrice) : null,
        wholesale_price: wholesalePrice ? Number(wholesalePrice) : null,
        min_price: minPrice ? Number(minPrice) : null,
        max_price: maxPrice ? Number(maxPrice) : null,
        weight: weight ? Number(weight) : null,
        bin_location: binLocation.trim() || null,
        supplier: supplier.trim() || null,
        tax_rate: taxRate ? Number(taxRate) : null,
        reorder_point: Number(reorderPoint),
        category_ids: selectedCategories,
        is_active: isActive,
        is_lead_free: isLeadFree,
        ...(photo ? { product_photo: photo } : {}),
      });
      await fetchProduct();
      setEditing(false);
      setPhoto(null);
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

  const sellRef = product.max_price ?? product.min_price ?? 0;
  const margin = product.buying_price != null ? Number(sellRef) - Number(product.buying_price) : null;
  const marginPct = product.buying_price && Number(product.buying_price) > 0 && margin != null
    ? ((margin / Number(product.buying_price)) * 100).toFixed(1) : null;

  if (editing) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
          {photo
            ? <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
            : product.product_photo
              ? <>
                  <Image
                    source={{ uri: product.product_photo.startsWith('http') ? product.product_photo : `${SERVER_BASE}${product.product_photo}` }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                  />
                  <View style={styles.photoOverlay}><Text style={styles.photoOverlayText}>Tap to change</Text></View>
                </>
              : <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoIcon}>📷</Text>
                  <Text style={styles.photoHint}>Tap to add photo</Text>
                </View>
          }
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Part Number</Text>
          <TextInput style={styles.input} value={partNumber} onChangeText={setPartNumber} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>UPC Code</Text>
          <TextInput style={styles.input} value={upcCode} onChangeText={setUpcCode} placeholder="Barcode / UPC" placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Brand</Text>
          <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor={C.textFaint}
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
              <Text style={styles.label}>Min Price (TZS)</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock</Text>
          <Text style={styles.label}>Reorder Point</Text>
          <TextInput style={styles.input} value={reorderPoint} onChangeText={setReorderPoint} keyboardType="numeric" placeholderTextColor={C.textFaint} />
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

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn, { flex: 1 }]} onPress={() => { setEditing(false); setPhoto(null); }}>
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
        {product.product_photo && (
          <Image
            source={{ uri: product.product_photo.startsWith('http') ? product.product_photo : `${SERVER_BASE}${product.product_photo}` }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        )}
        <View style={styles.headerRow}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
        </View>
        {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
        {product.part_number ? <Text style={styles.partNumber}>{product.part_number}</Text> : null}
        {product.description ? <Text style={[styles.partNumber, { marginTop: 8, lineHeight: 18 }]}>{product.description}</Text> : null}
        <View style={[styles.badgeRow, { marginTop: 10 }]}>
          {product.material ? <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>{product.material}</Text></View> : null}
          {product.unit_of_measure ? <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>{product.unit_of_measure}</Text></View> : null}
          {product.is_lead_free ? <View style={[styles.infoBadge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.infoBadgeText, { color: '#16a34a' }]}>Lead Free</Text></View> : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.statGrid}>
          {product.min_price != null && <View style={styles.statBox}><Text style={styles.statLabel}>Min Price</Text><Text style={[styles.statValue, { color: C.primary }]}>{fmt(product.min_price)}</Text></View>}
          {product.max_price != null && <View style={styles.statBox}><Text style={styles.statLabel}>Max Price</Text><Text style={[styles.statValue, { color: C.primary }]}>{fmt(product.max_price)}</Text></View>}
          {product.buying_price != null && <View style={styles.statBox}><Text style={styles.statLabel}>Buying</Text><Text style={styles.statValue}>{fmt(product.buying_price)}</Text></View>}
          {product.wholesale_price != null && <View style={styles.statBox}><Text style={styles.statLabel}>Wholesale</Text><Text style={styles.statValue}>{fmt(product.wholesale_price)}</Text></View>}
          {marginPct != null && <View style={styles.statBox}><Text style={styles.statLabel}>Margin</Text><Text style={styles.statValue}>{fmt(margin)} ({marginPct}%)</Text></View>}
          {product.tax_rate != null && <View style={styles.statBox}><Text style={styles.statLabel}>Tax Rate</Text><Text style={styles.statValue}>{product.tax_rate}%</Text></View>}
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
        {product.bin_location ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bin Location</Text>
            <Text style={styles.detailValue}>{product.bin_location}</Text>
          </View>
        ) : null}
      </View>

      {(product.supplier || product.weight != null || product.upc_code) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {product.upc_code ? <View style={styles.detailRow}><Text style={styles.detailLabel}>UPC</Text><Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>{product.upc_code}</Text></View> : null}
          {product.supplier ? <View style={styles.detailRow}><Text style={styles.detailLabel}>Supplier</Text><Text style={styles.detailValue}>{product.supplier}</Text></View> : null}
          {product.weight != null ? <View style={styles.detailRow}><Text style={styles.detailLabel}>Weight</Text><Text style={styles.detailValue}>{product.weight} kg</Text></View> : null}
        </View>
      )}

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stock Refill</Text>
        {!showRefillForm ? (
          <TouchableOpacity style={styles.refillBtn} onPress={() => setShowRefillForm(true)}>
            <Text style={styles.refillBtnText}>+ Record Stock Refill</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.label}>Quantity Added *</Text>
            <TextInput style={styles.input} value={refillQty} onChangeText={setRefillQty} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
            <Text style={[styles.label, { marginTop: 12 }]}>Notes (optional)</Text>
            <TextInput style={[styles.input, { height: 72, textAlignVertical: 'top' }]} value={refillNotes} onChangeText={setRefillNotes} multiline placeholder="e.g. received from supplier" placeholderTextColor={C.textFaint} />
            <View style={[styles.row, { marginTop: 12, gap: 10 }]}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn, { flex: 1 }]} onPress={() => { setShowRefillForm(false); setRefillQty(''); setRefillNotes(''); }}>
                <Text style={[styles.btnText, { color: C.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 2 }, refilling && { opacity: 0.6 }]} onPress={submitRefill} disabled={refilling}>
                {refilling ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {refillHistory.length > 0 && (
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Refill History</Text>
            {refillHistory.slice(0, 5).map((r: any, i: number) => (
              <View key={r.id ?? i} style={[styles.refillRow, i === Math.min(refillHistory.length, 5) - 1 && { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.refillQty}>+{r.quantity_added} units</Text>
                  {r.notes ? <Text style={styles.refillNote}>{r.notes}</Text> : null}
                </View>
                <Text style={styles.refillDate}>
                  {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

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
  photoBox:        { height: 360, borderRadius: 16, overflow: 'hidden', marginBottom: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  photoPreview:    { width: '100%', height: '100%' },
  photoPlaceholder:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoIcon:       { fontSize: 40 },
  photoHint:       { fontSize: 13, color: C.textMuted, fontWeight: '600' },
  photoOverlay:    { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 6, alignItems: 'center' },
  photoOverlayText:{ color: '#fff', fontSize: 12, fontWeight: '700' },
  headerCard:      { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  heroImage:       { width: '100%', height: 400, borderRadius: 10, marginBottom: 14, backgroundColor: C.bg },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  productName:     { fontSize: 18, fontWeight: '800', color: C.text, flex: 1, marginRight: 8 },
  brand:           { fontSize: 13, color: C.textMuted, marginBottom: 2 },
  partNumber:      { fontSize: 12, color: C.textFaint, fontFamily: 'monospace' },
  badgeRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  infoBadge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: C.primaryLight },
  infoBadgeText:   { fontSize: 11, fontWeight: '700', color: C.primary },
  section:         { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:    { fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  statGrid:        { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statBox:         { flex: 1, minWidth: 90, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: 'center' },
  statLabel:       { fontSize: 10, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' },
  statValue:       { fontSize: 13, fontWeight: '800', color: C.text, textAlign: 'center' },
  lowStockBanner:  { marginTop: 10, backgroundColor: C.redLight, borderRadius: 8, padding: 10 },
  lowStockText:    { color: C.red, fontWeight: '700', fontSize: 12 },
  detailRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: C.border, marginTop: 6 },
  detailLabel:     { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  detailValue:     { fontSize: 12, color: C.text, fontWeight: '700' },
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
  refillBtn:       { paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: C.primary },
  refillBtnText:   { color: C.primary, fontWeight: '700', fontSize: 14 },
  refillRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  refillQty:       { fontSize: 13, fontWeight: '700', color: C.green },
  refillNote:      { fontSize: 11, color: C.textMuted, marginTop: 2 },
  refillDate:      { fontSize: 11, color: C.textFaint },
  label:           { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:           { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  row:             { flexDirection: 'row' },
  flex1:           { flex: 1 },
  chipWrap:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:            { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  chipActive:      { backgroundColor: C.primaryLight, borderColor: C.primary },
  chipText:        { fontSize: 12, fontWeight: '600', color: C.textMuted },
  chipTextActive:  { color: C.primary, fontWeight: '700' },
  switchRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel:     { fontSize: 14, fontWeight: '600', color: C.text },
  btn:             { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtn:       { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  btnText:         { color: '#fff', fontWeight: '800', fontSize: 16 },
});
