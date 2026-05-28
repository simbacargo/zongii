import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING_PICKING:  'status-pending',
  PICKING:          'status-sent',
  PARTIALLY_PICKED: 'status-sent',
  PICKED:           'status-accepted',
  VERIFIED:         'status-approved',
  RE_PICK_REQUIRED: 'status-rejected',
  REJECTED:         'status-rejected',
  DISPATCHED:       'status-paid',
  CANCELLED:        'status-cancelled',
};

const STAGES = [
  { value: '',                label: 'All' },
  { value: 'PENDING_PICKING', label: 'Pending Picking' },
  { value: 'PICKING',         label: 'Picking' },
  { value: 'PARTIALLY_PICKED',label: 'Partial' },
  { value: 'PICKED',          label: 'Picked' },
  { value: 'VERIFIED',        label: 'Verified' },
  { value: 'RE_PICK_REQUIRED',label: 'Re-pick' },
  { value: 'DISPATCHED',      label: 'Dispatched' },
  { value: 'REJECTED',        label: 'Rejected' },
];

export default function Orders() {
  const nav = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  async function load(s = status, query = q) {
    setLoading(true);
    try {
      const res = await orderAPI.list({ status: s || undefined, q: query || undefined });
      setOrders(res.data.results ?? res.data);
    } catch (e: any) {
      console.error('Orders load error:', e?.response?.data ?? e);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="search-row">
        <input
          className="input"
          placeholder="Search by customer or order code (ZO123)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(status, q)}
        />
        <button className="btn btn-primary" onClick={() => load(status, q)}>Search</button>
      </div>

      <div className="pill-filters">
        {STAGES.map(s => (
          <button
            key={s.value}
            className={`pill${status === s.value ? ' active' : ''}`}
            onClick={() => { setStatus(s.value); load(s.value, q); }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><div className="icon">📦</div>No orders found</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Created by</th>
                <th>Items</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr
                  key={o.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => nav(`/orders/${o.id}`)}
                >
                  <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>
                    {o.order_code ?? `ZO${o.id}`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{o.customer_name || '—'}</td>
                  <td className="text-muted text-sm">{o.created_by_name || '—'}</td>
                  <td className="text-muted">{o.sales?.length ?? o.item_count ?? '—'}</td>
                  <td className="text-muted text-sm">
                    {new Date(o.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_COLORS[o.workflow_status] ?? 'status-pending'}`}>
                      {(o.workflow_status ?? '').replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
