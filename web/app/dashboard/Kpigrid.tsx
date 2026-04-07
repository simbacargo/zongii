import React from 'react';

function fmt(n) {
  if (n === null || n === undefined) return '—';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtNum(n) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('en-US');
}

function pct(n) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(1) + '%';
}

function KPICard({ label, value, sub, subColor = '#64748b', accent }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e8edf3',
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: accent, borderRadius: '12px 12px 0 0',
        }} />
      )}
      <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1.1, fontFamily: "'DM Mono', monospace" }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub}</span>
      )}
    </div>
  );
}

export default function KPIGrid({ data }) {
  if (!data) return null;

  const margin = data.gross_margin_pct;
  const marginColor = margin >= 30 ? '#16a34a' : margin >= 15 ? '#d97706' : '#dc2626';

  const cards = [
    {
      label: 'Total Revenue',
      value: fmt(data.total_revenue),
      sub: pct(margin) + ' gross margin',
      subColor: marginColor,
      accent: '#2563eb',
    },
    {
      label: 'Gross Profit',
      value: fmt(data.gross_profit),
      sub: fmt(data.total_cost) + ' cost of goods',
      subColor: '#64748b',
      accent: '#16a34a',
    },
    {
      label: 'Pending Sales',
      value: fmt(data.pending_sales_value),
      sub: fmtNum(data.pending_sales_count) + ' orders awaiting approval',
      subColor: '#d97706',
      accent: '#f59e0b',
    },
    {
      label: 'Inventory Value',
      value: fmt(data.total_inventory_value),
      sub: fmtNum(data.active_products) + ' active SKUs',
      subColor: '#64748b',
      accent: '#7c3aed',
    },
    {
      label: 'Stock Alerts',
      value: fmtNum(data.low_stock_count + data.out_of_stock_count),
      sub: fmtNum(data.out_of_stock_count) + ' out of stock · ' + fmtNum(data.low_stock_count) + ' low',
      subColor: data.out_of_stock_count > 0 ? '#dc2626' : '#d97706',
      accent: data.out_of_stock_count > 0 ? '#dc2626' : '#f59e0b',
    },
    {
      label: 'Outstanding AR',
      value: fmt(data.outstanding_balances),
      sub: fmtNum(data.total_customers) + ' total customers',
      subColor: data.outstanding_balances > 0 ? '#d97706' : '#16a34a',
      accent: '#0891b2',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
      marginBottom: 24,
    }}>
      {cards.map((c) => <KPICard key={c.label} {...c} />)}
    </div>
  );
}
