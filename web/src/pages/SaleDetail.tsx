import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { saleAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function SaleDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, isManager } = usePermissions();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  async function load() {
    try {
      const res = await saleAPI.get(id!);
      setSale(res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function approve() {
    if (!confirm('Approve this sale? Stock will be deducted.')) return;
    setActing(true);
    try { await saleAPI.approve(id!); await load(); }
    catch (e: any) { alert(e?.response?.data?.error ?? 'Failed'); }
    setActing(false);
  }

  async function reject() {
    if (!confirm('Reject this sale?')) return;
    setActing(true);
    try { await saleAPI.reject(id!); await load(); }
    catch (e: any) { alert(e?.response?.data?.error ?? 'Failed'); }
    setActing(false);
  }

  async function deleteSale() {
    if (!confirm('Delete this sale?')) return;
    setActing(true);
    try { await saleAPI.delete(id!); nav('/sales'); }
    catch (e: any) { alert(e?.response?.data?.error ?? 'Failed'); }
    setActing(false);
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!sale) return <div className="empty-state"><div className="icon">🛒</div>Sale not found</div>;

  const status = sale.rejected ? 'rejected' : sale.aproved ? 'approved' : 'pending';
  const canAct = (isManager || isAdmin) && status === 'pending';

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <span className={`badge status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">Sale #{sale.id}</span>
          {sale.order_id && (
            <Link to={`/orders/${sale.order_id}`} className="btn btn-ghost" style={{ fontSize: 12 }}>
              Order ZO{sale.order_id} →
            </Link>
          )}
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Product</div>
            <div className="detail-value" style={{ fontWeight: 700 }}>{sale.product_name}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">
              {sale.customer_name
                ? <Link to={`/customers/${sale.customer}`}>{sale.customer_name}</Link>
                : '—'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Quantity</div>
            <div className="detail-value" style={{ fontWeight: 700 }}>{sale.quantity_sold}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Price / Unit</div>
            <div className="detail-value">{fmt(sale.price_per_unit)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Total</div>
            <div className="detail-value" style={{ fontWeight: 800, fontSize: 18 }}>{fmt(sale.total_amount)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Date</div>
            <div className="detail-value text-sm">
              {new Date(sale.date_sold).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created by</div>
            <div className="detail-value">{sale.created_by_name || '—'}</div>
          </div>
        </div>
      </div>

      {(canAct || isAdmin) && (
        <div className="flex-center gap-8">
          {canAct && (
            <>
              <button className="btn btn-success" onClick={approve} disabled={acting}>
                Approve
              </button>
              <button className="btn btn-danger" onClick={reject} disabled={acting}>
                Reject
              </button>
            </>
          )}
          {isAdmin && !sale.aproved && (
            <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={deleteSale} disabled={acting}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
