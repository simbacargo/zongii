import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  me: () => api.get('/auth/me/'),
};

export const dashboardAPI = {
  get: (period: 'week' | 'month' = 'week') =>
    api.get(`/dashboard/?period=${period}`),
};

export const categoryAPI = {
  list: (q?: string) => api.get('/categories/', { params: q ? { q } : undefined }),
};

export const productAPI = {
  list:     (params?: { q?: string; low_stock?: boolean; category?: string }) =>
    api.get('/products/', { params }),
  get:      (id: number | string) => api.get(`/products/${id}/`),
  lowStock: () => api.get('/products/', { params: { low_stock: true } }),
  create:   (data: FormData | Record<string, unknown>) =>
    api.post('/products/', data),
  update:   (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/products/${id}/`, data),
  delete:   (id: number | string) => api.delete(`/products/${id}/`),
  refill:   (id: number | string, data: { quantity_added: number; notes?: string }) =>
    api.post(`/products/${id}/refill/`, data),
  refills:  (id: number | string) => api.get(`/products/${id}/refills/`),
};

export const customerAPI = {
  list:    (q?: string) => api.get('/customers/', { params: q ? { q } : undefined }),
  get:     (id: number | string) => api.get(`/customers/${id}/`),
  debtors: () => api.get('/customers/debtors/'),
  create:  (data: Record<string, unknown>) => api.post('/customers/', data),
  update:  (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/customers/${id}/`, data),
  delete:  (id: number | string) => api.delete(`/customers/${id}/`),
  pay:     (id: number | string, amount: number) =>
    api.post(`/customers/${id}/pay/`, { amount }),
};

export const saleAPI = {
  list:    (status?: string, q?: string) =>
    api.get('/sales/', { params: { ...(status ? { status } : {}), ...(q ? { q } : {}) } }),
  get:     (id: number | string) => api.get(`/sales/${id}/`),
  approve: (id: number | string) => api.post(`/sales/${id}/approve/`),
  reject:  (id: number | string) => api.post(`/sales/${id}/reject/`),
  delete:  (id: number | string) => api.delete(`/sales/${id}/`),
};

export const orderAPI = {
  list:     (params?: { status?: string; q?: string }) =>
    api.get('/orders/', { params }),
  get:      (id: number | string) => api.get(`/orders/${id}/`),
  create:   (data: Record<string, unknown>) => api.post('/orders/', data),
  verify:   (id: number | string, action: 'approve' | 'reject' | 're_pick', note?: string) =>
    api.post(`/orders/${id}/verify/`, { action, note: note || '' }),
  dispatch: (id: number | string) => api.post(`/orders/${id}/dispatch/`),
};

export const pickingAPI = {
  list:   (params?: { status?: string; mine?: boolean }) =>
    api.get('/picking/', { params }),
  get:    (id: number | string) => api.get(`/picking/${id}/`),
  accept: (id: number | string) => api.post(`/picking/${id}/accept/`),
  submit: (id: number | string, items: { id: number; picked_qty: number; notes?: string }[], notes?: string) =>
    api.post(`/picking/${id}/submit/`, { items, notes: notes || '' }),
};

export const documentAPI = {
  list:      (params?: { doc_type?: string; status?: string }) => {
    const { doc_type, ...rest } = params ?? {};
    return api.get('/documents/', { params: { ...(doc_type ? { type: doc_type } : {}), ...rest } });
  },
  get:       (id: number | string) => api.get(`/documents/${id}/`),
  create:    (data: Record<string, unknown>) => api.post('/documents/', data),
  update:    (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/documents/${id}/`, data),
  delete:    (id: number | string) => api.delete(`/documents/${id}/`),
  setStatus: (id: number | string, status: string) =>
    api.post(`/documents/${id}/status/`, { status }),
};

export const gatePassAPI = {
  get: (id: number | string) => api.get(`/gate-passes/${id}/`),
};

export const notificationAPI = {
  list:        () => api.get('/notifications/'),
  markRead:    (id: number | string) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
};

export const userAPI = {
  list:         (q?: string) => api.get('/users/', { params: q ? { q } : undefined }),
  get:          (id: number | string) => api.get(`/users/${id}/`),
  create:       (data: Record<string, unknown>) => api.post('/users/', data),
  update:       (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/users/${id}/`, data),
  delete:       (id: number | string) => api.delete(`/users/${id}/`),
  toggleActive: (id: number | string) => api.post(`/users/${id}/toggle-active/`),
  setRole:      (id: number | string, role: string, sections?: string[]) =>
    api.patch(`/users/${id}/set-role/`, { role, sections }),
};

export default api;
