import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userAPI, saleAPI } from '../lib/api';
import { usePermissions, useAuth } from '../lib/auth';

const ROLE_BADGES: Record<string, string> = {
  admin:      'status-approved',
  manager:    'status-accepted',
  sales:      'status-sent',
  accountant: 'status-sent',
  picker:     'status-pending',
  staff:      'status-draft',
};

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function UserDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin } = usePermissions();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!isAdmin) { nav('/'); return; }
    load();
  }, [id]);

  async function load() {
    try {
      const res = await userAPI.get(id!);
      setProfile(res.data);
      const sRes = await saleAPI.list();
      const all = sRes.data.results ?? sRes.data;
      setSales(all.filter((s: any) => s.created_by === Number(id)).slice(0, 10));
    } catch {}
    setLoading(false);
  }

  async function toggleActive() {
    setToggling(true);
    try {
      await userAPI.toggleActive(id!);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Failed');
    }
    setToggling(false);
  }

  async function deleteUser() {
    if (!confirm(`Delete user "${profile?.username}"? This cannot be undone.`)) return;
    try {
      await userAPI.delete(id!);
      nav('/users');
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Delete failed');
    }
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!profile) return <div className="empty-state"><div className="icon">👤</div>User not found</div>;

  const isSelf = me?.id === String(profile.id) || me?.id === profile.id;

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <div className="flex-center gap-8">
          <Link to={`/users/${id}/edit`} className="btn btn-ghost">Edit</Link>
          {!isSelf && (
            <>
              <button className="btn btn-ghost" onClick={toggleActive} disabled={toggling}>
                {profile.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={deleteUser}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">{profile.username}</span>
          <div className="flex-center gap-8">
            <span className={`badge ${ROLE_BADGES[profile.role] ?? 'status-draft'}`}>{profile.role}</span>
            <span className={`badge status-${profile.is_active ? 'active' : 'inactive'}`}>
              {profile.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">First Name</div>
            <div className="detail-value">{profile.firstname || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Last Name</div>
            <div className="detail-value">{profile.lastname || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{profile.email || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Mobile</div>
            <div className="detail-value">{profile.mobile || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Gender</div>
            <div className="detail-value">{profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : '—'}</div>
          </div>
        </div>
        {profile.allowed_sections?.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Access Sections</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.allowed_sections.map((s: string) => (
                <span key={s} className="badge status-sent" style={{ textTransform: 'capitalize' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

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
                        {new Date(s.date_sold).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
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
