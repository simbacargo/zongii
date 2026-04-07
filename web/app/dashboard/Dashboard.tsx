import React, { useState } from 'react';
import { useDashboard } from './useDashboard';
import KPIGrid from './Kpigrid';
import RevenueTrend from './RevenueTrend';
import SalesBreakdown from './SalesBreakdown';
import InventoryHealth from './Inventoryhealth';
import StockValuation from './Stockvaluation';
import TopProducts from './Topproducts';
import TopCustomers from './Topcustomers';
import LowStockTable from './LowStockTable';
import { ActivityFeed, BalancesTable } from './ActivityAndBalances';
import { Card, Skeleton, ErrorState } from './Card';

const PERIODS = [
  { key: '7d',  label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: '1y',  label: '1 year' },
];

function PeriodFilter({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          style={{
            padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            background: value === p.key ? '#fff' : 'transparent',
            color: value === p.key ? '#0f172a' : '#64748b',
            boxShadow: value === p.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em',
      textTransform: 'uppercase', margin: '8px 0 12px',
    }}>
      {children}
    </div>
  );
}

function CardWithState({ title, loading, error, skeleton, children, style }) {
  return (
    <Card title={title} style={style}>
      {loading ? skeleton || <Skeleton /> : error ? <ErrorState message={error} /> : children}
    </Card>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState('30d');
  const { data, loading, errors, refetch } = useDashboard(period);

  const isLoading = (key) => loading;
  const hasError  = (key) => !loading && !!errors[key];

  return (
    <div style={{
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#f8fafc',
      minHeight: '100vh',
      padding: '28px 32px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Inventory Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            Real-time overview of sales, stock, and customers
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <PeriodFilter value={period} onChange={setPeriod} />
          <button
            onClick={refetch}
            style={{
              padding: '8px 14px', borderRadius: 9, border: '1px solid #e2e8f0',
              background: '#fff', fontSize: 12, fontWeight: 600, color: '#475569',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      <SectionLabel>Overview</SectionLabel>
      {loading
        ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={88} />)}
          </div>
        : <KPIGrid data={data.overview} />
      }

      {/* Sales Row */}
      <SectionLabel>Sales</SectionLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: 14,
        marginBottom: 14,
      }}>
        <CardWithState
          title="Revenue Trend"
          loading={loading}
          error={errors.trend}
          skeleton={<Skeleton height={290} />}
        >
          <RevenueTrend data={data.trend} />
        </CardWithState>

        <CardWithState
          title="Sales by Status"
          loading={loading}
          error={errors.breakdown}
          skeleton={<Skeleton height={290} />}
        >
          <SalesBreakdown data={data.breakdown} />
        </CardWithState>
      </div>

      {/* Inventory Row */}
      <SectionLabel>Inventory</SectionLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 14,
        marginBottom: 14,
      }}>
        <CardWithState
          title="Stock Health"
          loading={loading}
          error={errors.health}
          skeleton={<Skeleton height={270} />}
        >
          <InventoryHealth data={data.health} />
        </CardWithState>

        <CardWithState
          title="Valuation by Category"
          loading={loading}
          error={errors.valuation}
          skeleton={<Skeleton height={270} />}
        >
          <StockValuation data={data.valuation} />
        </CardWithState>

        <CardWithState
          title="Top Products by Revenue"
          loading={loading}
          error={errors.topProducts}
          skeleton={<Skeleton height={270} />}
        >
          <TopProducts data={data.topProducts} />
        </CardWithState>
      </div>

      {/* Low Stock + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: 14, marginBottom: 14 }}>
        <CardWithState
          title="Low Stock Alerts"
          loading={loading}
          error={errors.health}
          skeleton={<Skeleton height={260} />}
        >
          <LowStockTable data={data.health} />
        </CardWithState>

        <CardWithState
          title="Recent Activity"
          loading={loading}
          error={errors.activity}
          skeleton={<Skeleton height={260} />}
        >
          <ActivityFeed data={data.activity} />
        </CardWithState>
      </div>

      {/* Customers Row */}
      <SectionLabel>Customers</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: 14 }}>
        <CardWithState
          title="Top Customers by Spend"
          loading={loading}
          error={errors.topCustomers}
          skeleton={<Skeleton height={280} />}
        >
          <TopCustomers data={data.topCustomers} />
        </CardWithState>

        <CardWithState
          title="Outstanding Balances"
          loading={loading}
          error={errors.balances}
          skeleton={<Skeleton height={280} />}
        >
          <BalancesTable data={data.balances} />
        </CardWithState>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
