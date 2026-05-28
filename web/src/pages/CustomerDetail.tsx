import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerAPI, saleAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function CustomerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, isManager } = usePermissions();
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);

  async function load() {
    try {
      const [cRes, sRes] = await Promise.all([
        customerAPI.get(id!),
        saleAPI.list(undefined, undefined),
      ]);
      setCustomer(cRes.data);
      const all = sRes.data.results ?? sRes.data;
      setSales(all.filter((s: any) => s.customer === Number(id)).slice(0, 10));
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function pay() {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    setPaying(true);
    try {
      await customerAPI.pay(id!, amount);
      setPayAmount('');
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Payment failed');
    }
    setPaying(false);
  }

  async function deleteCustomer() {
    if (!confirm('Delete this customer? This cannot be undone.')) return;
    try {
      await customerAPI.delete(id!);
      nav('/customers');
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Delete failed');
    }
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!customer) return <div className="empty-state"><div className="icon">👥</div>Customer not found</div>;

  const isOverdue = customer.debt_due_date && new Date(customer.debt_due_date) < new Date();

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <div className="flex-center gap-8">
          <Link to={`/customers/${id}/edit`} className="btn btn-ghost">Edit</Link>
          {isAdmin && (
            <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={deleteCustomer}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">{customer.name}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{customer.email || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Phone</div>
            <div className="detail-value">{customer.phone || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Outstanding Balance</div>
            <div className="detail-value" style={{ fontWeight: 800, color: customer.remaining_balance > 0 ? 'var(--red)' : 'var(--green)', fontSize: 18 }}>
              {fmt(customer.remaining_balance)}
            </div>
          </div>
          {customer.debt_due_date && (
            <div className="detail-item">
              <div className="detail-label">Due Date</div>
              <div className="detail-value" style={{ color: isOverdue ? 'var(--red)' : undefined }}>
                {new Date(customer.debt_due_date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
                {isOverdue && ' ⚠ Overdue'}
              </div>
            </div>
          )}
        </div>
      </div>

      {(isManager || isAdmin) && customer.remaining_balance > 0 && (
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Record Payment</span></div>
          <div style={{ padding: '12px 16px' }}>
            <div className="search-row">
              <input
                className="input"
                type="number"
                min={1}
                max={customer.remaining_balance}
                placeholder="Amount (TZS)"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
              />
              <button className="btn btn-success" onClick={pay} disabled={paying || !payAmount}>
                {paying ? 'Processing…' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {sales.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Sales</span></div>
          <div className="table-wrap" style={{ margin: 0, borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s: any) => {
                  const status = s.rejected ? 'rejected' : s.aproved ? 'approved' : 'pending';
                  return (
                    <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/sales/${s.id}`)}>
                      <td className="text-muted text-sm">
                        {new Date(s.date_sold).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short',
                        })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.product_name}</td>
                      <td>{s.quantity_sold}</td>
                      <td style={{ fontWeight: 800 }}>{fmt(s.total_amount)}</td>
                      <td><span className={`badge status-${status}`}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
