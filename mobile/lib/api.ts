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
export const productAPI = {
  list:       (q?: string, params?: { category?: number; low_stock?: boolean }) =>
    api.get('/products/', { params: { ...(q ? { q } : {}), ...params } }),
  get:        (id: string | number) => api.get(`/products/${id}/`),
  create:     (data: object) => api.post('/products/', data),
  update:     (id: string | number, data: object) => api.patch(`/products/${id}/`, data),
  deactivate: (id: string | number) => api.post(`/products/${id}/deactivate/`),
  lowStock:   () => api.get('/products/low_stock/'),
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

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  list:   () => api.get('/users/'),
  create: (data: object) => api.post('/users/', data),
  update: (id: string, data: object) => api.patch(`/users/${id}/`, data),
  toggleActive: (id: string) => api.post(`/users/${id}/toggle_active/`),
  setRole: (id: string, role: string) => api.patch(`/users/${id}/set_role/`, { role }),
};

export default api;
