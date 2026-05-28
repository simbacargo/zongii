import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

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

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, isManager } = usePermissions();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteFor, setShowNoteFor] = useState<'approve' | 're_pick' | 'reject' | null>(null);

  async function load() {
    try {
      const res = await orderAPI.get(id!);
      setOrder(res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function doVerify(action: 'approve' | 'reject' | 're_pick') {
    setActing(true);
    try {
      await orderAPI.verify(id!, action, note);
      setNote('');
      setShowNoteFor(null);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Action failed');
    }
    setActing(false);
  }

  async function doDispatch() {
    if (!confirm('Dispatch this order? Stock will be deducted.')) return;
    setActing(true);
    try {
      await orderAPI.dispatch(id!);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Dispatch failed');
    }
    setActing(false);
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!order) return <div className="empty-state"><div className="icon">📦</div>Order not found</div>;

  const ws = order.workflow_status;
  const canVerify = (isManager || isAdmin) && ['PICKED', 'PARTIALLY_PICKED', 'RE_PICK_REQUIRED'].includes(ws);
  const canDispatch = isAdmin && ws === 'VERIFIED';

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <span className={`badge ${STATUS_COLORS[ws] ?? 'status-pending'}`} style={{ fontSize: 13 }}>
          {ws.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Order Info */}
      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">Order {order.order_code ?? `ZO${order.id}`}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">{order.customer_name || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created by</div>
            <div className="detail-value">{order.created_by_name || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created at</div>
            <div className="detail-value">
              {new Date(order.created_at).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
          {order.verified_by_name && (
            <div className="detail-item">
              <div className="detail-label">Verified by</div>
              <div className="detail-value">{order.verified_by_name}</div>
            </div>
          )}
          {order.dispatched_at && (
            <div className="detail-item">
              <div className="detail-label">Dispatched at</div>
              <div className="detail-value">
                {new Date(order.dispatched_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
          )}
          {order.notes && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-label">Notes</div>
              <div className="detail-value">{order.notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      {order.sales?.length > 0 && (
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Line Items</span></div>
          <div className="table-wrap" style={{ margin: 0, borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price / Unit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.sales.map((s: any) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.product_name}</td>
                    <td>{s.quantity_sold}</td>
                    <td>{fmt(s.price_per_unit)}</td>
                    <td style={{ fontWeight: 800 }}>{fmt(s.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Picking Orders */}
      {order.picking_orders?.length > 0 && (
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Picking Orders</span></div>
          {order.picking_orders.map((po: any) => (
            <div key={po.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div className="flex-between">
                <div>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{po.picking_code}</span>
                  {' '}
                  <span className="text-muted text-sm">— Picker: {po.picker_name || 'unassigned'}</span>
                </div>
                <div className="flex-center gap-8">
                  <span className={`badge status-${po.status === 'COMPLETED' ? 'paid' : po.status === 'PENDING' ? 'pending' : 'sent'}`}>
                    {po.status}
                  </span>
                  <Link to={`/picking/${po.id}`} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                    View
                  </Link>
                </div>
              </div>
              {po.items?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {po.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      <span style={{ flex: 1 }}>{item.product_name}</span>
                      <span>req: {item.requested_qty}</span>
                      <span style={{ color: item.picked_qty >= item.requested_qty ? 'var(--green)' : 'var(--red)' }}>
                        picked: {item.picked_qty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {(canVerify || canDispatch) && (
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Actions</span></div>
          <div style={{ padding: '16px' }}>
            {canVerify && !showNoteFor && (
              <div className="flex-center gap-8" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={() => setShowNoteFor('approve')} disabled={acting}>
                  ✓ Verify & Approve
                </button>
                <button className="btn btn-ghost" onClick={() => setShowNoteFor('re_pick')} disabled={acting}>
                  🔄 Request Re-pick
                </button>
                <button className="btn btn-danger" onClick={() => setShowNoteFor('reject')} disabled={acting}>
                  ✗ Reject
                </button>
              </div>
            )}
            {canDispatch && !showNoteFor && (
              <button className="btn btn-primary" onClick={doDispatch} disabled={acting}>
                🚚 Dispatch Order
              </button>
            )}
            {showNoteFor && (
              <div>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  {showNoteFor === 'approve' ? 'Approve' : showNoteFor === 're_pick' ? 'Request Re-pick' : 'Reject'} — add a note (optional)
                </div>
                <textarea
                  className="input"
                  style={{ minHeight: 80, width: '100%', marginBottom: 12 }}
                  placeholder="Note…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <div className="flex-center gap-8">
                  <button
                    className={`btn ${showNoteFor === 'approve' ? 'btn-success' : showNoteFor === 'reject' ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={() => doVerify(showNoteFor)}
                    disabled={acting}
                  >
                    {acting ? 'Processing…' : 'Confirm'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setShowNoteFor(null); setNote(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status History */}
      {order.history?.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Status History</span></div>
          {order.history.map((h: any, i: number) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <div className="flex-between">
                <div>
                  {h.from_status && <span className="text-muted">{h.from_status.replace(/_/g, ' ')} → </span>}
                  <strong>{h.to_status.replace(/_/g, ' ')}</strong>
                  {' '}<span className="text-muted">by {h.changed_by_name}</span>
                </div>
                <span className="text-faint text-xs">
                  {new Date(h.changed_at).toLocaleString('en-GB', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              {h.note && <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>{h.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
