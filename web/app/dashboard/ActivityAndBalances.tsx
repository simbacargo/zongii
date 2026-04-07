import React from 'react';

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const STATUS_CONFIG = {
  approved: { color: '#16a34a', bg: '#f0fdf4', label: 'Approved' },
  pending:  { color: '#d97706', bg: '#fffbeb', label: 'Pending' },
  rejected: { color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
  deleted:  { color: '#94a3b8', bg: '#f8fafc', label: 'Deleted' },
};

export function ActivityFeed({ data }) {
  const items = data?.activity || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          No recent activity
        </div>
      ) : items.map((a, i) => {
        const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
        const date = new Date(a.date_sold).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 0',
            borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {a.product_name}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {a.customer_name || 'Walk-in'} · {a.quantity} unit{a.quantity !== 1 ? 's' : ''} · {date}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                {fmt(a.total_amount)}
              </div>
              <div style={{ fontSize: 10, color: cfg.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                {cfg.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BalancesTable({ data }) {
  const customers = data?.customers || [];

  return (
    <div>
      {data?.total_outstanding > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>Total outstanding</span>
          <span style={{ fontWeight: 700, color: '#d97706', fontFamily: "'DM Mono', monospace" }}>
            {fmt(data.total_outstanding)}
          </span>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Customer', 'Contact', 'Balance Due'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#94a3b8',
                  padding: '0 8px 10px', borderBottom: '1px solid #e8edf3',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: 13 }}>
                  No outstanding balances
                </td>
              </tr>
            ) : customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                <td style={{ padding: '10px 8px', color: '#64748b', fontSize: 12 }}>{c.email || c.phone || '—'}</td>
                <td style={{ padding: '10px 8px', fontWeight: 700, color: '#d97706', fontFamily: "'DM Mono', monospace" }}>
                  {fmt(c.remaining_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
