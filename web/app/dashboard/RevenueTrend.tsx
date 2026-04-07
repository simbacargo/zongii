import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const fmt = (v) => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: '#0f172a' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name === 'revenue' ? '$' + Number(p.value).toLocaleString() : p.value + ' units'}
        </p>
      ))}
    </div>
  );
};

export default function RevenueTrend({ data }) {
  if (!data?.series?.length) return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
      No trend data available
    </div>
  );

  const formatted = data.series.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[
          { color: '#2563eb', label: 'Revenue' },
          { color: '#0891b2', label: 'Units Sold', dashed: true },
        ].map((l) => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
            <span style={{
              width: 24, height: 2, background: l.dashed ? 'transparent' : l.color,
              borderTop: l.dashed ? `2px dashed ${l.color}` : 'none', display: 'inline-block',
            }} />
            {l.label}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formatted} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="unitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0891b2" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={fmt} width={48} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={32} />
          <Tooltip content={<CustomTooltip />} />
          <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
          <Area yAxisId="right" type="monotone" dataKey="units" stroke="#0891b2" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#unitGrad)" dot={false} activeDot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
