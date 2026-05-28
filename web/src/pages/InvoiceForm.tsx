import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI, productAPI, documentAPI } from '../lib/api';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

interface LineItem {
  description: string;
  unit: string;
  quantity: string;
  unit_price: string;
  product_id?: number | null;
}

function emptyLine(): LineItem {
  return { description: '', unit: 'PCS', quantity: '1', unit_price: '', product_id: null };
}

export default function InvoiceForm() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
    doc_type: 'invoice',
    customer: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    discount_percent: '0',
    notes: '',
    terms: '',
  });
  const [items, setItems] = useState<LineItem[]>([emptyLine()]);
  const [productSearch, setProductSearch] = useState<{ idx: number; q: string } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    customerAPI.list().then(r => setCustomers(r.data.results ?? r.data)).catch(() => {});
  }, []);

  function setFormField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function setItem(idx: number, field: keyof LineItem, value: string | number | null) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems(prev => [...prev, emptyLine()]);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function searchProduct(idx: number, q: string) {
    setProductSearch({ idx, q });
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await productAPI.list({ q });
      setSearchResults((res.data.results ?? res.data).slice(0, 8));
    } catch {}
  }

  function pickProduct(idx: number, p: any) {
    setItems(prev => prev.map((item, i) => i === idx
      ? { ...item, description: p.name, unit: p.unit_of_measure ?? 'PCS', unit_price: String(p.max_price ?? p.min_price ?? ''), product_id: p.id }
      : item
    ));
    setProductSearch(null);
    setSearchResults([]);
  }

  const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
  const discount = subtotal * (Number(form.discount_percent) || 0) / 100;
  const total = subtotal - discount;

  async function save() {
    if (!form.customer) { setError('Please select a customer.'); return; }
    const validItems = items.filter(i => i.description.trim());
    if (validItems.length === 0) { setError('Add at least one line item.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        doc_type: form.doc_type,
        customer: Number(form.customer),
        issue_date: form.issue_date,
        due_date: form.due_date || null,
        discount_percent: form.discount_percent || '0',
        notes: form.notes,
        terms: form.terms,
        items: validItems.map(i => ({
          description: i.description,
          unit: i.unit || 'PCS',
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          product: i.product_id ?? null,
        })),
      };
      const res = await documentAPI.create(payload);
      nav(`/invoices/${res.data.id}`);
    } catch (e: any) {
      const d = e?.response?.data;
      setError(typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d ?? 'Save failed'));
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>New Invoice / Quotation</h2>
      </div>

      {error && (
        <div className="card mb-16" style={{ borderColor: 'var(--red)', background: '#fff5f5' }}>
          <pre style={{ color: 'var(--red)', margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Document Info</span></div>
        <div style={{ padding: '16px', display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Type</label>
              <select className="input" value={form.doc_type} onChange={e => setFormField('doc_type', e.target.value)}>
                <option value="invoice">Invoice</option>
                <option value="quotation">Quotation</option>
              </select>
            </div>
            <div>
              <label className="form-label">Customer *</label>
              <select className="input" value={form.customer} onChange={e => setFormField('customer', e.target.value)}>
                <option value="">— Select customer —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Issue Date</label>
              <input className="input" type="date" value={form.issue_date} onChange={e => setFormField('issue_date', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Due Date</label>
              <input className="input" type="date" value={form.due_date} onChange={e => setFormField('due_date', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Discount (%)</label>
              <input className="input" type="number" min={0} max={100} value={form.discount_percent} onChange={e => setFormField('discount_percent', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="input" style={{ width: '100%', minHeight: 60 }} value={form.notes} onChange={e => setFormField('notes', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Terms & Conditions</label>
            <textarea className="input" style={{ width: '100%', minHeight: 60 }} value={form.terms} onChange={e => setFormField('terms', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">Line Items</span>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={addItem}>+ Add Item</button>
        </div>
        <div style={{ padding: '12px 16px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 120px 32px', gap: 8, alignItems: 'end' }}>
                <div>
                  <label className="form-label">Description</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      placeholder="Search product or type description…"
                      value={item.description}
                      onChange={e => {
                        setItem(idx, 'description', e.target.value);
                        searchProduct(idx, e.target.value);
                      }}
                    />
                    {productSearch?.idx === idx && searchResults.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, boxShadow: 'var(--shadow)' }}>
                        {searchResults.map(p => (
                          <div key={p.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }} onClick={() => pickProduct(idx, p)}>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ color: 'var(--muted)', fontSize: 11 }}>{p.brand} · {fmt(p.max_price)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <input className="input" value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Qty</label>
                  <input className="input" type="number" min={1} value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Unit Price</label>
                  <input className="input" type="number" min={0} value={item.unit_price} onChange={e => setItem(idx, 'unit_price', e.target.value)} />
                </div>
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-ghost" style={{ color: 'var(--red)', padding: '8px' }} onClick={() => removeItem(idx)}>✕</button>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                {fmt((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
          <div className="text-muted">Subtotal: {fmt(subtotal)}</div>
          {discount > 0 && <div className="text-muted">Discount ({form.discount_percent}%): −{fmt(discount)}</div>}
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Total: {fmt(total)}</div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: 15 }}
        onClick={save}
        disabled={saving}
      >
        {saving ? 'Creating…' : 'Create Document'}
      </button>
    </div>
  );
}
