import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/lib/theme';

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  accentBg?: string;
  icon: string;
}

export default function KPICard({ label, value, sub, accent, accentBg, icon }: Props) {
  const C = useColors();
  const styles = makeStyles(C);
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: accentBg ?? C.primaryLight }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent ?? C.text }]}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof useColors>) => StyleSheet.create({
  card:     { backgroundColor: C.card, borderRadius: 16, padding: 16, flex: 1, minWidth: 150, borderWidth: 1, borderColor: C.border },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  label:    { fontSize: 10, fontWeight: '700', color: C.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  value:    { fontSize: 22, fontWeight: '900' },
  sub:      { fontSize: 11, color: C.textMuted, marginTop: 2 },
});
