import React from 'react';

function StatusBadge({ qty, reorder }) {
  if (qty <= 0) return <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Out</span>;
  if (qty <= reorder * 0.5) return <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical</span>;
  return <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low</span>;
}

function StockBar({ qty, reorder }) {
  const ratio = reorder > 0 ? Math.min(qty / reorder, 1) : 0;
  const color = qty <= 0 ? '#dc2626' : ratio < 0.5 ? '#d97706' : '#16a34a';
  return (
    <div style={{ width: 64, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ width: `${Math.round(ratio * 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
    </div>
  );
}

export default function LowStockTable({ data }) {
  const items = data?.low_stock_items || [];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Product', 'Part #', 'Bin', 'On Hand', 'Reorder At', 'Status'].map((h) => (
              <th key={h} style={{
                textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#94a3b8',
                padding: '0 8px 10px', borderBottom: '1px solid #e8edf3',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: 13 }}>
                All stock levels are healthy
              </td>
            </tr>
          ) : items.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 8px' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.brand}</div>
              </td>
              <td style={{ padding: '10px 8px', color: '#64748b', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                {p.part_number}
              </td>
              <td style={{ padding: '10px 8px', color: '#64748b' }}>
                {p.bin_location || '—'}
              </td>
              <td style={{ padding: '10px 8px' }}>
                <div style={{ fontWeight: 700, color: p.quantity_at_hand <= 0 ? '#dc2626' : '#0f172a', fontFamily: "'DM Mono', monospace" }}>
                  {p.quantity_at_hand}
                </div>
                <StockBar qty={p.quantity_at_hand} reorder={p.reorder_point} />
              </td>
              <td style={{ padding: '10px 8px', color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                {p.reorder_point}
              </td>
              <td style={{ padding: '10px 8px' }}>
                <StatusBadge qty={p.quantity_at_hand} reorder={p.reorder_point} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
