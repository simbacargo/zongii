import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

const fmt = (n) => '$' + (n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n);
const fmtFull = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill, margin: '2px 0' }}>
          {p.name}: {fmtFull(p.value)}
        </p>
      ))}
      {payload.length === 2 && (
        <p style={{ color: '#16a34a', borderTop: '1px solid #f1f5f9', marginTop: 6, paddingTop: 6 }}>
          Margin: {fmtFull(payload[1].value - payload[0].value)}
        </p>
      )}
    </div>
  );
};

export default function StockValuation({ data }) {
  if (!data) return null;

  const { totals, by_category } = data;
  const categories = (by_category || []).slice(0, 7).map((c) => ({
    name: c.category.length > 12 ? c.category.slice(0, 11) + '…' : c.category,
    Cost: c.cost_value,
    Retail: c.retail_value,
  }));

  return (
    <div>
      {totals && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'At Cost', value: totals.cost_value, color: '#7c3aed' },
            { label: 'Retail', value: totals.retail_value, color: '#2563eb' },
            { label: 'Potential Profit', value: totals.potential_profit, color: '#16a34a' },
          ].map((m) => (
            <div key={m.label} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: m.color, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                {fmtFull(m.value)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        {[{ color: '#7c3aed', label: 'Cost' }, { color: '#2563eb', label: 'Retail' }].map((l) => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={categories} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={fmt} width={44} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Cost" fill="#7c3aed" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Retail" fill="#2563eb" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
