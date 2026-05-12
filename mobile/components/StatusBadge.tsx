import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/lib/theme';

type Status = 'approved' | 'pending' | 'rejected' | 'active' | 'inactive' | string;

export default function StatusBadge({ status }: { status: Status }) {
  const C = useColors();
  const MAP = {
    approved: { bg: C.greenLight,  text: C.green,  label: 'Approved' },
    pending:  { bg: C.amberLight,  text: C.amber,  label: 'Pending'  },
    rejected: { bg: C.redLight,    text: C.red,    label: 'Rejected' },
    active:   { bg: C.greenLight,  text: C.green,  label: 'Active'   },
    inactive: { bg: C.redLight,    text: C.red,    label: 'Inactive' },
  } as Record<string, { bg: string; text: string; label: string }>;

  const s = MAP[status] ?? { bg: C.border, text: C.textMuted, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{s.label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  text:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
