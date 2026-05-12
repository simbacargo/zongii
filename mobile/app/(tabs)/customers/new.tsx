import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { customerAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';

export default function NewCustomerScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');

  async function submit() {
    if (!name.trim()) return Alert.alert('Error', 'Customer name is required.');
    setSaving(true);
    try {
      await customerAPI.create({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        balance: Number(balance) || 0,
      });
      Alert.alert('Success', 'Customer added!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to create customer.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Info</Text>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Juma Hassan" placeholderTextColor={C.textFaint} autoCapitalize="words" />
        <Text style={[styles.label, { marginTop: 12 }]}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+255 7XX XXX XXX" placeholderTextColor={C.textFaint} keyboardType="phone-pad" />
        <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="customer@email.com" placeholderTextColor={C.textFaint} keyboardType="email-address" autoCapitalize="none" />
        <Text style={[styles.label, { marginTop: 12 }]}>Address</Text>
        <TextInput style={[styles.input, styles.multiline]} value={address} onChangeText={setAddress} placeholder="Street, area, city..." placeholderTextColor={C.textFaint} multiline numberOfLines={3} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opening Balance</Text>
        <Text style={styles.hint}>Enter any existing debt this customer already owes.</Text>
        <TextInput style={styles.input} value={balance} onChangeText={setBalance} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textFaint} />
      </View>

      <TouchableOpacity style={[styles.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Customer</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  content:     { padding: 16, paddingBottom: 40 },
  section:     { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  label:       { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  hint:        { fontSize: 12, color: C.textMuted, marginBottom: 10 },
  input:       { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  multiline:   { height: 80, textAlignVertical: 'top' },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: '800', fontSize: 16 },
});
