import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../lib/api';

const MATERIALS = ['PVC', 'CPVC', 'PEX', 'COPPER', 'BRASS', 'STAINLESS', 'ABS'];
const UOMS = ['UNIT', 'FT', 'RL', 'BX'];

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', brand: '', part_number: '', upc_code: '',
    description: '', material: '', unit_of_measure: 'UNIT',
    buying_price: '', wholesale_price: '', min_price: '', max_price: '',
    tax_rate: '0', quantity_at_hand: '0', reorder_point: '10',
    weight: '', bin_location: '', is_lead_free: false, is_active: true,
    category_ids: [] as number[],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryAPI.list().then(r => setCategories(r.data.results ?? r.data)).catch(() => {});
    if (isEdit) {
      productAPI.get(id!).then(r => {
        const p = r.data;
        setForm({
          name: p.name ?? '',
          brand: p.brand ?? '',
          part_number: p.part_number ?? '',
          upc_code: p.upc_code ?? '',
          description: p.description ?? '',
          material: p.material ?? '',
          unit_of_measure: p.unit_of_measure ?? 'UNIT',
          buying_price: p.buying_price ?? '',
          wholesale_price: p.wholesale_price ?? '',
          min_price: p.min_price ?? '',
          max_price: p.max_price ?? '',
          tax_rate: p.tax_rate ?? '0',
          quantity_at_hand: p.quantity_at_hand ?? '0',
          reorder_point: p.reorder_point ?? '10',
          weight: p.weight ?? '',
          bin_location: p.bin_location ?? '',
          is_lead_free: p.is_lead_free ?? false,
          is_active: p.is_active ?? true,
          category_ids: (p.categories ?? []).map((c: any) => c.id ?? c),
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleCategory(catId: number) {
    setForm(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter(c => c !== catId)
        : [...prev.category_ids, catId],
    }));
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    const payload: Record<string, unknown> = {
      name: form.name,
      brand: form.brand,
      part_number: form.part_number,
      upc_code: form.upc_code,
      description: form.description,
      material: form.material,
      unit_of_measure: form.unit_of_measure,
      tax_rate: form.tax_rate || 0,
      quantity_at_hand: form.quantity_at_hand || 0,
      reorder_point: form.reorder_point || 10,
      is_lead_free: form.is_lead_free,
      is_active: form.is_active,
      category_ids: form.category_ids,
    };
    if (form.buying_price) payload.buying_price = form.buying_price;
    if (form.wholesale_price) payload.wholesale_price = form.wholesale_price;
    if (form.min_price) payload.min_price = form.min_price;
    if (form.max_price) payload.max_price = form.max_price;
    if (form.weight) payload.weight = form.weight;
    if (form.bin_location) payload.bin_location = form.bin_location;

    try {
      if (isEdit) {
        await productAPI.update(id!, payload);
        nav(`/products/${id}`);
      } else {
        const res = await productAPI.create(payload);
        nav(`/products/${res.data.id}`);
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
          {isEdit ? 'Edit Product' : 'New Product'}
        </h2>
      </div>

      {error && (
        <div className="card mb-16" style={{ borderColor: 'var(--red)', background: '#fff5f5' }}>
          <pre style={{ color: 'var(--red)', margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Basic Info</span></div>
        <div style={{ padding: '16px', display: 'grid', gap: 12 }}>
          <div>
            <label className="form-label">Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Brand</label>
              <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Part Number</label>
              <input className="input" value={form.part_number} onChange={e => set('part_number', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">UPC Code</label>
              <input className="input" value={form.upc_code} onChange={e => set('upc_code', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bin Location</label>
              <input className="input" value={form.bin_location} onChange={e => set('bin_location', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="input" style={{ minHeight: 70, width: '100%' }} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Material & UOM</span></div>
        <div style={{ padding: '16px' }}>
          <label className="form-label">Material</label>
          <div className="pill-filters" style={{ marginBottom: 16 }}>
            <button className={`pill${!form.material ? ' active' : ''}`} onClick={() => set('material', '')}>None</button>
            {MATERIALS.map(m => (
              <button key={m} className={`pill${form.material === m ? ' active' : ''}`} onClick={() => set('material', m)}>{m}</button>
            ))}
          </div>
          <label className="form-label">Unit of Measure</label>
          <div className="pill-filters">
            {UOMS.map(u => (
              <button key={u} className={`pill${form.unit_of_measure === u ? ' active' : ''}`} onClick={() => set('unit_of_measure', u)}>{u}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Pricing</span></div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="form-label">Buying Price</label>
            <input className="input" type="number" min={0} value={form.buying_price} onChange={e => set('buying_price', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Wholesale Price</label>
            <input className="input" type="number" min={0} value={form.wholesale_price} onChange={e => set('wholesale_price', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Min Price</label>
            <input className="input" type="number" min={0} value={form.min_price} onChange={e => set('min_price', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Max Price</label>
            <input className="input" type="number" min={0} value={form.max_price} onChange={e => set('max_price', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tax Rate (%)</label>
            <input className="input" type="number" min={0} max={100} value={form.tax_rate} onChange={e => set('tax_rate', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Stock</span></div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label className="form-label">Qty on Hand</label>
            <input className="input" type="number" min={0} value={form.quantity_at_hand} onChange={e => set('quantity_at_hand', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Reorder Point</label>
            <input className="input" type="number" min={0} value={form.reorder_point} onChange={e => set('reorder_point', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Weight (kg)</label>
            <input className="input" type="number" min={0} step={0.01} value={form.weight} onChange={e => set('weight', e.target.value)} />
          </div>
        </div>
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_lead_free} onChange={e => set('is_lead_free', e.target.checked)} />
            Lead-free
          </label>
          {isEdit && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
              Active
            </label>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Categories</span></div>
          <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c: any) => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 20, background: form.category_ids.includes(c.id) ? 'var(--accent)' : 'transparent', color: form.category_ids.includes(c.id) ? '#fff' : 'inherit' }}>
                <input type="checkbox" style={{ display: 'none' }} checked={form.category_ids.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: 15 }}
        onClick={save}
        disabled={saving}
      >
        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
      </button>
    </div>
  );
}
