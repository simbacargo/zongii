import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, customerAPI, orderAPI } from '../lib/api';

const fmt = (n: unknown) => `TZS ${Number(n ?? 0).toLocaleString()}`;

interface CartItem {
  product: any;
  qty: number;
  price: number;
}

export default function SaleForm() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productQ, setProductQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    customerAPI.list().then(r => setCustomers(r.data.results ?? r.data)).catch(() => {});
  }, []);

  async function searchProducts() {
    if (!productQ.trim()) return;
    setSearching(true);
    try {
      const res = await productAPI.list({ q: productQ });
      setSearchResults(res.data.results ?? res.data);
    } catch {}
    setSearching(false);
  }

  function addToCart(product: any) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      const price = Number(product.max_price ?? product.min_price ?? 0);
      return [...prev, { product, qty: 1, price }];
    });
    setSearchResults([]);
    setProductQ('');
  }

  function removeFromCart(productId: number) {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));
  }

  function updatePrice(productId: number, price: number) {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, price } : i));
  }

  const grandTotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  async function submit() {
    if (cart.length === 0) { setError('Add at least one product.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const items = cart.map(i => ({
        product: i.product.id,
        quantity_sold: i.qty,
        price_per_unit: i.price,
      }));
      const res = await orderAPI.create({
        customer: customerId || null,
        notes,
        items,
      });
      nav(`/orders/${res.data.id}`);
    } catch (e: any) {
      const data = e?.response?.data;
      setError(typeof data === 'string' ? data : JSON.stringify(data ?? 'Failed to create order'));
    }
    setSubmitting(false);
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <button className="btn btn-ghost" onClick={() => nav(-1)}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>New Sale Order</h2>
      </div>

      {error && (
        <div className="card mb-16" style={{ borderColor: 'var(--red)', background: '#fff5f5' }}>
          <p style={{ color: 'var(--red)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Customer */}
      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Customer</span></div>
        <div style={{ padding: '12px 16px' }}>
          <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">— Cash / Walk-in —</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Search */}
      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Add Products</span></div>
        <div style={{ padding: '12px 16px' }}>
          <div className="search-row">
            <input
              className="input"
              placeholder="Search product by name, brand, part #…"
              value={productQ}
              onChange={e => setProductQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchProducts()}
            />
            <button className="btn btn-primary" onClick={searchProducts} disabled={searching}>Search</button>
          </div>
          {searchResults.length > 0 && (
            <div className="card" style={{ marginTop: 8, padding: 0, overflow: 'hidden' }}>
              {searchResults.map(p => (
                <div
                  key={p.id}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  onClick={() => addToCart(p)}
                >
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {p.brand} · {p.part_number} · Stock: {p.available_stock} · {fmt(p.max_price ?? p.min_price)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</span></div>
          <div className="table-wrap" style={{ margin: 0, borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Qty</th>
                  <th>Price/Unit</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.product.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.product.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.product.brand}</div>
                    </td>
                    <td className="text-muted">{item.product.available_stock}</td>
                    <td>
                      <input
                        type="number"
                        className="input"
                        style={{ width: 70 }}
                        min={1}
                        max={item.product.available_stock}
                        value={item.qty}
                        onChange={e => updateQty(item.product.id, Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input"
                        style={{ width: 110 }}
                        min={0}
                        value={item.price}
                        onChange={e => updatePrice(item.product.id, Number(e.target.value))}
                      />
                    </td>
                    <td style={{ fontWeight: 800 }}>{fmt(item.qty * item.price)}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ color: 'var(--red)', padding: '4px 8px' }}
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 800 }}>Grand Total</td>
                  <td style={{ fontWeight: 800, fontSize: 16 }}>{fmt(grandTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Notes</span></div>
        <div style={{ padding: '12px 16px' }}>
          <textarea
            className="input"
            style={{ width: '100%', minHeight: 80 }}
            placeholder="Order notes…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: 15 }}
        onClick={submit}
        disabled={submitting || cart.length === 0}
      >
        {submitting ? 'Creating…' : 'Create Order →'}
      </button>
    </div>
  );
}
