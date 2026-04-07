import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HEALTH_COLORS = { healthy: '#16a34a', low_stock: '#d97706', out_of_stock: '#dc2626' };
const LABELS = { healthy: 'Healthy', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, color: '#0f172a' }}>{label}</p>
      <p style={{ color: payload[0].fill }}>{payload[0].value} SKUs</p>
    </div>
  );
};

export default function InventoryHealth({ data }) {
  if (!data) return null;
  const s = data.summary || {};
  const total = (s.healthy || 0) + (s.low_stock || 0) + (s.out_of_stock || 0) || 1;

  const barData = [
    { name: 'Healthy', value: s.healthy || 0, color: HEALTH_COLORS.healthy },
    { name: 'Low Stock', value: s.low_stock || 0, color: HEALTH_COLORS.low_stock },
    { name: 'Out of Stock', value: s.out_of_stock || 0, color: HEALTH_COLORS.out_of_stock },
  ];

  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 6, overflow: 'hidden', gap: 2, marginBottom: 12 }}>
        {Object.entries(HEALTH_COLORS).map(([k, color]) => (
          <div key={k} style={{
            flex: s[k] || 0,
            background: color,
            minWidth: s[k] > 0 ? 4 : 0,
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {Object.entries(HEALTH_COLORS).map(([k, color]) => (
          <div key={k} style={{ flex: 1, background: color + '12', borderRadius: 8, padding: '8px 10px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'DM Mono', monospace" }}>{s[k] || 0}</div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
              {LABELS[k]}
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
