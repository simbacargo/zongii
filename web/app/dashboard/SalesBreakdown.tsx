import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const STATUSES = [
  { key: 'approved', label: 'Approved', color: '#16a34a' },
  { key: 'pending',  label: 'Pending',  color: '#d97706' },
  { key: 'rejected', label: 'Rejected', color: '#dc2626' },
  { key: 'deleted',  label: 'Deleted',  color: '#94a3b8' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, color: d.payload.color, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: '#0f172a' }}>{fmt(d.value)}</p>
      <p style={{ color: '#64748b' }}>{d.payload.count} orders</p>
    </div>
  );
};

export default function SalesBreakdown({ data }) {
  if (!data) return null;

  const chartData = STATUSES
    .map((s) => ({
      name: s.label,
      value: data[s.key]?.value || 0,
      count: data[s.key]?.count || 0,
      color: s.color,
    }))
    .filter((d) => d.value > 0);

  const total = chartData.reduce((a, b) => a + b.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {STATUSES.map((s) => {
          const d = data[s.key] || { value: 0, count: 0 };
          const share = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#475569', flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>{share.toFixed(0)}%</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', minWidth: 72, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>
                {fmt(d.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
