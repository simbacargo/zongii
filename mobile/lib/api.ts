import axios from 'axios';
import { API_BASE } from './constants';
import { Storage } from './storage';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: API_BASE });

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await Storage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: try refresh, else throw so AuthContext can log out
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await Storage.getRefresh();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          await Storage.setTokens(data.access, refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          await Storage.clear();
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  me: () => api.get('/auth/me/'),
  updateProfile: (data: object) => api.patch('/auth/me/', data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: (period: 'week' | 'month' = 'week') =>
    api.get(`/dashboard/?period=${period}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryAPI = {
  list: ()          => api.get('/categories/'),
  create: (name: string) => api.post('/categories/', { name }),
  update: (id: number, name: string) => api.patch(`/categories/${id}/`, { name }),
  delete: (id: number) => api.delete(`/categories/${id}/`),
};

// ── Products ──────────────────────────────────────────────────────────────────

function toFormData(data: Record<string, any>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach(item => fd.append(key, String(item)));
    } else if (value && typeof value === 'object' && value.uri) {
      fd.append(key, value as any);
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

export const productAPI = {
  list:       (q?: string, params?: { category?: number; low_stock?: boolean }) =>
    api.get('/products/', { params: { ...(q ? { q } : {}), ...params } }),
  get:        (id: string | number) => api.get(`/products/${id}/`),
  create:     (data: Record<string, any>) =>
    api.post('/products/', toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:     (id: string | number, data: Record<string, any>) =>
    api.patch(`/products/${id}/`, toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } }),
  deactivate: (id: string | number) => api.post(`/products/${id}/deactivate/`),
  lowStock:   () => api.get('/products/low-stock/'),
  refill:     (id: string | number, data: { quantity_added: number; notes?: string }) =>
    api.post(`/products/${id}/refill/`, data),
  refills:    (id: string | number) => api.get(`/products/${id}/refills/`),
};

// ── Customers ─────────────────────────────────────────────────────────────────
export const customerAPI = {
  list:    (q?: string) => api.get('/customers/', { params: q ? { q } : undefined }),
  get:     (id: string | number) => api.get(`/customers/${id}/`),
  create:  (data: object) => api.post('/customers/', data),
  update:  (id: string | number, data: object) => api.patch(`/customers/${id}/`, data),
  delete:  (id: string | number) => api.delete(`/customers/${id}/`),
  pay:     (id: string | number, amount: number) => api.post(`/customers/${id}/pay/`, { amount }),
  debtors: () => api.get('/customers/debtors/'),
};

// ── Sales ─────────────────────────────────────────────────────────────────────
export const saleAPI = {
  list:    (status?: 'pending' | 'approved' | 'rejected', customer?: string) =>
    api.get('/sales/', { params: { ...(status ? { status } : {}), ...(customer ? { customer } : {}) } }),
  get:     (id: string | number) => api.get(`/sales/${id}/`),
  create:  (data: object) => api.post('/sales/', data),
  approve: (id: string | number) => api.post(`/sales/${id}/approve/`),
  reject:  (id: string | number) => api.post(`/sales/${id}/reject/`),
  delete:  (id: string | number) => api.delete(`/sales/${id}/`),
};

// ── Documents (Invoices & Quotations) ────────────────────────────────────────
export const documentAPI = {
  list:         (params?: { doc_type?: 'invoice'|'quotation'; status?: string }) =>
    api.get('/documents/', { params }),
  get:          (id: string | number) => api.get(`/documents/${id}/`),
  create:       (data: object) => api.post('/documents/', data),
  update:       (id: string | number, data: object) => api.patch(`/documents/${id}/`, data),
  delete:       (id: string | number) => api.delete(`/documents/${id}/`),
  setStatus:    (id: string | number, status: string, note?: string) =>
    api.post(`/documents/${id}/status/`, { status, note }),
};

// ── Sale Orders ───────────────────────────────────────────────────────────────
export const orderAPI = {
  list:     (status?: string) => api.get('/orders/', { params: status ? { status } : undefined }),
  get:      (id: string | number) => api.get(`/orders/${id}/`),
  create:   (data: object) => api.post('/orders/', data),
  update:   (id: string | number, data: object) => api.patch(`/orders/${id}/`, data),
  delete:   (id: string | number) => api.delete(`/orders/${id}/`),
  verify:   (id: string | number) => api.post(`/orders/${id}/verify/`),
  dispatch: (id: string | number) => api.post(`/orders/${id}/dispatch/`),
};

// ── Picking Orders ────────────────────────────────────────────────────────────
export const pickingAPI = {
  list:   () => api.get('/picking/'),
  get:    (id: string | number) => api.get(`/picking/${id}/`),
  accept: (id: string | number) => api.post(`/picking/${id}/accept/`),
  submit: (id: string | number, items: { id: number; picked_qty: number }[]) =>
    api.post(`/picking/${id}/submit/`, { items }),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  list:        () => api.get('/notifications/'),
  markRead:    (id: string | number) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
};

// ── Push tokens ───────────────────────────────────────────────────────────────
export const pushTokenAPI = {
  register: (token: string) => api.post('/auth/push-token/', { token }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  list:         () => api.get('/users/'),
  create:       (data: object) => api.post('/users/', data),
  update:       (id: string, data: object) => api.patch(`/users/${id}/`, data),
  toggleActive: (id: string) => api.post(`/users/${id}/toggle-active/`),
  setRole:      (id: string, role: string) => api.patch(`/users/${id}/set-role/`, { role }),
};

export default api;
