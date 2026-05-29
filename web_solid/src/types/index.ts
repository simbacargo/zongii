export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  full_name: string;
  email: string;
  mobile: string;
  gender: string;
  is_active: boolean;
  is_admin: boolean;
  is_superuser: boolean;
  is_picker: boolean;
  is_sales: boolean;
  is_accountant: boolean;
  role: string;
  allowed_sections: string[];
  date_joined: string;
  last_seen: string | null;
}

export interface DashboardData {
  period: string;
  revenue: string;
  profit: string;
  total_sales_count: number;
  total_customers: number;
  pending_count: number;
  total_debt: string;
  low_stock_count: number;
  top_products: TopProduct[];
  chart_labels: string[];
  chart_revenue: number[];
}

export interface TopProduct {
  id: number;
  name: string;
  brand: string;
  total_sold: number;
  total_revenue: number;
}

export interface Category {
  id: number;
  name: string;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  part_number: string;
  upc_code: string;
  description: string;
  material: string;
  is_lead_free: boolean;
  max_pressure_psi: number | null;
  buying_price: string | null;
  wholesale_price: string | null;
  min_price: string | null;
  max_price: string | null;
  average_price: string | null;
  tax_rate: string;
  unit_of_measure: string;
  quantity_at_hand: number;
  quantity_allocated: number;
  available_stock: number;
  reorder_point: number;
  stock_value_at_cost: string | null;
  bin_location: string;
  supplier: string | null;
  weight: string | null;
  categories: Category[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_photo: string | null;
}

export interface StockRefill {
  id: number;
  quantity_added: number;
  quantity_after: number;
  notes: string;
  refilled_by_username: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  remaining_balance: string;
  debt_due_date: string | null;
}

export interface Sale {
  id: number;
  sale_code?: string;
  order: number | null;
  product: number;
  product_name: string;
  product_brand: string;
  customer: number | null;
  customer_name: string | null;
  quantity_sold: number;
  price_per_unit: string;
  total_amount: string;
  date_sold: string;
  aproved: boolean;
  rejected: boolean;
  deleted: boolean;
  created_by: string;
  created_by_username: string;
}

export type WorkflowStatus =
  | "PENDING_APPROVAL"
  | "PENDING_PICKING"
  | "PICKING"
  | "PARTIALLY_PICKED"
  | "PICKED"
  | "VERIFIED"
  | "RE_PICK_REQUIRED"
  | "REJECTED"
  | "DISPATCHED"
  | "CANCELLED";

export interface SaleStatusHistory {
  id: number;
  from_status: string;
  to_status: string;
  changed_by_username: string;
  note: string;
  changed_at: string;
}

export interface SaleOrder {
  id: number;
  order_code: string;
  customer: number | null;
  customer_name: string | null;
  created_by: string;
  created_by_username: string;
  workflow_status: WorkflowStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  verified_by: string | null;
  verified_by_username: string | null;
  verified_at: string | null;
  dispatched_at: string | null;
  total_amount: string;
  sales: Sale[];
  history: SaleStatusHistory[];
  picking_orders: PickingOrder[];
}

export interface SaleOrderListItem {
  id: number;
  order_code: string;
  customer: number | null;
  customer_name: string | null;
  workflow_status: WorkflowStatus;
  item_count: number;
  total_amount: string;
  created_at: string;
  dispatched_at: string | null;
}

export interface PickingOrderItem {
  id: number;
  product: number;
  product_name: string;
  requested_qty: number;
  picked_qty: number;
  is_complete: boolean;
  shortfall: number;
  notes: string;
}

export interface PickingOrder {
  id: number;
  picking_code?: string;
  sale_order: number;
  order_code?: string;
  picker: string | null;
  picker_username: string | null;
  status: string;
  notes: string;
  is_fully_picked: boolean;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  items: PickingOrderItem[];
}

export interface GatePassItem {
  id: number;
  product: number;
  product_name: string;
  requested_qty: number;
  picked_qty: number;
}

export interface GatePass {
  id: number;
  gp_code?: string;
  gate_pass_number?: number;
  sale_order: number;
  order_code?: string;
  picking_order: number | null;
  verified_by: string | null;
  verified_by_username: string | null;
  issued_at: string;
  is_used: boolean;
  items: GatePassItem[];
}

export interface DocumentItem {
  id: number;
  product: number | null;
  description: string;
  unit: string;
  quantity: string;
  unit_price: string;
  total: string;
}

export interface Document {
  id: number;
  number?: string;
  doc_type: "invoice" | "quotation";
  customer: number;
  customer_name: string;
  created_by: string;
  created_by_username: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  notes: string;
  terms: string;
  discount_percent: string;
  subtotal: string;
  discount_amount: string;
  total: string;
  created_at: string;
  updated_at: string;
  items: DocumentItem[];
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  entity_id: number | null;
  is_read: boolean;
  created_at: string;
}
