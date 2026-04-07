const BASE_URL = 'http://127.0.0.1:8080/api/dashboard';

async function apiFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });


const defaultHeaders = {
  'Content-Type': 'application/json',
  "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
};

const res = await fetch(url.toString(), {
    credentials: 'include',
    headers: defaultHeaders,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data;
}

export function getOverview(params:any) {
  return apiFetch('/overview/', params);
}

export function getSalesTrend(params:any) {
  return apiFetch('/sales/trend/', params);
}

export function getSalesBreakdown(params:any) {
  return apiFetch('/sales/breakdown/', params);
}

export function getInventoryHealth(params:any) {
  return apiFetch('/inventory/health/', params);
}

export function getInventoryValuation(params:any) {
  return apiFetch('/inventory/valuation/', params);
}

export function getTopProducts(params:any) {
  return apiFetch('/products/top/', params);
}

export function getTopCustomers(params:any) {
  return apiFetch('/customers/top/', params);
}

export function getCustomerBalances(params:any) {
  return apiFetch('/customers/balances/', params);
}

export function getRecentActivity(params:any) {
  return apiFetch('/activity/recent/', params);
}
