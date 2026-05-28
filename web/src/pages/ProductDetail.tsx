import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin } = usePermissions();
  const [product, setProduct] = useState<any>(null);
  const [refills, setRefills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refillQty, setRefillQty] = useState('');
  const [refillNotes, setRefillNotes] = useState('');
  const [refilling, setRefilling] = useState(false);

  async function load() {
    try {
      const [pRes, rRes] = await Promise.all([productAPI.get(id!), productAPI.refills(id!)]);
      setProduct(pRes.data);
      setRefills(rRes.data.results ?? rRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function doRefill() {
    const qty = Number(refillQty);
    if (!qty || qty <= 0) return;
    setRefilling(true);
    try {
      await productAPI.refill(id!, { quantity_added: qty, notes: refillNotes });
      setRefillQty('');
      setRefillNotes('');
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Refill failed');
    }
    setRefilling(false);
  }

  async function deactivate() {
    if (!confirm('Deactivate this product?')) return;
    try {
      await productAPI.delete(id!);
      nav('/products');
    } catch {}
  }

  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!product) return <div className="empty-state"><div className="icon">🔩</div>Product not found</div>;

  const stockRatio = product.reorder_point > 0
    ? (product.available_stock / Math.max(product.available_stock, product.reorder_point * 3))
    : 1;
  const stockColor = product.available_stock === 0 ? 'var(--red)' :
    product.available_stock <= product.reorder_point ? 'var(--orange)' : 'var(--green)';

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <div className="flex-center gap-8">
          {isAdmin && (
            <>
              <Link to={`/products/${id}/edit`} className="btn btn-ghost">Edit</Link>
              <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={deactivate}>
                Deactivate
              </button>
            </>
          )}
          <span className={`badge status-${product.is_active ? 'active' : 'inactive'}`}>
            {product.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">{product.name}</span>
          {product.brand && <span className="text-muted">{product.brand}</span>}
        </div>

        {/* Stock gauge */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>Stock</span>
            <span style={{ fontWeight: 800, color: stockColor }}>
              {product.available_stock} / reorder at {product.reorder_point}
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, stockRatio * 100)}%`,
              background: stockColor,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Part Number</div>
            <div className="detail-value" style={{ fontFamily: 'monospace' }}>{product.part_number || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">UPC Code</div>
            <div className="detail-value" style={{ fontFamily: 'monospace' }}>{product.upc_code || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Material</div>
            <div className="detail-value">{product.material || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Unit of Measure</div>
            <div className="detail-value">{product.unit_of_measure || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Bin Location</div>
            <div className="detail-value">{product.bin_location || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Lead-free</div>
            <div className="detail-value">{product.is_lead_free ? '✓ Yes' : '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Weight</div>
            <div className="detail-value">{product.weight ? `${product.weight} kg` : '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Tax Rate</div>
            <div className="detail-value">{product.tax_rate != null ? `${product.tax_rate}%` : '—'}</div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Pricing</div>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Buying Price</div>
              <div className="detail-value">{product.buying_price != null ? fmt(product.buying_price) : '—'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Wholesale Price</div>
              <div className="detail-value">{product.wholesale_price != null ? fmt(product.wholesale_price) : '—'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Min Price</div>
              <div className="detail-value">{product.min_price != null ? fmt(product.min_price) : '—'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Max Price</div>
              <div className="detail-value">{product.max_price != null ? fmt(product.max_price) : '—'}</div>
            </div>
          </div>
        </div>

        {product.description && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13 }}>
            {product.description}
          </div>
        )}
      </div>

      {/* Refill */}
      {isAdmin && (
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Add Stock</span></div>
          <div style={{ padding: '12px 16px' }}>
            <div className="search-row">
              <input
                className="input"
                type="number"
                placeholder="Quantity to add"
                min={1}
                value={refillQty}
                onChange={e => setRefillQty(e.target.value)}
              />
              <input
                className="input"
                placeholder="Notes (optional)"
                value={refillNotes}
                onChange={e => setRefillNotes(e.target.value)}
              />
              <button className="btn btn-success" onClick={doRefill} disabled={refilling || !refillQty}>
                {refilling ? 'Adding…' : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refill History */}
      {refills.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Stock History</span></div>
          <div className="table-wrap" style={{ margin: 0, borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Added</th>
                  <th>Total After</th>
                  <th>By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {refills.map((r: any) => (
                  <tr key={r.id}>
                    <td className="text-muted text-sm">
                      {new Date(r.refilled_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--green)' }}>+{r.quantity_added}</td>
                    <td>{r.quantity_after}</td>
                    <td className="text-muted">{r.refilled_by_name || '—'}</td>
                    <td className="text-muted text-sm">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
