import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../lib/api';
import { usePermissions } from '../lib/auth';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

export default function Products() {
  const nav = useNavigate();
  const { isAdmin } = usePermissions();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  async function load(query = q, lowStock = lowStockOnly) {
    setLoading(true);
    try {
      const res = await productAPI.list({ q: query || undefined, low_stock: lowStock || undefined });
      setProducts(res.data.results ?? res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="search-row">
        <input
          className="input"
          placeholder="Search products…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          disabled={lowStockOnly}
        />
        <button className="btn btn-primary" onClick={() => load()} disabled={lowStockOnly}>Search</button>
        {isAdmin && <Link to="/products/new" className="btn btn-success">+ New</Link>}
      </div>
      <div className="pill-filters">
        <button className={`pill${!lowStockOnly ? ' active' : ''}`} onClick={() => { setLowStockOnly(false); load(q, false); }}>All</button>
        <button className={`pill${lowStockOnly ? ' active' : ''}`} onClick={() => { setLowStockOnly(true); load(q, true); }}>⚠ Low Stock</button>
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state"><div className="icon">📦</div>No products found</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Part #</th>
                <th>Stock</th>
                <th>Min Price</th>
                <th>Max Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/products/${p.id}`)}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.description}</div>}
                  </td>
                  <td className="text-muted">{p.brand || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.part_number || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: p.available_stock <= (p.reorder_point ?? 5) ? 'var(--red)' : 'var(--text)' }}>
                      {p.available_stock}
                    </span>
                    <span className="text-faint text-xs"> / {p.reorder_point ?? 5}</span>
                  </td>
                  <td>{p.min_price != null ? fmt(p.min_price) : '—'}</td>
                  <td>{p.max_price != null ? fmt(p.max_price) : '—'}</td>
                  <td>
                    <span className={`badge status-${p.is_active ? 'active' : 'inactive'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
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
