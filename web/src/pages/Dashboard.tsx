import { useEffect, useState } from 'react';
import { dashboardAPI } from '../lib/api';

const fmt = (n: number) =>
  n >= 1_000_000 ? `TZS ${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `TZS ${(n / 1_000).toFixed(0)}K`
  : `TZS ${n.toLocaleString()}`;

interface DashData {
  revenue?: number;
  profit?: number;
  total_sales_count?: number;
  pending_count?: number;
  low_stock_count?: number;
  total_debt?: number;
  top_products?: { id: number; name: string; total_sold: number; total_revenue: number }[];
  chart_labels?: string[];
  chart_revenue?: number[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashData>({});
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  async function load(p = period) {
    setLoading(true);
    try {
      const res = await dashboardAPI.get(p);
      setData(res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const maxRev = Math.max(...(data.chart_revenue ?? [0]), 1);

  return (
    <div>
      <div className="flex-between mb-20">
        <div className="pill-filters" style={{ margin: 0 }}>
          {(['week', 'month'] as const).map(p => (
            <button
              key={p}
              className={`pill${period === p ? ' active' : ''}`}
              onClick={() => { setPeriod(p); load(p); }}
            >
              {p === 'week' ? 'Last 7 Days' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><div className="page-loader-inner" /></div>
      ) : (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">💰</div>
              <div className="kpi-label">Revenue</div>
              <div className="kpi-value text-primary">{fmt(Number(data.revenue ?? 0))}</div>
              <div className="kpi-sub">{data.total_sales_count ?? 0} sales</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">📈</div>
              <div className="kpi-label">Net Profit</div>
              <div className="kpi-value text-green">{fmt(Number(data.profit ?? 0))}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">⏳</div>
              <div className="kpi-label">Pending</div>
              <div className="kpi-value" style={{ color: (data.pending_count ?? 0) > 0 ? 'var(--amber)' : 'var(--text)' }}>
                {data.pending_count ?? 0}
              </div>
              <div className="kpi-sub">Awaiting approval</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">⚠️</div>
              <div className="kpi-label">Low Stock</div>
              <div className="kpi-value" style={{ color: (data.low_stock_count ?? 0) > 0 ? 'var(--red)' : 'var(--text)' }}>
                {data.low_stock_count ?? 0}
              </div>
              <div className="kpi-sub">Products to reorder</div>
            </div>
            {Number(data.total_debt) > 0 && (
              <div className="kpi-card" style={{ borderColor: 'var(--amber)', background: 'var(--amber-light)' }}>
                <div className="kpi-icon">💳</div>
                <div className="kpi-label" style={{ color: 'var(--amber)' }}>Outstanding Debt</div>
                <div className="kpi-value" style={{ color: 'var(--amber)' }}>{fmt(Number(data.total_debt))}</div>
              </div>
            )}
          </div>

          {(data.chart_labels?.length ?? 0) > 0 && (
            <div className="card mb-20">
              <div className="section-title">Revenue Trend</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100, overflowX: 'auto', paddingBottom: 4 }}>
                {data.chart_labels!.map((label, i) => {
                  const h = Math.round(((data.chart_revenue![i] ?? 0) / maxRev) * 100);
                  return (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 24 }}>
                      <div
                        title={`${label}: ${fmt(data.chart_revenue![i] ?? 0)}`}
                        style={{
                          width: 18, height: `${Math.max(h, 4)}%`,
                          background: 'var(--primary)', borderRadius: 4,
                          opacity: h > 0 ? 1 : 0.2,
                        }}
                      />
                      <span style={{ fontSize: 8, color: 'var(--faint)', whiteSpace: 'nowrap' }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(data.top_products?.length ?? 0) > 0 && (
            <div className="card">
              <div className="section-title">Top Products</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {data.top_products!.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < data.top_products!.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '10px 0', width: 32 }}>
                        <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 12 }}>#{i + 1}</span>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 700 }}>{p.name}</td>
                      <td style={{ padding: '10px 0', color: 'var(--muted)', fontSize: 12 }}>{p.total_sold} units</td>
                      <td style={{ padding: '10px 0', fontWeight: 800, textAlign: 'right' }}>{fmt(Number(p.total_revenue ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
