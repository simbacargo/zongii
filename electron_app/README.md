# Zongii Mining — Desktop (Electron)

Decoupled Electron port of the `web_v2` dashboard (Svelte 5 + Tailwind v4), talking to the
Django REST API at `http://127.0.0.1:8090/api` (see `src/lib/api.ts`).

## Backend

Port **8080** is normally occupied on this machine by an unrelated service ("Magoti", a FastAPI
app), so the Django backend (`../htmx_server`) must be run on a different port — **8090** — to
match `BASE_URL` in `src/lib/api.ts`. If you change the port, update both.

```sh
cd ../htmx_server
python3 manage.py runserver 127.0.0.1:8090
```

## Develop

```sh
bun install
bun run dev   # vite dev server + electron window, hot reload
```

## Build / package

```sh
bun run build   # vite build -> dist/
bun run pack    # unpacked electron-builder output -> release/
bun run dist    # installer for the current OS -> release/
```

## Notes

- Routing is a small hand-rolled hash router (`src/lib/router.ts`) instead of SvelteKit.
- Auth uses the same JWT access/refresh flow as `web_v2`, stored in `localStorage`.
- Pages that don't have a backend-wired form yet (e.g. "Add Product") show a toast instead of
  navigating to a dead route — same gaps that exist in `web_v2` today.
