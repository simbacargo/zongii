import type {
  AuthTokens, User, DashboardData, Category, Product,
  Customer, Sale, SaleOrder, SaleOrderListItem,
  PickingOrder, GatePass, Document, Notification,
} from './types';

export const BASE_URL = 'http://127.0.0.1:8090/api';

// ── Token storage ─────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

export function setTokens(tokens: AuthTokens) {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, options, false);
    clearTokens();
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { const err = await res.json(); detail = err.detail || JSON.stringify(err); } catch { /* */ }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (username: string, password: string) =>
    apiFetch<AuthTokens>('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => apiFetch<User>('/auth/me/'),
  refresh: (refresh: string) =>
    apiFetch<{ access: string }>('/auth/refresh/', { method: 'POST', body: JSON.stringify({ refresh }) }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboard = {
  get: (period = '30d') => apiFetch<DashboardData>(`/dashboard/?period=${period}`),
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categories = {
  list: () => apiFetch<Category[]>('/categories/'),
  get: (id: number) => apiFetch<Category>(`/categories/${id}/`),
};

// ── Products ─────────────────────────────────────────────────────────────────

export const products = {
  list: (params = '') => apiFetch<Product[]>(`/products/${params}`),
  get: (id: number) => apiFetch<Product>(`/products/${id}/`),
  create: (data: FormData | Record<string, unknown>) =>
    apiFetch<Product>('/products/', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch<Product>(`/products/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deactivate: (id: number) => apiFetch(`/products/${id}/deactivate/`, { method: 'POST' }),
  lowStock: () => apiFetch<Product[]>('/products/low-stock/'),
  refill: (id: number, data: { quantity_added: number; notes?: string }) =>
    apiFetch(`/products/${id}/refill/`, { method: 'POST', body: JSON.stringify(data) }),
  refills: (id: number) => apiFetch(`/products/${id}/refills/`),
};

// ── Customers ─────────────────────────────────────────────────────────────────

export const customers = {
  list: (params = '') => apiFetch<Customer[]>(`/customers/${params}`),
  get: (id: number) => apiFetch<Customer>(`/customers/${id}/`),
  create: (data: Partial<Customer>) =>
    apiFetch<Customer>('/customers/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Customer>) =>
    apiFetch<Customer>(`/customers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  debtors: () => apiFetch<Customer[]>('/customers/debtors/'),
  pay: (id: number, data: { amount: number }) =>
    apiFetch(`/customers/${id}/pay/`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Sales ─────────────────────────────────────────────────────────────────────

export const sales = {
  list: (params = '') => apiFetch<Sale[]>(`/sales/${params}`),
  get: (id: number) => apiFetch<Sale>(`/sales/${id}/`),
  approve: (id: number) => apiFetch(`/sales/${id}/approve/`, { method: 'POST' }),
  reject: (id: number) => apiFetch(`/sales/${id}/reject/`, { method: 'POST' }),
};

// ── Sale Orders ───────────────────────────────────────────────────────────────

export const orders = {
  list: (params = '') => apiFetch<SaleOrderListItem[]>(`/orders/${params}`),
  get: (id: number) => apiFetch<SaleOrder>(`/orders/${id}/`),
  accountantReview: (id: number, action: 'approve' | 'reject', note = '') =>
    apiFetch(`/orders/${id}/accountant-review/`, { method: 'POST', body: JSON.stringify({ action, note }) }),
  verify: (id: number, action: 'approve' | 'reject' | 're_pick', note = '') =>
    apiFetch(`/orders/${id}/verify/`, { method: 'POST', body: JSON.stringify({ action, note }) }),
  dispatch: (id: number) => apiFetch(`/orders/${id}/dispatch/`, { method: 'POST' }),
};

// ── Picking ───────────────────────────────────────────────────────────────────

export const picking = {
  list: (params = '') => apiFetch<PickingOrder[]>(`/picking/${params}`),
  get: (id: number) => apiFetch<PickingOrder>(`/picking/${id}/`),
  accept: (id: number) => apiFetch(`/picking/${id}/accept/`, { method: 'POST' }),
  submit: (id: number, items: { id: number; picked_qty: number; notes?: string }[]) =>
    apiFetch(`/picking/${id}/submit/`, { method: 'POST', body: JSON.stringify({ items }) }),
};

// ── Gate Passes ───────────────────────────────────────────────────────────────

export const gatePasses = {
  list: (params = '') => apiFetch<GatePass[]>(`/gate-passes/${params}`),
  get: (id: number) => apiFetch<GatePass>(`/gate-passes/${id}/`),
};

// ── Documents ─────────────────────────────────────────────────────────────────

export const documents = {
  list: (params = '') => apiFetch<Document[]>(`/documents/${params}`),
  get: (id: number) => apiFetch<Document>(`/documents/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiFetch<Document>('/documents/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch<Document>(`/documents/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  setStatus: (id: number, status: string) =>
    apiFetch(`/documents/${id}/status/`, { method: 'POST', body: JSON.stringify({ status }) }),
  delete: (id: number) => apiFetch(`/documents/${id}/`, { method: 'DELETE' }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications = {
  list: () => apiFetch<Notification[]>('/notifications/'),
  markRead: (id: number) => apiFetch(`/notifications/${id}/read/`, { method: 'POST' }),
  markAllRead: () => apiFetch('/notifications/mark-all-read/', { method: 'POST' }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = {
  list: (params = '') => apiFetch<User[]>(`/users/${params}`),
  get: (id: string) => apiFetch<User>(`/users/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiFetch<User>('/users/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<User>(`/users/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleActive: (id: string) => apiFetch(`/users/${id}/toggle-active/`, { method: 'POST' }),
  setRole: (id: string, role: string, sections?: string[]) =>
    apiFetch(`/users/${id}/set-role/`, { method: 'POST', body: JSON.stringify({ role, sections }) }),
};
