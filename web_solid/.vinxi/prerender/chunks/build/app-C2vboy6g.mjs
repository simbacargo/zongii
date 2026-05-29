import { createComponent } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/web/dist/server.js';
import { Router } from 'file:///home/david/Work/zongii/web_solid/node_modules/@solidjs/router/dist/index.js';
import { C as Ct } from '../nitro/nitro.mjs';
import { Suspense, onMount, createContext } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/dist/server.js';
import { MetaProvider, Link } from 'file:///home/david/Work/zongii/web_solid/node_modules/@solidjs/meta/dist/index.js';
import { createStore } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/store/dist/server.js';
import 'file:///home/david/Work/zongii/web_solid/node_modules/destr/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/nitropack/node_modules/h3/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/hookable/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/ofetch/dist/node.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/node-mock-http/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/ufo/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/unstorage/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/unstorage/drivers/fs.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/nitropack/node_modules/ohash/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/klona/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/defu/dist/defu.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/scule/dist/index.mjs';
import 'node:async_hooks';
import 'file:///home/david/Work/zongii/web_solid/node_modules/unctx/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/radix3/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/vinxi/lib/app-fetch.js';
import 'file:///home/david/Work/zongii/web_solid/node_modules/vinxi/lib/app-manifest.js';
import 'node:fs';
import 'node:url';
import 'file:///home/david/Work/zongii/web_solid/node_modules/pathe/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/cookie-es/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/web/storage/dist/storage.js';
import 'file:///home/david/Work/zongii/web_solid/node_modules/h3/dist/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/seroval/dist/esm/production/index.mjs';
import 'file:///home/david/Work/zongii/web_solid/node_modules/seroval-plugins/dist/esm/production/web.mjs';

const g = "/api";
function p() {
  return typeof localStorage > "u" ? null : localStorage.getItem("access_token");
}
function I() {
  return typeof localStorage > "u" ? null : localStorage.getItem("refresh_token");
}
function _(e) {
  localStorage.setItem("access_token", e.access), localStorage.setItem("refresh_token", e.refresh);
}
function c() {
  localStorage.removeItem("access_token"), localStorage.removeItem("refresh_token");
}
async function A() {
  const e = I();
  if (!e) return null;
  try {
    const r = await fetch(`${g}/auth/refresh/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh: e }) });
    if (!r.ok) return c(), null;
    const t = await r.json();
    return localStorage.setItem("access_token", t.access), t.access;
  } catch {
    return null;
  }
}
async function d(e, r = {}, t = true) {
  const l = p(), u = r.body instanceof FormData, i = { ...r.headers };
  u || (i["Content-Type"] = "application/json"), l && (i.Authorization = `Bearer ${l}`);
  const n = await fetch(`${g}${e}`, { ...r, headers: i });
  if (n.status === 401 && t) {
    if (await A()) return d(e, r, false);
    throw c(), new Error("Unauthorized");
  }
  if (!n.ok) {
    let a = `HTTP ${n.status}`;
    try {
      const s = await n.json();
      a = s.detail || s.error || JSON.stringify(s);
    } catch {
    }
    throw new Error(a);
  }
  if (n.status !== 204) return n.json();
}
const f = { login: (e, r) => d("/auth/login/", { method: "POST", body: JSON.stringify({ username: e, password: r }) }), me: () => d("/auth/me/") }, j = createContext();
function P(e) {
  const [r, t] = createStore({ user: null, loading: false, initialized: false });
  async function l() {
    if (p()) {
      t("loading", true);
      try {
        const n = await f.me();
        t({ user: n, loading: false, initialized: true });
      } catch {
        c(), t({ user: null, loading: false, initialized: true });
      }
    } else t({ user: null, loading: false, initialized: true });
  }
  async function u(n, a) {
    t("loading", true);
    const s = await f.login(n, a);
    _(s);
    const h = await f.me();
    return t({ user: h, loading: false, initialized: true }), h;
  }
  function i() {
    c(), t({ user: null, loading: false, initialized: true });
  }
  return onMount(l), createComponent(j.Provider, { value: { state: r, login: u, logout: i }, get children() {
    return e.children;
  } });
}
function U() {
  return createComponent(MetaProvider, { get children() {
    return [createComponent(Link, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" }), createComponent(Link, { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" }), createComponent(Router, { get children() {
      return createComponent(P, { get children() {
        return createComponent(Suspense, { get children() {
          return createComponent(Ct, {});
        } });
      } });
    } })];
  } });
}

export { U as default };
//# sourceMappingURL=app-C2vboy6g.mjs.map
