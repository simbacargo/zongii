import type {
  AuthTokens, User, DashboardData, Category, Product,
  Customer, Sale, SaleOrder, SaleOrderListItem,
  PickingOrder, GatePass, Document, Notification, StockRefill,
} from "../types";

export const BASE_URL = "/api";

export function getAccessToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(tokens: AuthTokens) {
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
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
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, options, false);
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || err.error || JSON.stringify(err);
    } catch { /* */ }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  login: (username: string, password: string) =>
    apiFetch<AuthTokens>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => apiFetch<User>("/auth/me/"),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboard = {
  get: (period = "week") => apiFetch<DashboardData>(`/dashboard/?period=${period}`),
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categories = {
  list: (q = "") => apiFetch<Category[]>(`/categories/${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  create: (name: string) =>
    apiFetch<Category>("/categories/", { method: "POST", body: JSON.stringify({ name }) }),
  update: (id: number, name: string) =>
    apiFetch<Category>(`/categories/${id}/`, { method: "PATCH", body: JSON.stringify({ name }) }),
  delete: (id: number) => apiFetch<void>(`/categories/${id}/`, { method: "DELETE" }),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const products = {
  list: (params = "") => apiFetch<Product[]>(`/products/${params}`),
  get: (id: number) => apiFetch<Product>(`/products/${id}/`),
  create: (data: FormData | Record<string, unknown>) =>
    apiFetch<Product>("/products/", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch<Product>(`/products/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deactivate: (id: number) =>
    apiFetch<void>(`/products/${id}/deactivate/`, { method: "POST" }),
  lowStock: () => apiFetch<Product[]>("/products/low-stock/"),
  refill: (id: number, data: { quantity_added: number; notes?: string }) =>
    apiFetch<StockRefill>(`/products/${id}/refill/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  refills: (id: number) => apiFetch<StockRefill[]>(`/products/${id}/refills/`),
};

// ── Customers ─────────────────────────────────────────────────────────────────

export const customers = {
  list: (q = "") => apiFetch<Customer[]>(`/customers/${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  get: (id: number) => apiFetch<Customer>(`/customers/${id}/`),
  create: (data: Partial<Customer>) =>
    apiFetch<Customer>("/customers/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Customer>) =>
    apiFetch<Customer>(`/customers/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  debtors: () =>
    apiFetch<{ total_debt: string; results: Customer[] }>("/customers/debtors/"),
  pay: (id: number, amount: number) =>
    apiFetch<Customer>(`/customers/${id}/pay/`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
};

// ── Sales ─────────────────────────────────────────────────────────────────────

export const sales = {
  list: (params = "") => apiFetch<Sale[]>(`/sales/${params}`),
  get: (id: number) => apiFetch<Sale>(`/sales/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiFetch<Sale>("/sales/", { method: "POST", body: JSON.stringify(data) }),
  approve: (id: number) => apiFetch<Sale>(`/sales/${id}/approve/`, { method: "POST" }),
  reject: (id: number) => apiFetch<Sale>(`/sales/${id}/reject/`, { method: "POST" }),
  delete: (id: number) => apiFetch<void>(`/sales/${id}/`, { method: "DELETE" }),
};

// ── Sale Orders ───────────────────────────────────────────────────────────────

export const orders = {
  list: (params = "") => apiFetch<SaleOrderListItem[]>(`/orders/${params}`),
  get: (id: number) => apiFetch<SaleOrder>(`/orders/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiFetch<SaleOrder>("/orders/", { method: "POST", body: JSON.stringify(data) }),
  accountantReview: (id: number, action: "approve" | "reject", note = "") =>
    apiFetch<SaleOrder>(`/orders/${id}/accountant-review/`, {
      method: "POST",
      body: JSON.stringify({ action, note }),
    }),
  verify: (id: number, action: "approve" | "reject" | "re_pick", note = "") =>
    apiFetch<SaleOrder>(`/orders/${id}/verify/`, {
      method: "POST",
      body: JSON.stringify({ action, note }),
    }),
  dispatch: (id: number) =>
    apiFetch<SaleOrder>(`/orders/${id}/dispatch/`, { method: "POST" }),
};

// ── Picking ───────────────────────────────────────────────────────────────────

export const picking = {
  list: (params = "") => apiFetch<PickingOrder[]>(`/picking/${params}`),
  get: (id: number) => apiFetch<PickingOrder>(`/picking/${id}/`),
  accept: (id: number) => apiFetch<PickingOrder>(`/picking/${id}/accept/`, { method: "POST" }),
  submit: (id: number, items: { id: number; picked_qty: number; notes?: string }[], notes = "") =>
    apiFetch<PickingOrder>(`/picking/${id}/submit/`, {
      method: "POST",
      body: JSON.stringify({ items, notes }),
    }),
};

// ── Gate Passes ───────────────────────────────────────────────────────────────

export const gatePasses = {
  list: (params = "") => apiFetch<GatePass[]>(`/gate-passes/${params}`),
  get: (id: number) => apiFetch<GatePass>(`/gate-passes/${id}/`),
};

// ── Documents ─────────────────────────────────────────────────────────────────

export const documents = {
  list: (params = "") => apiFetch<Document[]>(`/documents/${params}`),
  get: (id: number) => apiFetch<Document>(`/documents/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiFetch<Document>("/documents/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    apiFetch<Document>(`/documents/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  setStatus: (id: number, status: string) =>
    apiFetch<Document>(`/documents/${id}/status/`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  delete: (id: number) => apiFetch<void>(`/documents/${id}/`, { method: "DELETE" }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications = {
  list: (unread = false) =>
    apiFetch<{ unread_count: number; results: Notification[] }>(
      `/notifications/${unread ? "?unread=true" : ""}`,
    ),
  markRead: (id: number) =>
    apiFetch<Notification>(`/notifications/${id}/read/`, { method: "POST" }),
  markAllRead: () =>
    apiFetch<{ detail: string }>("/notifications/mark-all-read/", { method: "POST" }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = {
  list: (q = "") => apiFetch<User[]>(`/users/${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  get: (id: string) => apiFetch<User>(`/users/${id}/`),
  create: (data: Record<string, unknown>) =>
    apiFetch<User>("/users/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<User>(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  toggleActive: (id: string) =>
    apiFetch<User>(`/users/${id}/toggle-active/`, { method: "POST" }),
  setRole: (id: string, role: string, sections?: string[]) =>
    apiFetch<User>(`/users/${id}/set-role/`, {
      method: "PATCH",
      body: JSON.stringify({ role, sections }),
    }),
};
