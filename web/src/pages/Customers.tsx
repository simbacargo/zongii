import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerAPI } from '../lib/api';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function Customers() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [debtorsOnly, setDebtorsOnly] = useState(false);

  async function load(query = q, debtors = debtorsOnly) {
    setLoading(true);
    try {
      const res = debtors
        ? await customerAPI.debtors()
        : await customerAPI.list(query || undefined);
      setCustomers(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="search-row">
        <input
          className="input"
          placeholder="Search customers…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          disabled={debtorsOnly}
        />
        <button className="btn btn-primary" onClick={() => load()} disabled={debtorsOnly}>Search</button>
        <Link to="/customers/new" className="btn btn-success">+ New</Link>
      </div>
      <div className="pill-filters">
        <button className={`pill${!debtorsOnly ? ' active' : ''}`} onClick={() => { setDebtorsOnly(false); load(q, false); }}>All</button>
        <button className={`pill${debtorsOnly ? ' active' : ''}`} onClick={() => { setDebtorsOnly(true); load('', true); }}>💳 With Debt</button>
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : customers.length === 0 ? (
        <div className="empty-state"><div className="icon">👤</div>No customers found</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Debt Due</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/customers/${c.id}`)}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td className="text-muted">{c.phone || '—'}</td>
                  <td className="text-muted">{c.email || '—'}</td>
                  <td>
                    {Number(c.remaining_balance) > 0 ? (
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt(c.remaining_balance)}</span>
                    ) : (
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>Clear</span>
                    )}
                  </td>
                  <td className="text-muted text-sm">
                    {c.debt_due_date
                      ? new Date(c.debt_due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
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
