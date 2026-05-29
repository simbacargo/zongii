import { createComponent } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { C as Ct } from '../nitro/nitro.mjs';
import { Suspense, onMount, createContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import 'node:url';
import 'solid-js/web/storage';
import 'seroval';
import 'seroval-plugins/web';

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
