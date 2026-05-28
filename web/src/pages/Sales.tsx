import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { saleAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
type SalesFilter = typeof STATUS_FILTERS[number];

export default function Sales() {
  const nav = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SalesFilter>('all');
  const [q, setQ] = useState('');
  const [acting, setActing] = useState<number | null>(null);
  const { isManager, isAccountant, isSales } = usePermissions();
  const canAct = isManager || isAccountant;

  async function load(f = filter, query = q) {
    setLoading(true);
    try {
      const res = await saleAPI.list(f === 'all' ? undefined : f, query || undefined);
      setSales(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: number) {
    setActing(id);
    try { await saleAPI.approve(id); await load(); }
    catch {}
    setActing(null);
  }

  async function reject(id: number) {
    if (!confirm('Reject this sale?')) return;
    setActing(id);
    try { await saleAPI.reject(id); await load(); }
    catch {}
    setActing(null);
  }

  return (
    <div>
      <div className="search-row">
        <input
          className="input"
          placeholder="Search by product or customer…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(filter, q)}
        />
        <button className="btn btn-primary" onClick={() => load(filter, q)}>Search</button>
        {isSales && <Link to="/sales/new" className="btn btn-success">+ New Order</Link>}
      </div>

      <div className="pill-filters">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            className={`pill${filter === f ? ' active' : ''}`}
            onClick={() => { setFilter(f); load(f, q); }}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : sales.length === 0 ? (
        <div className="empty-state"><div className="icon">🛒</div>No sales found</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                {canAct && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sales.map(s => {
                const status = s.rejected ? 'rejected' : s.aproved ? 'approved' : 'pending';
                return (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/sales/${s.id}`)}>
                    <td className="text-muted text-sm">
                      {new Date(s.date_sold).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 700 }}>{s.product_name}</td>
                    <td className="text-muted">{s.customer_name || '—'}</td>
                    <td>{s.quantity_sold}</td>
                    <td style={{ fontWeight: 800 }}>{fmt(s.total_amount)}</td>
                    <td>
                      <span className={`badge status-${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    {canAct && (
                      <td onClick={e => e.stopPropagation()}>
                        {status === 'pending' && (
                          <div className="flex-center gap-8">
                            <button
                              className="btn btn-success"
                              style={{ padding: '4px 10px', fontSize: 11 }}
                              disabled={acting === s.id}
                              onClick={() => approve(s.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 10px', fontSize: 11 }}
                              disabled={acting === s.id}
                              onClick={() => reject(s.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
