import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { documentAPI } from '../lib/api';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

const STATUS_COLOR: Record<string, string> = {
  draft: 'status-draft', sent: 'status-sent', paid: 'status-paid',
  accepted: 'status-accepted', rejected: 'status-rejected', cancelled: 'status-cancelled',
};

const TRANSITIONS: Record<string, { status: string; label: string }[]> = {
  draft: [{ status: 'sent', label: 'Mark Sent' }, { status: 'cancelled', label: 'Cancel' }],
  sent:  [{ status: 'paid', label: 'Mark Paid' }, { status: 'accepted', label: 'Accept' }, { status: 'rejected', label: 'Reject' }, { status: 'cancelled', label: 'Cancel' }],
};

export default function Invoices() {
  const nav = useNavigate();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docFilter, setDocFilter] = useState<'all' | 'invoice' | 'quotation'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [acting, setActing] = useState<number | null>(null);

  async function load(df = docFilter, sf = statusFilter) {
    setLoading(true);
    try {
      const res = await documentAPI.list({
        ...(df !== 'all' ? { doc_type: df } : {}),
        ...(sf !== 'all' ? { status: sf } : {}),
      });
      setDocs(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function transition(id: number, status: string, label: string) {
    if (!confirm(`${label}?`)) return;
    setActing(id);
    try { await documentAPI.setStatus(id, status); await load(); }
    catch {}
    setActing(null);
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <div />
        <Link to="/invoices/new" className="btn btn-success">+ New Document</Link>
      </div>

      <div className="pill-filters">
        {(['all', 'invoice', 'quotation'] as const).map(f => (
          <button key={f} className={`pill${docFilter === f ? ' active' : ''}`}
            onClick={() => { setDocFilter(f); load(f, statusFilter); }}>
            {f === 'all' ? 'All' : f === 'invoice' ? 'Invoices' : 'Quotations'}
          </button>
        ))}
      </div>
      <div className="pill-filters">
        {['all', 'draft', 'sent', 'paid', 'accepted', 'rejected'].map(s => (
          <button key={s} className={`pill${statusFilter === s ? ' active' : ''}`}
            onClick={() => { setStatusFilter(s); load(docFilter, s); }}>
            {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : docs.length === 0 ? (
        <div className="empty-state"><div className="icon">🧾</div>No documents found</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Issued</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/invoices/${d.id}`)}>
                  <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{d.number}</td>
                  <td className="text-muted text-sm">{d.doc_type === 'invoice' ? '📄 Invoice' : '💬 Quote'}</td>
                  <td style={{ fontWeight: 600 }}>{d.customer_name || '—'}</td>
                  <td style={{ fontWeight: 800 }}>{fmt(d.total)}</td>
                  <td className="text-muted text-sm">
                    {new Date(d.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td><span className={`badge ${STATUS_COLOR[d.status] ?? 'status-draft'}`}>{d.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex-center gap-8">
                      {(TRANSITIONS[d.status] ?? []).map(t => (
                        <button
                          key={t.status}
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                          disabled={acting === d.id}
                          onClick={() => transition(d.id, t.status, t.label)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
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
