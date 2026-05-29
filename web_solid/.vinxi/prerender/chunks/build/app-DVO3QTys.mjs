import { createComponent } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/web/dist/server.js';
import { Router } from 'file:///home/david/Work/zongii/web_solid/node_modules/@solidjs/router/dist/index.js';
import { C as Ct } from '../nitro/nitro.mjs';
import { Suspense, onMount, createContext } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/dist/server.js';
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
function h() {
  return typeof localStorage > "u" ? null : localStorage.getItem("access_token");
}
function z() {
  return typeof localStorage > "u" ? null : localStorage.getItem("refresh_token");
}
function _(e) {
  localStorage.setItem("access_token", e.access), localStorage.setItem("refresh_token", e.refresh);
}
function l() {
  localStorage.removeItem("access_token"), localStorage.removeItem("refresh_token");
}
async function A() {
  const e = z();
  if (!e) return null;
  try {
    const n = await fetch(`${g}/auth/refresh/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh: e }) });
    if (!n.ok) return l(), null;
    const t = await n.json();
    return localStorage.setItem("access_token", t.access), t.access;
  } catch {
    return null;
  }
}
async function d(e, n = {}, t = true) {
  const c = h(), u = n.body instanceof FormData, o = { ...n.headers };
  u || (o["Content-Type"] = "application/json"), c && (o.Authorization = `Bearer ${c}`);
  const r = await fetch(`${g}${e}`, { ...n, headers: o });
  if (r.status === 401 && t) {
    if (await A()) return d(e, n, false);
    throw l(), new Error("Unauthorized");
  }
  if (!r.ok) {
    let i = `HTTP ${r.status}`;
    try {
      const a = await r.json();
      i = a.detail || a.error || JSON.stringify(a);
    } catch {
    }
    throw new Error(i);
  }
  if (r.status !== 204) return r.json();
}
const f = { login: (e, n) => d("/auth/login/", { method: "POST", body: JSON.stringify({ username: e, password: n }) }), me: () => d("/auth/me/") }, I = createContext();
function v(e) {
  const [n, t] = createStore({ user: null, loading: false, initialized: false });
  async function c() {
    if (h()) {
      t("loading", true);
      try {
        const r = await f.me();
        t({ user: r, loading: false, initialized: true });
      } catch {
        l(), t({ user: null, loading: false, initialized: true });
      }
    } else t({ user: null, loading: false, initialized: true });
  }
  async function u(r, i) {
    t("loading", true);
    const a = await f.login(r, i);
    _(a);
    const m = await f.me();
    return t({ user: m, loading: false, initialized: true }), m;
  }
  function o() {
    l(), t({ user: null, loading: false, initialized: true });
  }
  return onMount(c), createComponent(I.Provider, { value: { state: n, login: u, logout: o }, get children() {
    return e.children;
  } });
}
function D() {
  return createComponent(v, { get children() {
    return createComponent(Router, { get children() {
      return createComponent(Suspense, { get children() {
        return createComponent(Ct, {});
      } });
    } });
  } });
}

export { D as default };
//# sourceMappingURL=app-DVO3QTys.mjs.map
