import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,Image,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/lib/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const C = useColors();
  const styles = makeStyles(C);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Invalid username or password.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
		  <Image source={'../assets/logo.png'} />
            <Text style={styles.logoIcon}>📦</Text>
          </View>
          <Text style={styles.appName}>Zongii</Text>
          <Text style={styles.appSub}>Plumbing Operations</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subHeading}>Sign in to continue</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="e.g. Joseph" placeholderTextColor={C.textFaint} autoCapitalize="none" autoCorrect={false} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={C.textFaint} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Zongii v1.0 · Secure Access</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  flex:        { flex: 1, backgroundColor: C.bg },
  container:   { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  logoWrap:    { alignItems: 'center', marginBottom: 32 },
  logoBox:     { width: 72, height: 72, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  logoIcon:    { fontSize: 32 },
  appName:     { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  appSub:      { fontSize: 13, color: C.textMuted, marginTop: 2 },
  card:        { backgroundColor: C.card, borderRadius: 24, padding: 28, width: '100%', borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 },
  heading:     { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 4 },
  subHeading:  { fontSize: 13, color: C.textMuted, marginBottom: 24 },
  field:       { marginBottom: 16 },
  label:       { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:        { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12 },
  passwordInput:{ flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text },
  eyeBtn:       { paddingHorizontal: 14, paddingVertical: 12 },
  eyeText:      { fontSize: 18 },
  btn:         { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontWeight: '800', fontSize: 16 },
  footer:      { marginTop: 32, fontSize: 12, color: C.textFaint },
});
