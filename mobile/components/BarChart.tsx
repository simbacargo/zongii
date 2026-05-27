import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useColors } from '@/lib/theme';

interface Props {
  labels: string[];
  values: number[];
  barHeight?: number;
}

const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(0)}K`
  : String(Math.round(n));

export default function BarChart({ labels, values, barHeight = 100 }: Props) {
  const C = useColors();
  const max = Math.max(...values, 1);
  const many = labels.length > 14;
  const barW = many ? 10 : 20;
  const gap  = many ? 3  : 6;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: barHeight + 28, gap }}>
          {values.map((v, i) => {
            const h    = max > 0 ? Math.max((v / max) * barHeight, v > 0 ? 3 : 0) : 0;
            const lbl  = labels[i] ?? '';
            const show = !many || i === 0 || i % 5 === 0 || i === labels.length - 1;
            return (
              <View key={i} style={{ alignItems: 'center', width: barW }}>
                {v > 0 && (
                  <Text style={[s.val, { color: C.primary, fontSize: many ? 7 : 8 }]} numberOfLines={1}>
                    {fmtK(v)}
                  </Text>
                )}
                <View style={[s.bar, { width: barW, height: h || 2, backgroundColor: v > 0 ? C.primary : C.border, borderRadius: 3, opacity: v > 0 ? 1 : 0.3 }]} />
                {show && <Text style={[s.lbl, { color: C.textFaint, fontSize: many ? 7 : 9 }]} numberOfLines={1}>{lbl}</Text>}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { marginTop: 2 },
  val: { fontWeight: '700', marginBottom: 2 },
  lbl: { marginTop: 3, fontWeight: '600' },
});
