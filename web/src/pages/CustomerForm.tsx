import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerAPI } from '../lib/api';

export default function CustomerForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', email: '', phone: '', remaining_balance: '', debt_due_date: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      customerAPI.get(id!).then(r => {
        const c = r.data;
        setForm({
          name: c.name ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          remaining_balance: c.remaining_balance ?? '',
          debt_due_date: c.debt_due_date ?? '',
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      remaining_balance: form.remaining_balance || 0,
      debt_due_date: form.debt_due_date || null,
    };
    try {
      if (isEdit) {
        await customerAPI.update(id!, payload);
        nav(`/customers/${id}`);
      } else {
        const res = await customerAPI.create(payload);
        nav(`/customers/${res.data.id}`);
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
          {isEdit ? 'Edit Customer' : 'New Customer'}
        </h2>
      </div>

      {error && (
        <div className="card mb-16" style={{ borderColor: 'var(--red)', background: '#fff5f5' }}>
          <pre style={{ color: 'var(--red)', margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      <div className="card mb-16">
        <div style={{ padding: '16px', display: 'grid', gap: 12 }}>
          <div>
            <label className="form-label">Full Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Outstanding Balance (TZS)</label>
              <input className="input" type="number" min={0} value={form.remaining_balance} onChange={e => set('remaining_balance', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Debt Due Date</label>
              <input className="input" type="date" value={form.debt_due_date} onChange={e => set('debt_due_date', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: 15 }}
        onClick={save}
        disabled={saving}
      >
        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Customer'}
      </button>
    </div>
  );
}
