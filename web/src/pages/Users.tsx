import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const ROLE_BADGES: Record<string, string> = {
  admin:      'status-approved',
  manager:    'status-accepted',
  sales:      'status-sent',
  accountant: 'status-sent',
  picker:     'status-pending',
  staff:      'status-draft',
};

export default function Users() {
  const nav = useNavigate();
  const { isAdmin } = usePermissions();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!isAdmin) { nav('/'); return; }
    load();
  }, []);

  async function load(query = q) {
    setLoading(true);
    try {
      const res = await userAPI.list(query || undefined);
      setUsers(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="search-row" style={{ flex: 1, marginRight: 12 }}>
          <input
            className="input"
            placeholder="Search users…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(q)}
          />
          <button className="btn btn-primary" onClick={() => load(q)}>Search</button>
        </div>
        <Link to="/users/new" className="btn btn-success">+ New User</Link>
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state"><div className="icon">👤</div>No users found</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    <Link to={`/users/${u.id}`}>{u.username}</Link>
                  </td>
                  <td>{[u.firstname, u.lastname].filter(Boolean).join(' ') || '—'}</td>
                  <td className="text-muted text-sm">{u.email || '—'}</td>
                  <td>
                    <span className={`badge ${ROLE_BADGES[u.role] ?? 'status-draft'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/users/${u.id}/edit`} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                      Edit
                    </Link>
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
