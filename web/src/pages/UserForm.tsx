import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const ROLES = ['staff', 'sales', 'accountant', 'picker', 'manager', 'admin'] as const;

const ROLE_SECTIONS: Record<string, string[]> = {
  staff:      ['dashboard', 'sales', 'orders', 'customers'],
  sales:      ['dashboard', 'inventory', 'sales', 'orders', 'customers'],
  accountant: ['dashboard', 'sales', 'billing'],
  picker:     ['dashboard', 'orders'],
  manager:    ['dashboard', 'inventory', 'sales', 'orders', 'customers', 'billing'],
  admin:      ['dashboard', 'inventory', 'sales', 'orders', 'customers', 'billing', 'users'],
};

const ALL_SECTIONS = [
  { key: 'dashboard',  label: 'Dashboard' },
  { key: 'inventory',  label: 'Inventory & Products' },
  { key: 'sales',      label: 'Sales' },
  { key: 'orders',     label: 'Warehouse Orders' },
  { key: 'customers',  label: 'Customers' },
  { key: 'billing',    label: 'Invoices & Billing' },
  { key: 'users',      label: 'User Management' },
];

export default function UserForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin } = usePermissions();
  const isEdit = !!id;

  const [form, setForm] = useState({
    username: '', firstname: '', lastname: '',
    email: '', mobile: '', gender: 'M',
    password: '', role: 'staff' as typeof ROLES[number],
    is_active: true, sections: ROLE_SECTIONS['staff'],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) { nav('/'); return; }
    if (isEdit) {
      userAPI.get(id!).then(r => {
        const u = r.data;
        setForm(prev => ({
          ...prev,
          username: u.username ?? '',
          firstname: u.firstname ?? '',
          lastname: u.lastname ?? '',
          email: u.email ?? '',
          mobile: u.mobile ?? '',
          gender: u.gender ?? 'M',
          role: u.role ?? 'staff',
          is_active: u.is_active ?? true,
          sections: u.allowed_sections ?? ROLE_SECTIONS[u.role ?? 'staff'] ?? [],
        }));
      }).finally(() => setLoading(false));
    }
  }, [id]);

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function setRole(role: typeof ROLES[number]) {
    setForm(prev => ({ ...prev, role, sections: ROLE_SECTIONS[role] ?? [] }));
  }

  function toggleSection(key: string) {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.includes(key)
        ? prev.sections.filter(s => s !== key)
        : [...prev.sections, key],
    }));
  }

  async function save() {
    if (!form.username.trim()) { setError('Username is required.'); return; }
    if (!isEdit && form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {
      username: form.username,
      firstname: form.firstname,
      lastname: form.lastname,
      email: form.email || null,
      mobile: form.mobile,
      gender: form.gender,
      role: form.role,
      is_active: form.is_active,
      allowed_sections: form.sections,
    };
    if (!isEdit || form.password) payload.password = form.password;

    try {
      if (isEdit) {
        await userAPI.update(id!, payload);
        if (form.role) await userAPI.setRole(id!, form.role, form.sections);
        nav(`/users/${id}`);
      } else {
        const res = await userAPI.create(payload);
        nav(`/users/${res.data.id}`);
      }
    } catch (e: any) {
      const d = e?.response?.data;
      setError(typeof d === 'object' ? Object.entries(d).map(([k, v]) => `${k}: ${v}`).join('\n') : String(d ?? 'Save failed'));
    }
    setSaving(false);
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
          {isEdit ? 'Edit User' : 'New User'}
        </h2>
      </div>

      {error && (
        <div className="card mb-16" style={{ borderColor: 'var(--red)', background: '#fff5f5' }}>
          <pre style={{ color: 'var(--red)', margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Account Info</span></div>
        <div style={{ padding: '16px', display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Username *</label>
              <input className="input" value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
            <div>
              <label className="form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">First Name</label>
              <input className="input" value={form.firstname} onChange={e => set('firstname', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input className="input" value={form.lastname} onChange={e => set('lastname', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Mobile</label>
              <input className="input" type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
            Active account
          </label>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Role</span></div>
        <div style={{ padding: '16px' }}>
          <div className="pill-filters">
            {ROLES.map(r => (
              <button key={r} className={`pill${form.role === r ? ' active' : ''}`} onClick={() => setRole(r)}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Section Access</span></div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ALL_SECTIONS.map(s => (
            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.sections.includes(s.key)}
                onChange={() => toggleSection(s.key)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: 15 }}
        onClick={save}
        disabled={saving}
      >
        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
      </button>
    </div>
  );
}
