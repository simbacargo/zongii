import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

const STATUS_COLOR: Record<string, string> = {
  draft: 'status-draft', sent: 'status-sent', paid: 'status-paid',
  accepted: 'status-accepted', rejected: 'status-rejected', cancelled: 'status-cancelled',
};

const NEXT_STATUSES: Record<string, { status: string; label: string }[]> = {
  draft:    [{ status: 'sent', label: 'Mark Sent' }, { status: 'cancelled', label: 'Cancel' }],
  sent:     [{ status: 'paid', label: 'Mark Paid' }, { status: 'accepted', label: 'Accept' }, { status: 'rejected', label: 'Reject' }, { status: 'cancelled', label: 'Cancel' }],
  accepted: [{ status: 'paid', label: 'Mark Paid' }, { status: 'cancelled', label: 'Cancel' }],
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin } = usePermissions();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  async function load() {
    try {
      const res = await documentAPI.get(id!);
      setDoc(res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function transition(status: string) {
    if (!confirm(`Change status to "${status}"?`)) return;
    setActing(true);
    try { await documentAPI.setStatus(id!, status); await load(); }
    catch (e: any) { alert(e?.response?.data?.error ?? 'Failed'); }
    setActing(false);
  }

  async function deleteDoc() {
    if (!confirm('Delete this document?')) return;
    try { await documentAPI.delete(id!); nav('/invoices'); }
    catch {}
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!doc) return <div className="empty-state"><div className="icon">🧾</div>Document not found</div>;

  const nextStatuses = NEXT_STATUSES[doc.status] ?? [];

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <div className="flex-center gap-8">
          {isAdmin && (
            <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={deleteDoc}>Delete</button>
          )}
          <span className={`badge ${STATUS_COLOR[doc.status] ?? 'status-draft'}`}>{doc.status}</span>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">{doc.doc_type === 'invoice' ? '📄 Invoice' : '💬 Quotation'} {doc.number}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value" style={{ fontWeight: 700 }}>{doc.customer_name || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Issue Date</div>
            <div className="detail-value">
              {new Date(doc.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          {doc.due_date && (
            <div className="detail-item">
              <div className="detail-label">Due Date</div>
              <div className="detail-value">
                {new Date(doc.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          )}
          <div className="detail-item">
            <div className="detail-label">Created by</div>
            <div className="detail-value">{doc.created_by_name || '—'}</div>
          </div>
          {doc.notes && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-label">Notes</div>
              <div className="detail-value">{doc.notes}</div>
            </div>
          )}
          {doc.terms && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-label">Terms</div>
              <div className="detail-value">{doc.terms}</div>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Items</span></div>
        <div className="table-wrap" style={{ margin: 0, borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(doc.items ?? []).map((item: any) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.description}</td>
                  <td className="text-muted">{item.unit}</td>
                  <td>{item.quantity}</td>
                  <td>{fmt(item.unit_price)}</td>
                  <td style={{ fontWeight: 800 }}>{fmt(Number(item.quantity) * Number(item.unit_price))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', textAlign: 'right' }}>
          {doc.discount_percent > 0 && (
            <div className="text-muted" style={{ marginBottom: 4 }}>
              Discount: {doc.discount_percent}% (−{fmt(doc.subtotal * doc.discount_percent / 100)})
            </div>
          )}
          <div style={{ fontSize: 20, fontWeight: 800 }}>Total: {fmt(doc.total)}</div>
        </div>
      </div>

      {/* Actions */}
      {nextStatuses.length > 0 && (
        <div className="flex-center gap-8" style={{ flexWrap: 'wrap' }}>
          {nextStatuses.map(t => (
            <button
              key={t.status}
              className={`btn ${t.status === 'paid' || t.status === 'accepted' ? 'btn-success' : t.status === 'rejected' || t.status === 'cancelled' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => transition(t.status)}
              disabled={acting}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
