import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '@/lib/api';
import { useColors } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = makeStyles(C);
  const { user, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstname, setFirstname] = useState(user?.firstname ?? '');
  const [lastname, setLastname] = useState(user?.lastname ?? '');
  const [mobile, setMobile] = useState(user?.mobile ?? '');

  async function save() {
    setSaving(true);
    try {
      await authAPI.updateProfile({ firstname, lastname, mobile });
      setEditing(false);
      Alert.alert('Saved', 'Profile updated.');
    } catch (e: any) {
      const err = e?.response?.data;
      const msg = typeof err === 'object' ? Object.values(err).flat().join('\n') : 'Failed to update profile.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  function confirmLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  }

  if (!user) return null;

  const roleLabel = user.is_admin ? 'Admin' : user.role === 'manager' ? 'Manager' : user.role === 'staff' ? 'Staff' : user.role ?? 'Staff';
  const initials = ((user.firstname?.[0] ?? '') + (user.lastname?.[0] ?? '')) || user.username[0].toUpperCase();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.avatarBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      {editing ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <Text style={styles.label}>First Name</Text>
          <TextInput style={styles.input} value={firstname} onChangeText={setFirstname} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Last Name</Text>
          <TextInput style={styles.input} value={lastname} onChangeText={setLastname} placeholderTextColor={C.textFaint} />
          <Text style={[styles.label, { marginTop: 12 }]}>Mobile</Text>
          <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholderTextColor={C.textFaint} />
          <View style={[styles.row, { marginTop: 16 }]}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn, { flex: 1 }]} onPress={() => setEditing(false)}>
              <Text style={[styles.btnText, { color: C.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ width: 10 }} />
            <TouchableOpacity style={[styles.btn, { flex: 2 }, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <Row label="Username" value={user.username} C={C} />
          {user.email ? <Row label="Email" value={user.email} C={C} /> : null}
          {user.firstname || user.lastname
            ? <Row label="Name" value={`${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()} C={C} />
            : null}
          {user.mobile ? <Row label="Mobile" value={user.mobile} C={C} /> : null}
          <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={() => setEditing(true)}>
            <Text style={styles.btnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value, C }: { label: string; value: string; C: any }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{value}</Text>
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  content:     { padding: 16, paddingBottom: 48 },
  backBtn:     { marginBottom: 16 },
  backText:    { fontSize: 14, color: C.primary, fontWeight: '600' },
  avatarBlock: { alignItems: 'center', marginBottom: 24 },
  avatar:      { width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { color: '#fff', fontWeight: '900', fontSize: 28 },
  username:    { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 6 },
  roleBadge:   { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: C.primaryLight },
  roleText:    { fontSize: 12, fontWeight: '700', color: C.primary },
  section:     { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },
  label:       { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:       { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  row:         { flexDirection: 'row' },
  btn:         { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelBtn:   { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  btnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
  logoutBtn:   { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.red },
  logoutText:  { color: C.red, fontWeight: '700', fontSize: 14 },
});
