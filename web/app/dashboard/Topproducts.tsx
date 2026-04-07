import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';

const fmtFull = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtK = (n) => n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'k' : '$' + n;

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#f0f9ff'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#2563eb' }}>Revenue: {fmtFull(d.revenue)}</p>
      <p style={{ color: '#64748b' }}>Units sold: {d.units_sold}</p>
      <p style={{ color: '#64748b' }}>Avg price: {fmtFull(d.avg_price)}</p>
      <p style={{ color: d.available_stock > 0 ? '#16a34a' : '#dc2626' }}>
        Stock: {d.available_stock} available
      </p>
    </div>
  );
};

export default function TopProducts({ data }) {
  if (!data?.products?.length) return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
      No product data available
    </div>
  );

  const items = data.products.slice(0, 8).map((p, i) => ({
    ...p,
    name: p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name,
    colorIdx: i,
  }));

  const chartHeight = Math.max(280, items.length * 40 + 60);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={items} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} width={130} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {items.map((entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
