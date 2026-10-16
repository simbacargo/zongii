# Zongii API Reference (v2 SPA)

REST API for the Zongii mining dashboard. Base URL: `/api/`. Responses are JSON,
except the PDF download and printable gate-pass export.

## Authentication (JWT)

```
POST /api/auth/login/     { "username", "password" }  → { "access", "refresh" }
POST /api/auth/refresh/   { "refresh" }               → { "access" }
POST /api/auth/verify/    { "token" }                 → 200 | 401
POST /api/auth/signup/   { firstname, lastname, username, email, password1, password2 }
                                                     → 201 user profile
POST /api/auth/activate/ { uid, token }               → activate a signed activation link
GET  /api/auth/me/                                    → current user profile (role, allowed_sections)
PATCH /api/auth/me/       { firstname?, lastname?, email?, mobile?, gender? }
POST /api/auth/push-token/ { "token" }                → store Expo push token
```

Send `Authorization: Bearer <access>` on every request. Access tokens live 50 days
(see `SIMPLE_JWT` in settings). CORS is fully open in dev (`CORS_ALLOW_ALL_ORIGINS`).

Signup is public, uses the web signup form's password, username, email, and domain
validation, and creates an active user with no administrative roles. As with web
signup, email verification is currently not required. Activation accepts a URL-safe
base64 user ID and a Django-signed activation token; invalid/expired links return 400.
It does not sign the user in. Web activation now uses the same token generator.

JWT logout happens in the client: discard both tokens and clear cached user data.
There is no server-side token revocation endpoint; issued tokens remain valid until
expiry. The web logout route only ends the browser session.

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
The `q` search uses the same ranked, prefix-matched full-text search as the web
inventory, including supplier, description, material, and category names.

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

Checkout rejects malformed items, unknown products/customers, nonpositive quantities
or prices, insufficient available stock (including repeated products across lines),
and prices outside the product's range when both bounds are set. Invalid requests
return 400 without creating an order. Successful checkout records the initial status
history and notifies accountants after commit, matching the web workflow. Stock is
deducted at dispatch. Create an inline customer via `POST /api/customers/` first;
send its ID with the order (including any intended debt balance on customer creation).

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
GET /api/gate-passes/{id}/print/ — printable HTML export (JWT required)
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
GET  /api/documents/{id}/pdf/     — application/pdf attachment (JWT required)
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

## Web view coverage audit

All routed application views are accounted for below. Django admin, static/media
serving, and Django's language-switch redirect are framework routes outside this
business API. Unrouted legacy helpers/classes in `authentication/views.py` are not
exposed endpoints (including the old Knox and Google login implementations).

| Web views | REST counterpart |
| --- | --- |
| `category_list`, `category_create`, `category_update`, `category_delete` | GET/POST `/api/categories/`; GET/PUT/PATCH/DELETE `/api/categories/{id}/` |
| `business_list`, `business_detail`, `business_create`, `business_update`, `business_delete` | GET/POST `/api/businesses/`; GET/PUT/PATCH/DELETE `/api/businesses/{id}/` |
| `product_list`, `product_detail`, `product_create`, `product_update`, `product_delete` | GET/POST `/api/products/`; GET/PUT/PATCH/DELETE `/api/products/{id}/` |
| `stock_refill_view` | POST `/api/products/{id}/refill/`; GET `/api/products/{id}/refills/` |
| `customer_list`, `customer_detail`, `customer_create`, `customer_update`, `customer_delete` | GET/POST `/api/customers/`; GET/PUT/PATCH/DELETE `/api/customers/{id}/` |
| `customer_search`, `customer_quick_create` | GET `/api/customers/?q=`; POST `/api/customers/` |
| `customer_pay_balance` | POST `/api/customers/{id}/pay/` |
| `sale_list` (both URL names), `sale_detail`, `sale_create_htmx`, `sale_update`, `sale_delete`, `product_sell` | GET/POST `/api/sales/`; GET/PUT/PATCH/DELETE `/api/sales/{id}/` |
| `sale_approve`, `sale_reject` | POST `/api/sales/{id}/approve/` or `/reject/` |
| `sale_create_view`, `checkout_submit` | Build cart locally, POST `/api/orders/` |
| `checkout_product_search`, `document_product_search` | GET `/api/products/?q=` |
| `manage_cart` | Client state: add/update/remove cart lines locally; POST final items to `/api/orders/` |
| `dashboard` (both paths) | GET `/api/dashboard/?period=week\|month` |
| `document_list`, `document_create`, `document_detail`, `document_delete` | GET/POST `/api/documents/`; GET/PUT/PATCH/DELETE `/api/documents/{id}/` |
| `document_status`, `document_pdf` | POST `/api/documents/{id}/status/`; GET `/api/documents/{id}/pdf/` |
| `document_item_row` | Client renders line-item fields; POST items with `/api/documents/` |
| `sale_order_list`, `sale_order_detail` | GET `/api/orders/`, `/api/orders/stats/`, `/api/orders/{id}/` |
| `sale_order_accountant_review`, `sale_order_verify`, `dispatch_order` | POST `/api/orders/{id}/accountant-review/`, `/verify/`, `/dispatch/` |
| `picker_dashboard`, `picking_detail`, `picking_accept`, `picking_save` | GET `/api/picking/`, `/api/picking/{id}/`; POST `/accept/`, `/submit/` |
| `gate_pass_detail`, `gate_pass_print` | GET `/api/gate-passes/{id}/`, `/api/gate-passes/{id}/print/` |
| `user_list`, `user_create`, `user_detail`, `user_update`, `user_delete` | GET/POST `/api/users/`; GET/PATCH/DELETE `/api/users/{uuid}/`; role/password actions above |
| `user_toggle_active` | POST `/api/users/{uuid}/toggle-active/` |
| `signup`, `activate`, Django `LoginView` | POST `/api/auth/signup/`, `/api/auth/activate/`, `/api/auth/login/` |
| `logout_view` | Client discards JWT tokens; no server revocation |
| `notification_list`, `notification_badge` | GET `/api/notifications/` includes `unread_count` |
| `mark_read`, `mark_all_read` | POST `/api/notifications/{id}/read/`, `/api/notifications/mark-all-read/` |

`python manage.py test home --noinput` checks route coverage (new web views require
an explicit mapping), collection access, registration, activation, exports, search,
and checkout validation. It uses Django's separate test database.
