# Zongii API Reference (v2 SPA)

REST API for the Zongii mining dashboard. Base URL: `/api/`. All responses are JSON.

## Authentication (JWT)

```
POST /api/auth/login/     { "username", "password" }  → { "access", "refresh" }
POST /api/auth/refresh/   { "refresh" }               → { "access" }
POST /api/auth/verify/    { "token" }                 → 200 | 401
GET  /api/auth/me/                                    → current user profile (role, allowed_sections)
PATCH /api/auth/me/       { firstname?, lastname?, email?, mobile?, gender? }
POST /api/auth/push-token/ { "token" }                → store Expo push token
```

Send `Authorization: Bearer <access>` on every request. Access tokens live 50 days
(see `SIMPLE_JWT` in settings). CORS is fully open in dev (`CORS_ALLOW_ALL_ORIGINS`).

The `/api/auth/me/` payload includes `role` (`admin|manager|picker|accountant|sales|staff`)
and `allowed_sections` (`dashboard, inventory, sales, orders, customers, billing, users`) —
use these to gate SPA routes exactly like the sidebar does.

## Dashboard

```
GET /api/dashboard/?period=week|month
→ { revenue, profit, total_sales_count, total_customers, pending_count,
    total_debt, low_stock_count, top_products[], chart_labels[], chart_revenue[] }
```

## Products

```
GET    /api/products/?q=&category=<id>&low_stock=true&include_inactive=true   (public)
POST   /api/products/                       (admin) — multipart for product_photo
GET    /api/products/{id}/
PUT    /api/products/{id}/                  (admin)
PATCH  /api/products/{id}/                  (admin)
DELETE /api/products/{id}/                  (admin) — soft: sets is_active=false
POST   /api/products/{id}/deactivate/       (admin)
GET    /api/products/low-stock/
POST   /api/products/{id}/refill/           { quantity_added, notes? } — creates StockRefill, bumps stock
GET    /api/products/{id}/refills/          — refill history
```

Product payload includes `quantity_at_hand`, `quantity_tons` (bulk stock, nullable),
`quantity_allocated`, `available_stock`, `min_price`/`max_price` (selling range),
`categories[]`, `product_photo` (URL under `/inventory/...`).
Write with `category_ids: [1, 2]`.

## Categories

```
GET/POST          /api/categories/          (POST admin)
GET/PUT/PATCH/DELETE /api/categories/{id}/  (write admin)
```

## Customers

```
GET/POST          /api/customers/?q=
GET/PUT/PATCH/DELETE /api/customers/{id}/
POST /api/customers/{id}/pay/    { amount }  — reduces remaining_balance
GET  /api/customers/debtors/                 — customers with balance > 0
```

## Sales (line items)

```
GET  /api/sales/?status=pending|approved|rejected&q=&customer=<id>&product=<id>
POST /api/sales/                 { product, customer?, quantity_sold, price_per_unit }
                                 — legacy direct sale: deducts stock immediately
GET/PUT/PATCH/DELETE /api/sales/{id}/
POST /api/sales/{id}/approve/    (admin)
POST /api/sales/{id}/reject/     (admin)
```

## Sale Orders (checkout + warehouse workflow)

This is the SPA checkout: build a cart client-side, then POST once.

```
POST /api/orders/
     { customer?: id, notes?: str,
       items: [{ product, quantity_sold, price_per_unit }, ...] }
     → 201 SaleOrder (status PENDING_APPROVAL)

GET  /api/orders/?status=<WORKFLOW_STATUS>&q=ZO001|customer|username
GET  /api/orders/stats/          → { total, stages: [{status, label, count}] }  — for stage tabs
GET  /api/orders/{id}/           → full order: sales[], history[], picking_orders
POST /api/orders/{id}/accountant-review/  { action: "approve"|"reject", note? }
POST /api/orders/{id}/verify/    { action: "approve"|"re_pick"|"reject", note? }
POST /api/orders/{id}/dispatch/  — final step; deducts stock, marks gate pass used
```

Workflow statuses: `PENDING_APPROVAL → PENDING_PICKING → PICKING →
PICKED | PARTIALLY_PICKED → VERIFIED → DISPATCHED`, plus
`RE_PICK_REQUIRED`, `REJECTED`, `CANCELLED`. Labels come translated (EN/SW)
via the `Accept-Language` header.

## Picking (warehouse)

```
GET  /api/picking/?status=&mine=true
GET  /api/picking/{id}/
POST /api/picking/{id}/accept/   — picker claims the order
POST /api/picking/{id}/submit/   { items: [{ id, picked_qty, notes? }], notes? }
                                 — status auto-advances: fully picked → COMPLETED,
                                   some picked → PARTIALLY_PICKED

```

## Gate Passes

```
GET /api/gate-passes/?used=false
GET /api/gate-passes/{id}/       — items with requested vs picked qty
```

## Documents (invoices & quotations)

```
GET  /api/documents/?type=invoice|quotation&status=
POST /api/documents/
     { doc_type, customer, issue_date, due_date?, notes?, terms?,
       discount_percent?, vat_percent?, customer_tin?,
       items: [{ product?, description, unit?, quantity, unit_price }] }
GET/PUT/PATCH/DELETE /api/documents/{id}/    (DELETE admin)
POST /api/documents/{id}/status/  { status: draft|sent|paid|accepted|rejected|cancelled }
```

Server computes `subtotal`, `discount_amount`, `vat_amount`, `total` and the
document `number` (INV-2026-0001 / QUO-2026-0001). PUT/PATCH with `items`
replaces all line items.

## Businesses

```
GET  /api/businesses/            — yours (owner or member); admins see all
POST /api/businesses/            { name, member_ids?: [...] } — you become owner
GET/PUT/PATCH/DELETE /api/businesses/{id}/   (write: owner or admin)
```

## Notifications

```
GET  /api/notifications/?unread=true   → { unread_count, results: [...] }
POST /api/notifications/{id}/read/
POST /api/notifications/mark-all-read/
```

Each notification carries `icon` (Bootstrap Icons class) and `color`
(`amber|blue|green|red`) matching the app's semantic palette.

## Users (admin only; UUID primary keys)

```
GET  /api/users/?q=
POST /api/users/                 { username, password, role, sections?, firstname?, ... }
GET/PATCH/DELETE /api/users/{uuid}/
POST  /api/users/{uuid}/toggle-active/
PATCH /api/users/{uuid}/set-role/      { role, sections? }
POST  /api/users/{uuid}/set-password/  { password }   — min 6 chars
```

Roles: `staff, sales, accountant, picker, manager, admin`. Setting a role also
resets `allowed_sections` to that role's defaults unless `sections` is given.

## Conventions

- **Errors**: `400` with `{ field: "message" }` or `{ "error": "..." }`; `403` for permission failures.
- **Money**: decimal strings, TZS, no currency symbol.
- **Media**: image URLs are relative (`/inventory/products/...`) — prefix with the API host.
- **i18n**: send `Accept-Language: sw` to get Swahili status labels and messages.
- **IDs**: integer PKs everywhere except users (UUID).
