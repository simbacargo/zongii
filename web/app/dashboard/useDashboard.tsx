import { useState, useEffect, useCallback } from 'react';
import {
  getOverview,
  getSalesTrend,
  getSalesBreakdown,
  getInventoryHealth,
  getInventoryValuation,
  getTopProducts,
  getTopCustomers,
  getCustomerBalances,
  getRecentActivity,
} from './dashboardEndpoints';

function getDateRange(period) {
  const end = new Date();
  const start = new Date();
  const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  start.setDate(start.getDate() - (days[period] || 30));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function getTrendPeriod(range) {
  if (range === '7d') return 'daily';
  if (range === '1y') return 'monthly';
  return 'weekly';
}

export function useDashboard(period = '30d', businessId = null) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const dateParams = getDateRange(period);
    const baseParams = {
      ...dateParams,
      ...(businessId ? { business: businessId } : {}),
    };

    const fetchers = {
      overview: () => getOverview(baseParams),
      trend: () => getSalesTrend({ ...baseParams, period: getTrendPeriod(period) }),
      breakdown: () => getSalesBreakdown(baseParams),
      health: () => getInventoryHealth(baseParams),
      valuation: () => getInventoryValuation(baseParams),
      topProducts: () => getTopProducts({ ...baseParams, limit: 8 }),
      topCustomers: () => getTopCustomers({ ...baseParams, limit: 8 }),
      balances: () => getCustomerBalances({ limit: 10 }),
      activity: () => getRecentActivity({ ...baseParams, limit: 10 }),
    };

    const results = {};
    const errs = {};

    await Promise.all(
      Object.entries(fetchers).map(async ([key, fn]) => {
        try {
          results[key] = await fn();
        } catch (e) {
          errs[key] = e.message;
          results[key] = null;
        }
      })
    );

    setData(results);
    setErrors(errs);
    setLoading(false);
  }, [period, businessId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, errors, refetch: fetchAll };
}
