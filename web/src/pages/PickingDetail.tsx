import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pickingAPI } from '../lib/api';

export default function PickingDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [picking, setPicking] = useState<any>(null);
  const [picks, setPicks] = useState<Record<number, { qty: number; notes: string }>>({});
  const [pickerNotes, setPickerNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await pickingAPI.get(id!);
      const p = res.data;
      setPicking(p);
      setPickerNotes(p.notes ?? '');
      const initial: Record<number, { qty: number; notes: string }> = {};
      (p.items ?? []).forEach((item: any) => {
        initial[item.id] = { qty: item.picked_qty ?? 0, notes: item.notes ?? '' };
      });
      setPicks(initial);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function submit() {
    setSaving(true);
    try {
      const items = Object.entries(picks).map(([itemId, { qty, notes }]) => ({
        id: Number(itemId),
        picked_qty: qty,
        notes,
      }));
      await pickingAPI.submit(id!, items, pickerNotes);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Submit failed');
    }
    setSaving(false);
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!picking) return <div className="empty-state"><div className="icon">🔍</div>Picking order not found</div>;

  const isActive = ['ACCEPTED', 'PARTIALLY_PICKED'].includes(picking.status);
  const isCompleted = picking.status === 'COMPLETED';

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <div className="flex-center gap-8">
          <span className={`badge status-${isCompleted ? 'paid' : isActive ? 'sent' : 'pending'}`}>
            {picking.status}
          </span>
          <Link to={`/orders/${picking.sale_order}`} className="btn btn-ghost" style={{ fontSize: 12 }}>
            View Order →
          </Link>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title" style={{ fontFamily: 'monospace' }}>{picking.picking_code}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Order</div>
            <div className="detail-value">{picking.sale_order_code ?? `ZO${picking.sale_order}`}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">{picking.customer_name || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Assigned to</div>
            <div className="detail-value">{picking.picker_name || 'Unassigned'}</div>
          </div>
          {picking.accepted_at && (
            <div className="detail-item">
              <div className="detail-label">Accepted at</div>
              <div className="detail-value text-sm">
                {new Date(picking.accepted_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Items</span></div>
        {(picking.items ?? []).map((item: any) => {
          const pick = picks[item.id] ?? { qty: 0, notes: '' };
          const done = pick.qty >= item.requested_qty;
          return (
            <div key={item.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Bin: {item.product_bin ?? '—'} · Requested: {item.requested_qty}
                  </div>
                </div>
                <span style={{ color: done ? 'var(--green)' : pick.qty > 0 ? 'var(--orange)' : 'var(--muted)', fontWeight: 700 }}>
                  {pick.qty} / {item.requested_qty}
                </span>
              </div>
              {isActive && (
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={item.requested_qty}
                    value={pick.qty}
                    onChange={e => setPicks(prev => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], qty: Number(e.target.value) },
                    }))}
                  />
                  <input
                    className="input"
                    placeholder="Notes (optional)"
                    value={pick.notes}
                    onChange={e => setPicks(prev => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], notes: e.target.value },
                    }))}
                  />
                </div>
              )}
              {!isActive && item.notes && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{item.notes}</div>
              )}
            </div>
          );
        })}
      </div>

      {isActive && (
        <>
          <div className="card mb-16">
            <div className="card-header"><span className="card-title">Picker Notes</span></div>
            <div style={{ padding: '12px 16px' }}>
              <textarea
                className="input"
                style={{ width: '100%', minHeight: 70 }}
                placeholder="Any notes about this picking…"
                value={pickerNotes}
                onChange={e => setPickerNotes(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15 }}
            onClick={submit}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Submit Picks'}
          </button>
        </>
      )}

      {isCompleted && picking.notes && (
        <div className="card">
          <div className="card-header"><span className="card-title">Notes</span></div>
          <div style={{ padding: '12px 16px', color: 'var(--muted)' }}>{picking.notes}</div>
        </div>
      )}
    </div>
  );
}
