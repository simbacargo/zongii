import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';

const fmtFull = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtK = (n) => n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'k' : '$' + n;

const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe', '#ecfeff'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: '#0891b2' }}>Total spent: {fmtFull(d.total_spent)}</p>
      <p style={{ color: '#64748b' }}>{d.orders} orders · avg {fmtFull(d.avg_order_value)}</p>
      {d.remaining_balance > 0 && (
        <p style={{ color: '#d97706' }}>Balance due: {fmtFull(d.remaining_balance)}</p>
      )}
    </div>
  );
};

export default function TopCustomers({ data }) {
  if (!data?.customers?.length) return (
    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
      No customer data available
    </div>
  );

  const items = data.customers.slice(0, 8);
  const chartHeight = Math.max(260, items.length * 38 + 60);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={items} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} width={120} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total_spent" radius={[0, 4, 4, 0]}>
          {items.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
