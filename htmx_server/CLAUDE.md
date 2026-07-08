# CLAUDE.md — Zongii Mining Dashboard (htmx_server)

Inventory/sales dashboard for Zongii Mining Company Ltd (Tanzania, TZS currency).
Django 5.1 + HTMX + Tailwind (CDN, no build step) + DRF. SQLite: `db3.sqlite3`.

## Run

```bash
python3 manage.py runserver   # system python has Django 5.1.4, DRF, pillow, openpyxl, polib
```

Login: superuser `testuser`. Templates live in `html/` (not per-app `templates/`).
Media quirk: `MEDIA_ROOT = BASE_DIR/'inventory'` and `upload_to='inventory/products/%Y/%m/'`,
so files land in `inventory/inventory/products/YYYY/MM/`.

## Layout

- `home/` — everything: models, HTMX views (`views.py`, ~2300 lines), REST API
  (`api_views.py`, `api_urls.py`, `serializers.py`)
- `authentication/` — custom `User` (UUID pk, role flags: is_admin/is_picker/is_sales/is_accountant,
  `allowed_sections` list gates sidebar + SPA routes)
- `notifications/` — in-app + Expo push notifications
- `html/` — Django templates; `html/snippets/aside.html` is the sidebar, `html/partials/` HTMX fragments
- `API.md` — full REST API reference (kept current; update it when the API changes)

## Domain

Products (with min/max selling price, stock in units + optional `quantity_tons` for bulk
like grinding balls) → cart checkout creates a `SaleOrder` with `Sale` line items →
warehouse workflow: PENDING_APPROVAL → (accountant) PENDING_PICKING → PICKING →
PICKED/PARTIALLY_PICKED → (sales verify) VERIFIED → gate pass issued → DISPATCHED
(stock deducted). `Document` = invoices/quotations with VAT (18%) + TIN.
Legacy path: a `Sale` without an order deducts stock immediately.

## Conventions (do not break)

**Theme — exactly 5 Tailwind color families:**
- `amber` = brand, primary buttons, selected, warning/pending
- `gray` = all neutrals (never slate/zinc/stone)
- `green` = success/money · `red` = danger · `blue` = in-progress/info status chips ONLY
- Admin role renders gold-on-black: `bg-gray-900` + `text-amber-400` (badge: white text)
- Dark mode = CSS overrides in `base.html` `<style>` keyed on `html.dark`; new tinted
  backgrounds may need a rule there
- ⚠️ When bulk-editing colors: `translate-` contains the substring `slate-`

**i18n — English + Swahili (`sw`):**
- Every user-facing template string: `{% trans "..." %}` (all templates already `{% load i18n %}`)
- View toast messages: `gettext as _` with `%(name)s` placeholders (no f-strings inside `_()`)
- Model choice labels: `gettext_lazy`
- ⚠️ gettext binaries are NOT installed — `makemessages`/`compilemessages` fail.
  Rebuild `locale/sw/LC_MESSAGES/django.po` + `.mo` with **polib**; add new msgid→Swahili
  pairs to the dict in the build script (pattern lives in a past session's scratchpad
  `build_sw.py`; regenerate it if lost: read the .po with polib, update, `save_as_mofile`)
- Language switcher is in the sidebar footer (posts to `set_language`); API translates
  via `Accept-Language` header

**Excel product imports** (MINING LIST files in repo root):
- One `Product` per size variant; `part_number` = size; two price columns → `min_price`/`max_price`
- Stock text like `56TONS+170PCS` → pieces into `quantity_at_hand`, tons into `quantity_tons`,
  raw text appended to description
- Images embedded in xlsx: map via `xl/drawings/drawing1.xml` anchors (row → image);
  save as `mining_<slug>.jpg`; variants share the item's image
- Categories: Excel section headers + "Mining Tools"; business/created_by left NULL
- Update-mode matching: name+size (iexact), track claimed pks so in-sheet twins with
  conflicting prices create separate rows instead of overwriting

## API (for the v2 SPA — see API.md)

JWT (`simplejwt`, 50-day tokens) at `/api/auth/login|refresh|verify/`; `/api/auth/me/`
returns `role` + `allowed_sections` for route gating. Every model has endpoints incl.
workflow actions (orders accountant-review/verify/dispatch, picking accept/submit),
`/api/orders/stats/` for stage tabs, `/api/users/{uuid}/set-password/`.
Note: `GET /api/products/` is `AllowAny` (intentional?, used by public site).
CORS fully open in dev. Users have UUID pks; everything else integer.

## Testing patterns

No test suite. Verify with Django test client in `manage.py shell -c`:
- HTMX pages: `Client()` + `force_login(User.objects.get(username='testuser'))`
- API: `RefreshToken.for_user(u).access_token` → `HTTP_AUTHORIZATION='Bearer ...'`
  (force_login won't work — DRF auth is JWT-only)
- ⚠️ When POSTing to `product_update`/`user_update` in tests, include `categories`/`sections`
  in the form data — the views `.set()` M2M from the form and an empty post wipes them

## State (2026-07-06)

- 1,124 products in DB (MINING LIST 2.xlsx imported: 934 new, 18 updated; photos in
  `inventory/inventory/products/2026/07/`)
- Theme unified, i18n live (541/574 strings translated; untranslated = brand names/examples)
- All of the above is UNCOMMITTED on `main` — large working tree diff
- Known data issue: DEMOLITION HAMMER EDON (DH-GL-125A) has max_price=7 (typo in source Excel)
- Seed user Nash.McLaughlin password was changed to `newpass123` during API testing
- Next: v2 SPA consuming `/api/` (user's plan); Python messages + templates are the
  translation surface if more Swahili coverage is wanted
