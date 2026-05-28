import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pickingAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

export default function PickingDashboard() {
  const nav = useNavigate();
  const { isPicker, isAdmin } = usePermissions();
  const [pending, setPending] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);

  async function load() {
    try {
      const [pendingRes, activeRes] = await Promise.all([
        pickingAPI.list({ status: 'PENDING' }),
        pickingAPI.list({ mine: true }),
      ]);
      setPending(pendingRes.data.results ?? pendingRes.data);
      const allMine = activeRes.data.results ?? activeRes.data;
      setActive(allMine.filter((p: any) => ['ACCEPTED', 'PARTIALLY_PICKED'].includes(p.status)));
    } catch (e: any) {
      console.error(e?.response?.data ?? e);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!isPicker && !isAdmin) { nav('/'); return; }
    load();
  }, []);

  async function accept(pickingId: number) {
    setAccepting(pickingId);
    try {
      await pickingAPI.accept(pickingId);
      nav(`/picking/${pickingId}`);
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Failed to accept');
    }
    setAccepting(null);
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;

  return (
    <div>
      {active.length > 0 && (
        <>
          <h3 style={{ fontWeight: 800, marginBottom: 12 }}>My Active Pickings</h3>
          {active.map((po: any) => (
            <div key={po.id} className="card mb-16">
              <div className="card-header">
                <span className="card-title" style={{ fontFamily: 'monospace' }}>{po.picking_code}</span>
                <Link to={`/picking/${po.id}`} className="btn btn-primary" style={{ fontSize: 12 }}>
                  Continue Picking →
                </Link>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <div className="text-muted">
                  Order: {po.sale_order_code ?? `ZO${po.sale_order}`} · Customer: {po.customer_name || '—'}
                </div>
                <div className="text-muted text-sm">
                  {po.items?.length ?? 0} item{po.items?.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="flex-between mb-12">
        <h3 style={{ fontWeight: 800, margin: 0 }}>Pending Orders</h3>
        <span className="text-muted">{pending.length} awaiting picker</span>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">
          <div className="icon">✅</div>
          No pending orders
        </div>
      ) : (
        pending.map((po: any) => (
          <div key={po.id} className="card mb-16">
            <div className="card-header">
              <span className="card-title" style={{ fontFamily: 'monospace' }}>{po.picking_code}</span>
              <span className={`badge status-${po.status === 'PENDING' ? 'pending' : 'sent'}`}>
                {po.status}
              </span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ marginBottom: 8 }}>
                <span className="text-muted">Order: </span>
                <strong>{po.sale_order_code ?? `ZO${po.sale_order}`}</strong>
                {' · '}
                <span className="text-muted">Customer: </span>
                <strong>{po.customer_name || '—'}</strong>
              </div>
              {po.items?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {po.items.map((item: any) => (
                    <div key={item.id} style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 8 }}>
                      <span style={{ flex: 1 }}>{item.product_name}</span>
                      <span>×{item.requested_qty}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={() => accept(po.id)}
                disabled={accepting === po.id}
              >
                {accepting === po.id ? 'Accepting…' : 'Accept & Start Picking'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
