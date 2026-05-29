import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import destr from 'file:///home/david/Work/zongii/web_solid/node_modules/destr/dist/index.mjs';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestURL, setResponseStatus, getResponseHeader, setResponseHeaders, send, getRequestHeader, removeResponseHeader, appendResponseHeader, setResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler } from 'file:///home/david/Work/zongii/web_solid/node_modules/nitropack/node_modules/h3/dist/index.mjs';
import { createHooks } from 'file:///home/david/Work/zongii/web_solid/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///home/david/Work/zongii/web_solid/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///home/david/Work/zongii/web_solid/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file:///home/david/Work/zongii/web_solid/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///home/david/Work/zongii/web_solid/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///home/david/Work/zongii/web_solid/node_modules/unstorage/drivers/fs.mjs';
import unstorage_47drivers_47fs_45lite from 'file:///home/david/Work/zongii/web_solid/node_modules/unstorage/drivers/fs-lite.mjs';
import { digest } from 'file:///home/david/Work/zongii/web_solid/node_modules/nitropack/node_modules/ohash/dist/index.mjs';
import { klona } from 'file:///home/david/Work/zongii/web_solid/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file:///home/david/Work/zongii/web_solid/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file:///home/david/Work/zongii/web_solid/node_modules/scule/dist/index.mjs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file:///home/david/Work/zongii/web_solid/node_modules/unctx/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file:///home/david/Work/zongii/web_solid/node_modules/radix3/dist/index.mjs';
import _ZjZXwoQWo1JGsqX1eafIpwbX97ygRRu6EP_GwsJmbKE from 'file:///home/david/Work/zongii/web_solid/node_modules/vinxi/lib/app-fetch.js';
import _JNtdRQFnd619GYJFRjzM31jx1SDuYZAxAm0dyGlHtFk from 'file:///home/david/Work/zongii/web_solid/node_modules/vinxi/lib/app-manifest.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'file:///home/david/Work/zongii/web_solid/node_modules/pathe/dist/index.mjs';
import { parseSetCookie } from 'file:///home/david/Work/zongii/web_solid/node_modules/cookie-es/dist/index.mjs';
import { sharedConfig, lazy, createComponent, catchError, onCleanup } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/dist/server.js';
import { renderToString, isServer, getRequestEvent, ssrElement, escape, mergeProps, ssr, createComponent as createComponent$1, ssrHydrationKey, NoHydration, ssrAttribute } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/web/dist/server.js';
import { provideRequestEvent } from 'file:///home/david/Work/zongii/web_solid/node_modules/solid-js/web/storage/dist/storage.js';
import { eventHandler as eventHandler$1, H3Event, getRequestIP, parseCookies, getResponseStatus, getResponseStatusText, getCookie, setCookie, getResponseHeader as getResponseHeader$1, setResponseHeader as setResponseHeader$1, removeResponseHeader as removeResponseHeader$1, getResponseHeaders, getRequestURL as getRequestURL$1, getRequestWebStream, setResponseStatus as setResponseStatus$1, appendResponseHeader as appendResponseHeader$1, setHeader, sendRedirect as sendRedirect$1 } from 'file:///home/david/Work/zongii/web_solid/node_modules/h3/dist/index.mjs';
import { fromJSON, Feature, crossSerializeStream, getCrossReferenceHeader, toCrossJSONStream } from 'file:///home/david/Work/zongii/web_solid/node_modules/seroval/dist/esm/production/index.mjs';
import { AbortSignalPlugin, CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin } from 'file:///home/david/Work/zongii/web_solid/node_modules/seroval-plugins/dist/esm/production/web.mjs';

const serverAssets = [{"baseName":"server","dir":"/home/david/Work/zongii/web_solid/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));
storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/home/david/Work/zongii/web_solid"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/home/david/Work/zongii/web_solid"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/home/david/Work/zongii/web_solid/.vinxi"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/home/david/Work/zongii/web_solid/.vinxi/cache"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/_build/assets/**": {
        "headers": {
          "cache-control": "public, immutable, max-age=31536000"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/home/david/Work/zongii/web_solid","order":0,"outDir":"/home/david/Work/zongii/web_solid/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/home/david/Work/zongii/web_solid","base":"/","outDir":"/home/david/Work/zongii/web_solid/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/home/david/Work/zongii/web_solid","outDir":"/home/david/Work/zongii/web_solid/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/home/david/Work/zongii/web_solid","outDir":"/home/david/Work/zongii/web_solid/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"prerender":{}},"root":"/home/david/Work/zongii/web_solid"};
				const buildManifest = {"ssr":{"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true}},"client":{"_Badge-Bt-h5LU7.js":{"file":"assets/Badge-Bt-h5LU7.js","name":"Badge","imports":["_api-BDlEm1m2.js","_utils-DIK23y8C.js"]},"_EmptyState-Bu1djVJF.js":{"file":"assets/EmptyState-Bu1djVJF.js","name":"EmptyState","imports":["_api-BDlEm1m2.js"]},"_Modal-CL5Qg-bl.js":{"file":"assets/Modal-CL5Qg-bl.js","name":"Modal","imports":["_api-BDlEm1m2.js"]},"_Spinner-CqBNS1yy.js":{"file":"assets/Spinner-CqBNS1yy.js","name":"Spinner","imports":["_api-BDlEm1m2.js"]},"_api-BDlEm1m2.js":{"file":"assets/api-BDlEm1m2.js","name":"api"},"_auth-xvxqRZLM.js":{"file":"assets/auth-xvxqRZLM.js","name":"auth","imports":["_api-BDlEm1m2.js"]},"_index-KBzOSCQT.js":{"file":"assets/index-KBzOSCQT.js","name":"index","imports":["_api-BDlEm1m2.js"]},"_preload-helper-CM3UJVvY.js":{"file":"assets/preload-helper-CM3UJVvY.js","name":"preload-helper"},"_utils-DIK23y8C.js":{"file":"assets/utils-DIK23y8C.js","name":"utils"},"node_modules/chart.js/auto/auto.js":{"file":"assets/auto-B-LWvvbi.js","name":"auto","src":"node_modules/chart.js/auto/auto.js","isDynamicEntry":true},"src/routes/(app).tsx?pick=default&pick=$css":{"file":"assets/(app)-Dt4i8Cp4.js","name":"(app)","src":"src/routes/(app).tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_auth-xvxqRZLM.js","_Spinner-CqBNS1yy.js"]},"src/routes/(app)/categories.tsx?pick=default&pick=$css":{"file":"assets/categories-BkCeC_i2.js","name":"categories","src":"src/routes/(app)/categories.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/customers/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-uU-VUdP2.js","name":"_id_","src":"src/routes/(app)/customers/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_Modal-CL5Qg-bl.js"]},"src/routes/(app)/customers/index.tsx?pick=default&pick=$css":{"file":"assets/index-DecLnjWw.js","name":"index","src":"src/routes/(app)/customers/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_Modal-CL5Qg-bl.js"]},"src/routes/(app)/documents/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-CSS56xLW.js","name":"_id_","src":"src/routes/(app)/documents/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_Modal-CL5Qg-bl.js"]},"src/routes/(app)/documents/index.tsx?pick=default&pick=$css":{"file":"assets/index-CdWP7z1F.js","name":"index","src":"src/routes/(app)/documents/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_Modal-CL5Qg-bl.js"]},"src/routes/(app)/gate-passes/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-oSjY-TJj.js","name":"_id_","src":"src/routes/(app)/gate-passes/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js"]},"src/routes/(app)/gate-passes/index.tsx?pick=default&pick=$css":{"file":"assets/index-DMVlXuEY.js","name":"index","src":"src/routes/(app)/gate-passes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js"]},"src/routes/(app)/index.tsx?pick=default&pick=$css":{"file":"assets/index-DYHrNj-5.js","name":"index","src":"src/routes/(app)/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_preload-helper-CM3UJVvY.js","_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js"],"dynamicImports":["node_modules/chart.js/auto/auto.js"]},"src/routes/(app)/notifications.tsx?pick=default&pick=$css":{"file":"assets/notifications-DmWhTXZv.js","name":"notifications","src":"src/routes/(app)/notifications.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js"]},"src/routes/(app)/orders/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-CjWQWq2I.js","name":"_id_","src":"src/routes/(app)/orders/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_Badge-Bt-h5LU7.js","_Modal-CL5Qg-bl.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/orders/index.tsx?pick=default&pick=$css":{"file":"assets/index-DSnpX0nD.js","name":"index","src":"src/routes/(app)/orders/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_Badge-Bt-h5LU7.js","_Modal-CL5Qg-bl.js"]},"src/routes/(app)/picking/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-BTjC7bys.js","name":"_id_","src":"src/routes/(app)/picking/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/picking/index.tsx?pick=default&pick=$css":{"file":"assets/index-DGlhxrIS.js","name":"index","src":"src/routes/(app)/picking/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/products/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-Dbv0L6lA.js","name":"_id_","src":"src/routes/(app)/products/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_Modal-CL5Qg-bl.js","_Badge-Bt-h5LU7.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/products/index.tsx?pick=default&pick=$css":{"file":"assets/index-8yDtXffe.js","name":"index","src":"src/routes/(app)/products/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_Modal-CL5Qg-bl.js","_Badge-Bt-h5LU7.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/sales/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-BCn1HBFk.js","name":"_id_","src":"src/routes/(app)/sales/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_Badge-Bt-h5LU7.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/sales/index.tsx?pick=default&pick=$css":{"file":"assets/index-BMQsBNWx.js","name":"index","src":"src/routes/(app)/sales/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_Badge-Bt-h5LU7.js","_Modal-CL5Qg-bl.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/users/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-B73HUyCP.js","name":"_id_","src":"src/routes/(app)/users/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_Badge-Bt-h5LU7.js","_auth-xvxqRZLM.js"]},"src/routes/(app)/users/index.tsx?pick=default&pick=$css":{"file":"assets/index-C_2M8h-n.js","name":"index","src":"src/routes/(app)/users/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_utils-DIK23y8C.js","_Spinner-CqBNS1yy.js","_EmptyState-Bu1djVJF.js","_Badge-Bt-h5LU7.js","_Modal-CL5Qg-bl.js"]},"src/routes/login.tsx?pick=default&pick=$css":{"file":"assets/login-DyyTh3kK.js","name":"login","src":"src/routes/login.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_api-BDlEm1m2.js","_index-KBzOSCQT.js","_auth-xvxqRZLM.js","_Spinner-CqBNS1yy.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-BSWCL-18.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_api-BDlEm1m2.js","_preload-helper-CM3UJVvY.js","_index-KBzOSCQT.js","_auth-xvxqRZLM.js"],"dynamicImports":["src/routes/(app).tsx?pick=default&pick=$css","src/routes/login.tsx?pick=default&pick=$css","src/routes/(app)/categories.tsx?pick=default&pick=$css","src/routes/(app)/index.tsx?pick=default&pick=$css","src/routes/(app)/notifications.tsx?pick=default&pick=$css","src/routes/(app)/customers/[id].tsx?pick=default&pick=$css","src/routes/(app)/customers/index.tsx?pick=default&pick=$css","src/routes/(app)/documents/[id].tsx?pick=default&pick=$css","src/routes/(app)/documents/index.tsx?pick=default&pick=$css","src/routes/(app)/gate-passes/[id].tsx?pick=default&pick=$css","src/routes/(app)/gate-passes/index.tsx?pick=default&pick=$css","src/routes/(app)/orders/[id].tsx?pick=default&pick=$css","src/routes/(app)/orders/index.tsx?pick=default&pick=$css","src/routes/(app)/picking/[id].tsx?pick=default&pick=$css","src/routes/(app)/picking/index.tsx?pick=default&pick=$css","src/routes/(app)/products/[id].tsx?pick=default&pick=$css","src/routes/(app)/products/index.tsx?pick=default&pick=$css","src/routes/(app)/sales/[id].tsx?pick=default&pick=$css","src/routes/(app)/sales/index.tsx?pick=default&pick=$css","src/routes/(app)/users/[id].tsx?pick=default&pick=$css","src/routes/(app)/users/index.tsx?pick=default&pick=$css"],"css":["assets/client-Bj2uilB_.css"]}},"server-fns":{"_server-fns-CHZUKvG_.js":{"file":"assets/server-fns-CHZUKvG_.js","name":"server-fns","dynamicImports":["src/app.tsx"]},"src/app.tsx":{"file":"assets/app-DVO3QTys.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"imports":["_server-fns-CHZUKvG_.js"],"css":["assets/app-Bj2uilB_.css"]},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"imports":["_server-fns-CHZUKvG_.js"]}}};

				const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin,
_ZjZXwoQWo1JGsqX1eafIpwbX97ygRRu6EP_GwsJmbKE,
_JNtdRQFnd619GYJFRjzM31jx1SDuYZAxAm0dyGlHtFk,
app
];

const assets = {
  "/Logo.png": {
    "type": "image/png",
    "etag": "\"eb7d-MTJMnU9d+P+JZYDR11CVv/+2o7o\"",
    "mtime": "2026-05-29T12:36:21.573Z",
    "size": 60285,
    "path": "../../.output/public/Logo.png"
  },
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "encoding": null,
    "etag": "\"2feb-DZaqI7Lr9mx/JYQ5QIlgZCqRp8c\"",
    "mtime": "2026-05-29T12:36:21.633Z",
    "size": 12267,
    "path": "../../.output/public/_build/.vite/manifest.json"
  },
  "/_build/.vite/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"3fa-OfRfuSiQbaawU5SGKX1YgFIWpLU\"",
    "mtime": "2026-05-29T12:36:21.800Z",
    "size": 1018,
    "path": "../../.output/public/_build/.vite/manifest.json.br"
  },
  "/_build/assets/(app)-Dt4i8Cp4.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"f53-Lg7va514/dOQgVZBFhwobECcrHk\"",
    "mtime": "2026-05-29T12:36:21.633Z",
    "size": 3923,
    "path": "../../.output/public/_build/assets/(app)-Dt4i8Cp4.js"
  },
  "/_build/.vite/manifest.json.gz": {
    "type": "application/json",
    "encoding": "gzip",
    "etag": "\"48b-LqZvo5tugRHpcDC1UyTF3/Sz3H0\"",
    "mtime": "2026-05-29T12:36:21.729Z",
    "size": 1163,
    "path": "../../.output/public/_build/.vite/manifest.json.gz"
  },
  "/_build/assets/(app)-Dt4i8Cp4.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5f4-bKK87Nl72nu5E2NHWGpjLEjPG6k\"",
    "mtime": "2026-05-29T12:36:21.731Z",
    "size": 1524,
    "path": "../../.output/public/_build/assets/(app)-Dt4i8Cp4.js.br"
  },
  "/_build/assets/(app)-Dt4i8Cp4.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6b4-z0qcHOn7zXrcvWtrdZvNZ9LpRXs\"",
    "mtime": "2026-05-29T12:36:21.730Z",
    "size": 1716,
    "path": "../../.output/public/_build/assets/(app)-Dt4i8Cp4.js.gz"
  },
  "/_build/assets/Badge-Bt-h5LU7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"352-Sw56Tqjx/vVUsfnPiUvGVB6VcCc\"",
    "mtime": "2026-05-29T12:36:21.640Z",
    "size": 850,
    "path": "../../.output/public/_build/assets/Badge-Bt-h5LU7.js"
  },
  "/_build/assets/EmptyState-Bu1djVJF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"210-DACXIX9zVpjdqSdGiDcX1pe/ddA\"",
    "mtime": "2026-05-29T12:36:21.638Z",
    "size": 528,
    "path": "../../.output/public/_build/assets/EmptyState-Bu1djVJF.js"
  },
  "/_build/assets/Modal-CL5Qg-bl.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"45f-Ff6WwLz9a0pRQkWMovuRb26hocQ\"",
    "mtime": "2026-05-29T12:36:21.637Z",
    "size": 1119,
    "path": "../../.output/public/_build/assets/Modal-CL5Qg-bl.js"
  },
  "/_build/assets/Modal-CL5Qg-bl.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"226-VXgj8vHvzGuhnZZjWwGkqbOkJoU\"",
    "mtime": "2026-05-29T12:36:21.730Z",
    "size": 550,
    "path": "../../.output/public/_build/assets/Modal-CL5Qg-bl.js.br"
  },
  "/_build/assets/Modal-CL5Qg-bl.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"28f-Ul6LIBTRg1MTst2+1BKIZPvsCTA\"",
    "mtime": "2026-05-29T12:36:21.730Z",
    "size": 655,
    "path": "../../.output/public/_build/assets/Modal-CL5Qg-bl.js.gz"
  },
  "/_build/assets/Spinner-CqBNS1yy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c6-EKA6qpSNk5ArxsPr/MHrC1C+td0\"",
    "mtime": "2026-05-29T12:36:21.637Z",
    "size": 454,
    "path": "../../.output/public/_build/assets/Spinner-CqBNS1yy.js"
  },
  "/_build/assets/_id_-B73HUyCP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"127d-6jmSSwN9F4wKuctTgyAT98QmYW0\"",
    "mtime": "2026-05-29T12:36:21.637Z",
    "size": 4733,
    "path": "../../.output/public/_build/assets/_id_-B73HUyCP.js"
  },
  "/_build/assets/_id_-B73HUyCP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"676-XXcQGWUkZsAmQNtohtBX9M/XD/o\"",
    "mtime": "2026-05-29T12:36:21.731Z",
    "size": 1654,
    "path": "../../.output/public/_build/assets/_id_-B73HUyCP.js.br"
  },
  "/_build/assets/_id_-B73HUyCP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"756-GXx5q0rGM/ln6MTPK7f6erF96dM\"",
    "mtime": "2026-05-29T12:36:21.730Z",
    "size": 1878,
    "path": "../../.output/public/_build/assets/_id_-B73HUyCP.js.gz"
  },
  "/_build/assets/_id_-BCn1HBFk.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"c55-pbf+QH62ngme3ev0NrOpdEJd+VM\"",
    "mtime": "2026-05-29T12:36:21.638Z",
    "size": 3157,
    "path": "../../.output/public/_build/assets/_id_-BCn1HBFk.js"
  },
  "/_build/assets/_id_-BCn1HBFk.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a6-1eLBcT+2ee2ROT718jTAbIRsHTs\"",
    "mtime": "2026-05-29T12:36:21.800Z",
    "size": 1190,
    "path": "../../.output/public/_build/assets/_id_-BCn1HBFk.js.br"
  },
  "/_build/assets/_id_-BCn1HBFk.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"54b-s4uFuVjLrOU/PilyD0p4s8Hzbmg\"",
    "mtime": "2026-05-29T12:36:21.731Z",
    "size": 1355,
    "path": "../../.output/public/_build/assets/_id_-BCn1HBFk.js.gz"
  },
  "/_build/assets/_id_-BTjC7bys.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"17d5-s5olMaLi1XraheiEJa+LB3pxaAc\"",
    "mtime": "2026-05-29T12:36:21.638Z",
    "size": 6101,
    "path": "../../.output/public/_build/assets/_id_-BTjC7bys.js"
  },
  "/_build/assets/_id_-BTjC7bys.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7f7-/goXG2ZW7omUXAVYMYcVEq1tAd4\"",
    "mtime": "2026-05-29T12:36:21.819Z",
    "size": 2039,
    "path": "../../.output/public/_build/assets/_id_-BTjC7bys.js.br"
  },
  "/_build/assets/_id_-BTjC7bys.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"902-Bi9t7ApByBSAthxSCIt0XvpHuzM\"",
    "mtime": "2026-05-29T12:36:21.731Z",
    "size": 2306,
    "path": "../../.output/public/_build/assets/_id_-BTjC7bys.js.gz"
  },
  "/_build/assets/_id_-CSS56xLW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"19ec-0kuQPRgWiuBEHpYt0rC0y1VNJZ0\"",
    "mtime": "2026-05-29T12:36:21.638Z",
    "size": 6636,
    "path": "../../.output/public/_build/assets/_id_-CSS56xLW.js"
  },
  "/_build/assets/_id_-CSS56xLW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"81d-/3zW/Yz1cBiRLK/c85rJQO7MTKM\"",
    "mtime": "2026-05-29T12:36:21.800Z",
    "size": 2077,
    "path": "../../.output/public/_build/assets/_id_-CSS56xLW.js.br"
  },
  "/_build/assets/_id_-CSS56xLW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"945-KZeC2bgb0oEKax6KQT89U4pX1pE\"",
    "mtime": "2026-05-29T12:36:21.800Z",
    "size": 2373,
    "path": "../../.output/public/_build/assets/_id_-CSS56xLW.js.gz"
  },
  "/_build/assets/_id_-CjWQWq2I.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"aa9-22XzpMEl+w4kyuU2T5nlz99+mTM\"",
    "mtime": "2026-05-29T12:36:21.883Z",
    "size": 2729,
    "path": "../../.output/public/_build/assets/_id_-CjWQWq2I.js.br"
  },
  "/_build/assets/_id_-CjWQWq2I.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2656-qmmzNKFUEEQ70so17tx0yX1PDEk\"",
    "mtime": "2026-05-29T12:36:21.638Z",
    "size": 9814,
    "path": "../../.output/public/_build/assets/_id_-CjWQWq2I.js"
  },
  "/_build/assets/_id_-CjWQWq2I.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"c08-hnSte+HXAHTKZnGEXQvnHQqS7n4\"",
    "mtime": "2026-05-29T12:36:21.800Z",
    "size": 3080,
    "path": "../../.output/public/_build/assets/_id_-CjWQWq2I.js.gz"
  },
  "/_build/assets/_id_-Dbv0L6lA.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"24a5-7wm32Hba99Nj/lf36JMyZv7OqWA\"",
    "mtime": "2026-05-29T12:36:21.638Z",
    "size": 9381,
    "path": "../../.output/public/_build/assets/_id_-Dbv0L6lA.js"
  },
  "/_build/assets/_id_-Dbv0L6lA.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a31-beLFxjze/6NH3Dl74Zikn+72TGg\"",
    "mtime": "2026-05-29T12:36:21.801Z",
    "size": 2609,
    "path": "../../.output/public/_build/assets/_id_-Dbv0L6lA.js.br"
  },
  "/_build/assets/_id_-Dbv0L6lA.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b76-Wv0R7V3ARqIGVIGZzHJ1gd0mYUw\"",
    "mtime": "2026-05-29T12:36:21.800Z",
    "size": 2934,
    "path": "../../.output/public/_build/assets/_id_-Dbv0L6lA.js.gz"
  },
  "/_build/assets/_id_-oSjY-TJj.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"cc4-YH5rsuknxSW2kHM5DP7rmoJjvVw\"",
    "mtime": "2026-05-29T12:36:21.639Z",
    "size": 3268,
    "path": "../../.output/public/_build/assets/_id_-oSjY-TJj.js"
  },
  "/_build/assets/_id_-oSjY-TJj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a0-W7Tdn7Ctz2kd8RURjjzqgJP/iuI\"",
    "mtime": "2026-05-29T12:36:21.843Z",
    "size": 1184,
    "path": "../../.output/public/_build/assets/_id_-oSjY-TJj.js.br"
  },
  "/_build/assets/_id_-oSjY-TJj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"55b-2jl0AXi1P58wclXbT11PwzxxnWA\"",
    "mtime": "2026-05-29T12:36:21.800Z",
    "size": 1371,
    "path": "../../.output/public/_build/assets/_id_-oSjY-TJj.js.gz"
  },
  "/_build/assets/_id_-uU-VUdP2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"17bc-vo7dBkwR+vLMrGdJs5v4bijmOmc\"",
    "mtime": "2026-05-29T12:36:21.644Z",
    "size": 6076,
    "path": "../../.output/public/_build/assets/_id_-uU-VUdP2.js"
  },
  "/_build/assets/_id_-uU-VUdP2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"709-/jqW+0m1JDuRmM0c/gSu8A1q0IY\"",
    "mtime": "2026-05-29T12:36:22.014Z",
    "size": 1801,
    "path": "../../.output/public/_build/assets/_id_-uU-VUdP2.js.br"
  },
  "/_build/assets/_id_-uU-VUdP2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7ee-qvlUTh3XKSLwCtSHKLP7QP6F8/o\"",
    "mtime": "2026-05-29T12:36:21.849Z",
    "size": 2030,
    "path": "../../.output/public/_build/assets/_id_-uU-VUdP2.js.gz"
  },
  "/_build/assets/api-BDlEm1m2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"73de-yKWiMYr4tW2I887uuiX3LpUhTJc\"",
    "mtime": "2026-05-29T12:36:21.645Z",
    "size": 29662,
    "path": "../../.output/public/_build/assets/api-BDlEm1m2.js"
  },
  "/_build/assets/api-BDlEm1m2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"26bc-Ox5LnKVkQOifjCW8jszn4R5EyZA\"",
    "mtime": "2026-05-29T12:36:22.092Z",
    "size": 9916,
    "path": "../../.output/public/_build/assets/api-BDlEm1m2.js.br"
  },
  "/_build/assets/auth-xvxqRZLM.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1173-rjyAtqC80n4MZNMFre6Wk+XVpuQ\"",
    "mtime": "2026-05-29T12:36:21.640Z",
    "size": 4467,
    "path": "../../.output/public/_build/assets/auth-xvxqRZLM.js"
  },
  "/_build/assets/api-BDlEm1m2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2ad1-ChGK3wmj0EXnPHQsbeACl6LFsGM\"",
    "mtime": "2026-05-29T12:36:21.885Z",
    "size": 10961,
    "path": "../../.output/public/_build/assets/api-BDlEm1m2.js.gz"
  },
  "/_build/assets/auth-xvxqRZLM.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"690-M1Q/k7g9nFFYvfDfLDchswWZYs8\"",
    "mtime": "2026-05-29T12:36:21.849Z",
    "size": 1680,
    "path": "../../.output/public/_build/assets/auth-xvxqRZLM.js.br"
  },
  "/_build/assets/auth-xvxqRZLM.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"721-P+18vINbnT+5B2RXRTou0Gxtvug\"",
    "mtime": "2026-05-29T12:36:21.849Z",
    "size": 1825,
    "path": "../../.output/public/_build/assets/auth-xvxqRZLM.js.gz"
  },
  "/_build/assets/auto-B-LWvvbi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"32bf3-1KswDVcg0axXMGJH5Obm93sEFyA\"",
    "mtime": "2026-05-29T12:36:21.641Z",
    "size": 207859,
    "path": "../../.output/public/_build/assets/auto-B-LWvvbi.js"
  },
  "/_build/assets/auto-B-LWvvbi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f015-xpltLa4jI4Nv7ne47JIHmskFVi4\"",
    "mtime": "2026-05-29T12:36:22.915Z",
    "size": 61461,
    "path": "../../.output/public/_build/assets/auto-B-LWvvbi.js.br"
  },
  "/_build/assets/auto-B-LWvvbi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"11599-JJxNa728SneZoeYyRUEwQUkZj0g\"",
    "mtime": "2026-05-29T12:36:22.099Z",
    "size": 71065,
    "path": "../../.output/public/_build/assets/auto-B-LWvvbi.js.gz"
  },
  "/_build/assets/categories-BkCeC_i2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"e8a-dNDsvobsztDEXpJSa2nzemvlrP8\"",
    "mtime": "2026-05-29T12:36:21.640Z",
    "size": 3722,
    "path": "../../.output/public/_build/assets/categories-BkCeC_i2.js"
  },
  "/_build/assets/categories-BkCeC_i2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5a6-6aB/b0F0bHvc1gh0jJTBQ1VVevs\"",
    "mtime": "2026-05-29T12:36:22.014Z",
    "size": 1446,
    "path": "../../.output/public/_build/assets/categories-BkCeC_i2.js.gz"
  },
  "/_build/assets/client-BSWCL-18.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"40c7-irN5U9R8z0Wff3JNI0GjY8QfzUU\"",
    "mtime": "2026-05-29T12:36:21.641Z",
    "size": 16583,
    "path": "../../.output/public/_build/assets/client-BSWCL-18.js"
  },
  "/_build/assets/categories-BkCeC_i2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4de-ShVJxXte0jQ7DYPU37QEvR2999U\"",
    "mtime": "2026-05-29T12:36:22.015Z",
    "size": 1246,
    "path": "../../.output/public/_build/assets/categories-BkCeC_i2.js.br"
  },
  "/_build/assets/client-BSWCL-18.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"fb3-SZQvJfbNMklPKOuIpd1bz7a3lWg\"",
    "mtime": "2026-05-29T12:36:22.016Z",
    "size": 4019,
    "path": "../../.output/public/_build/assets/client-BSWCL-18.js.br"
  },
  "/_build/assets/client-BSWCL-18.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"11a9-8iRS58TgvofWezj1x1PQZ98sr7I\"",
    "mtime": "2026-05-29T12:36:22.015Z",
    "size": 4521,
    "path": "../../.output/public/_build/assets/client-BSWCL-18.js.gz"
  },
  "/_build/assets/client-Bj2uilB_.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"7200-E4pvlmWAs3Mb8RvIgYyGI4YWQ8E\"",
    "mtime": "2026-05-29T12:36:21.641Z",
    "size": 29184,
    "path": "../../.output/public/_build/assets/client-Bj2uilB_.css"
  },
  "/_build/assets/client-Bj2uilB_.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1452-79jjr7dKxvkesqViTeCOPa/0BLc\"",
    "mtime": "2026-05-29T12:36:22.102Z",
    "size": 5202,
    "path": "../../.output/public/_build/assets/client-Bj2uilB_.css.br"
  },
  "/_build/assets/client-Bj2uilB_.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"17e1-UEdGKyC1D4mAXynBcoRi1GvK/YI\"",
    "mtime": "2026-05-29T12:36:22.015Z",
    "size": 6113,
    "path": "../../.output/public/_build/assets/client-Bj2uilB_.css.gz"
  },
  "/_build/assets/index-8yDtXffe.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"281f-bKm7HJSFnyGwSY/LLfO/cLBXtJ4\"",
    "mtime": "2026-05-29T12:36:21.643Z",
    "size": 10271,
    "path": "../../.output/public/_build/assets/index-8yDtXffe.js"
  },
  "/_build/assets/index-8yDtXffe.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a6c-lqUEGx5ikq47YFa84mASPc7PYb0\"",
    "mtime": "2026-05-29T12:36:22.145Z",
    "size": 2668,
    "path": "../../.output/public/_build/assets/index-8yDtXffe.js.br"
  },
  "/_build/assets/index-8yDtXffe.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"be0-i0gG+oTsQ5C+CHVTq2suscDQK5I\"",
    "mtime": "2026-05-29T12:36:22.092Z",
    "size": 3040,
    "path": "../../.output/public/_build/assets/index-8yDtXffe.js.gz"
  },
  "/_build/assets/index-BMQsBNWx.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1f36-xzLd7/fMGVDBiVR6n89qpMFKGp0\"",
    "mtime": "2026-05-29T12:36:21.642Z",
    "size": 7990,
    "path": "../../.output/public/_build/assets/index-BMQsBNWx.js"
  },
  "/_build/assets/index-BMQsBNWx.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"960-P3oxMfhzVF6lJEIgJJztdFxRO8Y\"",
    "mtime": "2026-05-29T12:36:22.103Z",
    "size": 2400,
    "path": "../../.output/public/_build/assets/index-BMQsBNWx.js.br"
  },
  "/_build/assets/index-BMQsBNWx.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a9e-BSoR4vQzU2VSWdO5mx2M2Swb1LM\"",
    "mtime": "2026-05-29T12:36:22.099Z",
    "size": 2718,
    "path": "../../.output/public/_build/assets/index-BMQsBNWx.js.gz"
  },
  "/_build/assets/index-C_2M8h-n.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"15ed-hjRaigSBVburajlmjbm0immYvHg\"",
    "mtime": "2026-05-29T12:36:21.643Z",
    "size": 5613,
    "path": "../../.output/public/_build/assets/index-C_2M8h-n.js"
  },
  "/_build/assets/index-C_2M8h-n.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"717-CyqPaeD1nfID4EAUKyvE3K91sEA\"",
    "mtime": "2026-05-29T12:36:22.180Z",
    "size": 1815,
    "path": "../../.output/public/_build/assets/index-C_2M8h-n.js.br"
  },
  "/_build/assets/index-C_2M8h-n.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"81a-0TnlmUE1AP6qEVsAFiQ8Wx85D34\"",
    "mtime": "2026-05-29T12:36:22.103Z",
    "size": 2074,
    "path": "../../.output/public/_build/assets/index-C_2M8h-n.js.gz"
  },
  "/_build/assets/index-CdWP7z1F.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2381-lO9FUOqvjocXEip62N8BLf0HPRo\"",
    "mtime": "2026-05-29T12:36:21.643Z",
    "size": 9089,
    "path": "../../.output/public/_build/assets/index-CdWP7z1F.js"
  },
  "/_build/assets/index-CdWP7z1F.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a77-vCLrJvRoaq0lfe0riQOfZ0UrR1k\"",
    "mtime": "2026-05-29T12:36:22.192Z",
    "size": 2679,
    "path": "../../.output/public/_build/assets/index-CdWP7z1F.js.br"
  },
  "/_build/assets/index-CdWP7z1F.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bc4-gqexaYd4PzFkwI+jwlVf6udxUXM\"",
    "mtime": "2026-05-29T12:36:22.145Z",
    "size": 3012,
    "path": "../../.output/public/_build/assets/index-CdWP7z1F.js.gz"
  },
  "/_build/assets/index-DGlhxrIS.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"116b-32JXbfMRgQd6fqfvpvh4qjiwaa0\"",
    "mtime": "2026-05-29T12:36:21.644Z",
    "size": 4459,
    "path": "../../.output/public/_build/assets/index-DGlhxrIS.js"
  },
  "/_build/assets/index-DGlhxrIS.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"635-b4T/Ie9j9KFfq6iJUQOpNjyHRvQ\"",
    "mtime": "2026-05-29T12:36:22.191Z",
    "size": 1589,
    "path": "../../.output/public/_build/assets/index-DGlhxrIS.js.br"
  },
  "/_build/assets/index-DGlhxrIS.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"720-sQu4kOiQOlYMm3RFmi9c5Arh38A\"",
    "mtime": "2026-05-29T12:36:22.180Z",
    "size": 1824,
    "path": "../../.output/public/_build/assets/index-DGlhxrIS.js.gz"
  },
  "/_build/assets/index-DMVlXuEY.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"cac-to223SBvzL5CwKA9tJ7Eq6BKM40\"",
    "mtime": "2026-05-29T12:36:21.644Z",
    "size": 3244,
    "path": "../../.output/public/_build/assets/index-DMVlXuEY.js"
  },
  "/_build/assets/index-DMVlXuEY.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"48d-UK5LyjWJ2PeUcpGuq9tz0qOR+hg\"",
    "mtime": "2026-05-29T12:36:22.196Z",
    "size": 1165,
    "path": "../../.output/public/_build/assets/index-DMVlXuEY.js.br"
  },
  "/_build/assets/index-DSnpX0nD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"215e-tjM3WugJ2z/inseO51kLBjz/UlQ\"",
    "mtime": "2026-05-29T12:36:21.644Z",
    "size": 8542,
    "path": "../../.output/public/_build/assets/index-DSnpX0nD.js"
  },
  "/_build/assets/index-DMVlXuEY.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"52b-e2K0JV/HjcarISKRxs5H7cvSuwM\"",
    "mtime": "2026-05-29T12:36:22.191Z",
    "size": 1323,
    "path": "../../.output/public/_build/assets/index-DMVlXuEY.js.gz"
  },
  "/_build/assets/index-DSnpX0nD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a0b-1PpxCtwHD9aRCZ9vBqiuVWdCaiY\"",
    "mtime": "2026-05-29T12:36:22.198Z",
    "size": 2571,
    "path": "../../.output/public/_build/assets/index-DSnpX0nD.js.br"
  },
  "/_build/assets/index-DSnpX0nD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b68-fztsqS9NXdF9v1tRPtSG9au5oXA\"",
    "mtime": "2026-05-29T12:36:22.191Z",
    "size": 2920,
    "path": "../../.output/public/_build/assets/index-DSnpX0nD.js.gz"
  },
  "/_build/assets/index-DYHrNj-5.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1dac-2BfrL1na7VOuuzMHK9PNt5xjvs0\"",
    "mtime": "2026-05-29T12:36:21.648Z",
    "size": 7596,
    "path": "../../.output/public/_build/assets/index-DYHrNj-5.js"
  },
  "/_build/assets/index-DYHrNj-5.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a35-nue1slt03lJ18l8ILUPI6E6YSr4\"",
    "mtime": "2026-05-29T12:36:22.368Z",
    "size": 2613,
    "path": "../../.output/public/_build/assets/index-DYHrNj-5.js.br"
  },
  "/_build/assets/index-DYHrNj-5.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b7a-6f8AgTx7GDYTaQHmM7ZrojakmHs\"",
    "mtime": "2026-05-29T12:36:22.212Z",
    "size": 2938,
    "path": "../../.output/public/_build/assets/index-DYHrNj-5.js.gz"
  },
  "/_build/assets/index-DecLnjWw.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"194a-pwlbs8BHeOe5X2K/hcaBM5oRZoU\"",
    "mtime": "2026-05-29T12:36:21.644Z",
    "size": 6474,
    "path": "../../.output/public/_build/assets/index-DecLnjWw.js"
  },
  "/_build/assets/index-DecLnjWw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"719-mzpQoCm0cb9d0ebYUOo8pCOyoa0\"",
    "mtime": "2026-05-29T12:36:22.269Z",
    "size": 1817,
    "path": "../../.output/public/_build/assets/index-DecLnjWw.js.br"
  },
  "/_build/assets/index-DecLnjWw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"81d-GMSQnnlM7wfvjUDr/JcO580ofQs\"",
    "mtime": "2026-05-29T12:36:22.257Z",
    "size": 2077,
    "path": "../../.output/public/_build/assets/index-DecLnjWw.js.gz"
  },
  "/_build/assets/index-KBzOSCQT.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"343b-jWxRSSrB3NUENmvCSV39vqtljkA\"",
    "mtime": "2026-05-29T12:36:21.644Z",
    "size": 13371,
    "path": "../../.output/public/_build/assets/index-KBzOSCQT.js"
  },
  "/_build/assets/index-KBzOSCQT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1420-n/AFjgzi/apH6eitJnBW2HB28Y0\"",
    "mtime": "2026-05-29T12:36:22.404Z",
    "size": 5152,
    "path": "../../.output/public/_build/assets/index-KBzOSCQT.js.br"
  },
  "/_build/assets/index-KBzOSCQT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"163b-j7ZkRGpxK347Iy8p+9w9WX8gKZw\"",
    "mtime": "2026-05-29T12:36:22.269Z",
    "size": 5691,
    "path": "../../.output/public/_build/assets/index-KBzOSCQT.js.gz"
  },
  "/_build/assets/login-DyyTh3kK.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a21-lWvSOzR2SiorIP5seKURoSUrYqc\"",
    "mtime": "2026-05-29T12:36:21.645Z",
    "size": 2593,
    "path": "../../.output/public/_build/assets/login-DyyTh3kK.js"
  },
  "/_build/assets/login-DyyTh3kK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3e8-qvnI27UNRAr/ao6NZJKJecMPgS4\"",
    "mtime": "2026-05-29T12:36:22.285Z",
    "size": 1000,
    "path": "../../.output/public/_build/assets/login-DyyTh3kK.js.br"
  },
  "/_build/assets/login-DyyTh3kK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4ab-WDkz2OtYGcXuPZnyR/OOLA5CVdg\"",
    "mtime": "2026-05-29T12:36:22.285Z",
    "size": 1195,
    "path": "../../.output/public/_build/assets/login-DyyTh3kK.js.gz"
  },
  "/_build/assets/notifications-DmWhTXZv.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"9f5-3R88KUQmoWD8w7SArte3pTaZvrU\"",
    "mtime": "2026-05-29T12:36:21.645Z",
    "size": 2549,
    "path": "../../.output/public/_build/assets/notifications-DmWhTXZv.js"
  },
  "/_build/assets/notifications-DmWhTXZv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"40f-RwFjbljpHqQ1LvBAttDk5T501+8\"",
    "mtime": "2026-05-29T12:36:22.298Z",
    "size": 1039,
    "path": "../../.output/public/_build/assets/notifications-DmWhTXZv.js.br"
  },
  "/_build/assets/notifications-DmWhTXZv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"49e-UKDROQNuQ1IdomWl0eF2ZWy9bYA\"",
    "mtime": "2026-05-29T12:36:22.298Z",
    "size": 1182,
    "path": "../../.output/public/_build/assets/notifications-DmWhTXZv.js.gz"
  },
  "/_build/assets/preload-helper-CM3UJVvY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3e0-Q0Bp0QjKFMyDOuO3rqIIPlfnrHI\"",
    "mtime": "2026-05-29T12:36:21.645Z",
    "size": 992,
    "path": "../../.output/public/_build/assets/preload-helper-CM3UJVvY.js"
  },
  "/_build/assets/utils-DIK23y8C.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"7cf-vWySooPTiqaYIL+qSiPM1QwrW4Y\"",
    "mtime": "2026-05-29T12:36:21.647Z",
    "size": 1999,
    "path": "../../.output/public/_build/assets/utils-DIK23y8C.js"
  },
  "/_build/assets/utils-DIK23y8C.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"33a-3uJxqytV7n3JDswAvGO6z87UIyM\"",
    "mtime": "2026-05-29T12:36:22.358Z",
    "size": 826,
    "path": "../../.output/public/_build/assets/utils-DIK23y8C.js.br"
  },
  "/_build/assets/utils-DIK23y8C.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3ac-ler+/plr2xH6CbPcWVRl3EsgPRU\"",
    "mtime": "2026-05-29T12:36:22.358Z",
    "size": 940,
    "path": "../../.output/public/_build/assets/utils-DIK23y8C.js.gz"
  },
  "/_server/assets/app-Bj2uilB_.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"7200-E4pvlmWAs3Mb8RvIgYyGI4YWQ8E\"",
    "mtime": "2026-05-29T12:36:21.661Z",
    "size": 29184,
    "path": "../../.output/public/_server/assets/app-Bj2uilB_.css"
  },
  "/_server/assets/app-Bj2uilB_.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1452-79jjr7dKxvkesqViTeCOPa/0BLc\"",
    "mtime": "2026-05-29T12:36:22.544Z",
    "size": 5202,
    "path": "../../.output/public/_server/assets/app-Bj2uilB_.css.br"
  },
  "/_server/assets/app-Bj2uilB_.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"17e1-UEdGKyC1D4mAXynBcoRi1GvK/YI\"",
    "mtime": "2026-05-29T12:36:22.368Z",
    "size": 6113,
    "path": "../../.output/public/_server/assets/app-Bj2uilB_.css.gz"
  },
  "/_server/assets/app-DVO3QTys.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"38c-dzRv7zLvND59+R08kU3K5xsYfH0\"",
    "mtime": "2026-05-29T12:36:22.368Z",
    "size": 908,
    "path": "../../.output/public/_server/assets/app-DVO3QTys.js.br"
  },
  "/_server/assets/app-DVO3QTys.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"403-qV1dOXkLRSl2ZH0U4v5mhm8cMLI\"",
    "mtime": "2026-05-29T12:36:22.368Z",
    "size": 1027,
    "path": "../../.output/public/_server/assets/app-DVO3QTys.js.gz"
  },
  "/_server/assets/server-fns-CHZUKvG_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"11e3-BqDgYOYupHehoIoI+Zc9wxerZNc\"",
    "mtime": "2026-05-29T12:36:22.443Z",
    "size": 4579,
    "path": "../../.output/public/_server/assets/server-fns-CHZUKvG_.js.br"
  },
  "/_server/assets/server-fns-CHZUKvG_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"13e4-ZnzLzqD4s0T1V1bZpEchVhE2htE\"",
    "mtime": "2026-05-29T12:36:22.401Z",
    "size": 5092,
    "path": "../../.output/public/_server/assets/server-fns-CHZUKvG_.js.gz"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _jtUFWN = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
function Ie$1(e) {
  let s;
  const t = I(e), n = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(t, { ...n, body: e.node.req.body }) : new Request(t, { ...n, get body() {
    return s || (s = Ge$1(e), s);
  } });
}
function Oe$1(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: Ie$1(e), url: I(e) }, e.web.request;
}
function Ue() {
  return Qe();
}
const L = /* @__PURE__ */ Symbol("$HTTPEvent");
function Ne(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[L]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function c(e) {
  return function(...s) {
    var _a;
    let t = s[0];
    if (Ne(t)) s[0] = t instanceof H3Event || t.__is_event__ ? t : t[L];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (t = Ue(), !t) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      s.unshift(t);
    }
    return e(...s);
  };
}
const I = c(getRequestURL$1), Me = c(getRequestIP), w = c(setResponseStatus$1), T$1 = c(getResponseStatus), je = c(getResponseStatusText), y = c(getResponseHeaders), E$1 = c(getResponseHeader$1), De = c(setResponseHeader$1), O = c(appendResponseHeader$1), Be = c(parseCookies), Je = c(getCookie), Xe = c(setCookie), h = c(setHeader), Ge$1 = c(getRequestWebStream), Ke = c(removeResponseHeader$1), Ve = c(Oe$1);
function Ze() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function Qe() {
  return Ze().use().event;
}
const b$1 = "Invariant Violation", { setPrototypeOf: Ye = function(e, s) {
  return e.__proto__ = s, e;
} } = Object;
let P$1 = class P extends Error {
  constructor(s = b$1) {
    super(typeof s == "number" ? `${b$1}: ${s} (see https://github.com/apollographql/invariant-packages)` : s);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", b$1);
    Ye(this, P.prototype);
  }
};
function et(e, s) {
  if (!e) throw new P$1(s);
}
const v = "solidFetchEvent";
function tt(e) {
  return { request: Ve(e), response: ot(e), clientAddress: Me(e), locals: {}, nativeEvent: e };
}
function st(e) {
  return { ...e };
}
function rt(e) {
  if (!e.context[v]) {
    const s = tt(e);
    e.context[v] = s;
  }
  return e.context[v];
}
function q(e, s) {
  for (const [t, n] of s.entries()) O(e, t, n);
}
class nt {
  constructor(s) {
    __publicField$1(this, "event");
    this.event = s;
  }
  get(s) {
    const t = E$1(this.event, s);
    return Array.isArray(t) ? t.join(", ") : t || null;
  }
  has(s) {
    return this.get(s) !== null;
  }
  set(s, t) {
    return De(this.event, s, t);
  }
  delete(s) {
    return Ke(this.event, s);
  }
  append(s, t) {
    O(this.event, s, t);
  }
  getSetCookie() {
    const s = E$1(this.event, "Set-Cookie");
    return Array.isArray(s) ? s : [s];
  }
  forEach(s) {
    return Object.entries(y(this.event)).forEach(([t, n]) => s(Array.isArray(n) ? n.join(", ") : n, t, this));
  }
  entries() {
    return Object.entries(y(this.event)).map(([s, t]) => [s, Array.isArray(t) ? t.join(", ") : t])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(y(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(y(this.event)).map((s) => Array.isArray(s) ? s.join(", ") : s)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function ot(e) {
  return { get status() {
    return T$1(e);
  }, set status(s) {
    w(e, s);
  }, get statusText() {
    return je(e);
  }, set statusText(s) {
    w(e, T$1(e), s);
  }, headers: new nt(e) };
}
const U = [{ page: true, path: "/(app)", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app).tsx" }, { page: true, path: "/login", filePath: "/home/david/Work/zongii/web_solid/src/routes/login.tsx" }, { page: true, path: "/(app)/categories", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/categories.tsx" }, { page: true, path: "/(app)/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/index.tsx" }, { page: true, path: "/(app)/notifications", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/notifications.tsx" }, { page: true, path: "/(app)/customers/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/customers/[id].tsx" }, { page: true, path: "/(app)/customers/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/customers/index.tsx" }, { page: true, path: "/(app)/documents/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/documents/[id].tsx" }, { page: true, path: "/(app)/documents/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/documents/index.tsx" }, { page: true, path: "/(app)/gate-passes/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/gate-passes/[id].tsx" }, { page: true, path: "/(app)/gate-passes/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/gate-passes/index.tsx" }, { page: true, path: "/(app)/orders/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/orders/[id].tsx" }, { page: true, path: "/(app)/orders/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/orders/index.tsx" }, { page: true, path: "/(app)/picking/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/picking/[id].tsx" }, { page: true, path: "/(app)/picking/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/picking/index.tsx" }, { page: true, path: "/(app)/products/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/products/[id].tsx" }, { page: true, path: "/(app)/products/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/products/index.tsx" }, { page: true, path: "/(app)/sales/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/sales/[id].tsx" }, { page: true, path: "/(app)/sales/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/sales/index.tsx" }, { page: true, path: "/(app)/users/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/users/[id].tsx" }, { page: true, path: "/(app)/users/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/users/index.tsx" }], at = it(U.filter((e) => e.page));
function it(e) {
  function s(t, n, o, a) {
    const i = Object.values(t).find((u) => o.startsWith(u.id + "/"));
    return i ? (s(i.children || (i.children = []), n, o.slice(i.id.length)), t) : (t.push({ ...n, id: o, path: o.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), t);
  }
  return e.sort((t, n) => t.path.length - n.path.length).reduce((t, n) => s(t, n, n.path, n.path), []);
}
function ut(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
createRouter({ routes: U.reduce((e, s) => {
  if (!ut(s)) return e;
  let t = s.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, o) => `**:${o}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(t)) throw new Error(`Optional parameters are not supported in API routes: ${t}`);
  if (e[t]) throw new Error(`Duplicate API routes for "${t}" found at "${e[t].route.path}" and "${s.path}"`);
  return e[t] = { route: s }, e;
}, {}) });
var pt = " ";
const dt = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(pt), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function lt(e, s) {
  let { tag: t, attrs: { key: n, ...o } = { key: void 0 }, children: a } = e;
  return dt[t]({ attrs: { ...o, nonce: s }, key: n, children: a });
}
function ft(e, s, t, n = "default") {
  return lazy(async () => {
    var _a;
    {
      const a = (await e.import())[n], u = (await ((_a = s.inputs) == null ? void 0 : _a[e.src].assets())).filter((p) => p.tag === "style" || p.attrs.rel === "stylesheet");
      return { default: (p) => [...u.map((g) => lt(g)), createComponent(a, p)] };
    }
  });
}
function N() {
  function e(t) {
    return { ...t, ...t.$$route ? t.$$route.require().route : void 0, info: { ...t.$$route ? t.$$route.require().route.info : {}, filesystem: true }, component: t.$component && ft(t.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: t.children ? t.children.map(e) : void 0 };
  }
  return at.map(e);
}
let H$1;
const Ct = isServer ? () => getRequestEvent().routes : () => H$1 || (H$1 = N());
function ht(e) {
  const s = Je(e.nativeEvent, "flash");
  if (s) try {
    let t = JSON.parse(s);
    if (!t || !t.result) return;
    const n = [...t.input.slice(0, -1), new Map(t.input[t.input.length - 1])], o = t.error ? new Error(t.result) : t.result;
    return { input: n, url: t.url, pending: false, result: t.thrown ? void 0 : o, error: t.thrown ? o : void 0 };
  } catch (t) {
    console.error(t);
  } finally {
    Xe(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function gt(e) {
  const s = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await s.json(), assets: [...await s.inputs[s.handler].assets()], router: { submission: ht(e) }, routes: N(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const mt = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function Rt(e) {
  return e.status && mt.has(e.status) ? e.status : 302;
}
const yt = {}, $$1 = [AbortSignalPlugin, CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin], wt = 64, M = Feature.RegExp;
function j(e) {
  const s = new TextEncoder().encode(e), t = s.length, n = t.toString(16), o = "00000000".substring(0, 8 - n.length) + n, a = new TextEncoder().encode(`;0x${o};`), i = new Uint8Array(12 + t);
  return i.set(a), i.set(s, 12), i;
}
function _(e, s) {
  return new ReadableStream({ start(t) {
    crossSerializeStream(s, { scopeId: e, plugins: $$1, onSerialize(n, o) {
      t.enqueue(j(o ? `(${getCrossReferenceHeader(e)},${n})` : n));
    }, onDone() {
      t.close();
    }, onError(n) {
      t.error(n);
    } });
  } });
}
function St(e) {
  return new ReadableStream({ start(s) {
    toCrossJSONStream(e, { disabledFeatures: M, depthLimit: wt, plugins: $$1, onParse(t) {
      s.enqueue(j(JSON.stringify(t)));
    }, onDone() {
      s.close();
    }, onError(t) {
      s.error(t);
    } });
  } });
}
async function A$1(e) {
  return fromJSON(JSON.parse(e), { plugins: $$1, disabledFeatures: M });
}
async function bt(e) {
  const s = rt(e), t = s.request, n = t.headers.get("X-Server-Id"), o = t.headers.get("X-Server-Instance"), a = t.headers.has("X-Single-Flight"), i = new URL(t.url);
  let u, l;
  if (n) et(typeof n == "string", "Invalid server function"), [u, l] = decodeURIComponent(n).split("#");
  else if (u = i.searchParams.get("id"), l = i.searchParams.get("name"), !u || !l) return new Response(null, { status: 404 });
  const p = yt[u];
  let g;
  if (!p) return new Response(null, { status: 404 });
  g = await p.importer();
  const D = g[p.functionName];
  let f = [];
  if (!o || e.method === "GET") {
    const r = i.searchParams.get("args");
    if (r) {
      const d = await A$1(r);
      for (const m of d) f.push(m);
    }
  }
  if (e.method === "POST") {
    const r = t.headers.get("content-type"), d = e.node.req, m = d instanceof ReadableStream, B = d.body instanceof ReadableStream, J = m && d.locked || B && d.body.locked, X = m ? d : d.body, S = J ? t : new Request(t, { ...t, body: X });
    t.headers.get("x-serialized") ? f = await A$1(await S.text()) : (r == null ? void 0 : r.startsWith("multipart/form-data")) || (r == null ? void 0 : r.startsWith("application/x-www-form-urlencoded")) ? f.push(await S.formData()) : (r == null ? void 0 : r.startsWith("application/json")) && (f = await S.json());
  }
  try {
    let r = await provideRequestEvent(s, async () => (sharedConfig.context = { event: s }, s.locals.serverFunctionMeta = { id: u + "#" + l }, D(...f)));
    if (a && o && (r = await W$1(s, r)), r instanceof Response) {
      if (r.headers && r.headers.has("X-Content-Raw")) return r;
      o && (r.headers && q(e, r.headers), r.status && (r.status < 300 || r.status >= 400) && w(e, r.status), r.customBody ? r = await r.customBody() : r.body == null && (r = null));
    }
    if (!o) return C(r, t, f);
    return h(e, "x-serialized", "true"), h(e, "content-type", "text/javascript"), _(o, r);
    return St(r);
  } catch (r) {
    if (r instanceof Response) a && o && (r = await W$1(s, r)), r.headers && q(e, r.headers), r.status && (!o || r.status < 300 || r.status >= 400) && w(e, r.status), r.customBody ? r = r.customBody() : r.body == null && (r = null), h(e, "X-Error", "true");
    else if (o) {
      const d = r instanceof Error ? r.message : typeof r == "string" ? r : "true";
      h(e, "X-Error", d.replace(/[\r\n]+/g, ""));
    } else r = C(r, t, f, true);
    return o ? (h(e, "x-serialized", "true"), h(e, "content-type", "text/javascript"), _(o, r)) : r;
  }
}
function C(e, s, t, n) {
  const o = new URL(s.url), a = e instanceof Error;
  let i = 302, u;
  return e instanceof Response ? (u = new Headers(e.headers), e.headers.has("Location") && (u.set("Location", new URL(e.headers.get("Location"), o.origin + "").toString()), i = Rt(e))) : u = new Headers({ Location: new URL(s.headers.get("referer")).toString() }), e && u.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: o.pathname + o.search, result: a ? e.message : e, thrown: n, error: a, input: [...t.slice(0, -1), [...t[t.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: i, headers: u });
}
let x;
function vt(e) {
  var _a;
  const s = new Headers(e.request.headers), t = Be(e.nativeEvent), n = e.response.headers.getSetCookie();
  s.delete("cookie");
  let o = false;
  return ((_a = e.nativeEvent.node) == null ? void 0 : _a.req) && (o = true, e.nativeEvent.node.req.headers.cookie = ""), n.forEach((a) => {
    if (!a) return;
    const { maxAge: i, expires: u, name: l, value: p } = parseSetCookie(a);
    if (i != null && i <= 0) {
      delete t[l];
      return;
    }
    if (u != null && u.getTime() <= Date.now()) {
      delete t[l];
      return;
    }
    t[l] = p;
  }), Object.entries(t).forEach(([a, i]) => {
    s.append("cookie", `${a}=${i}`), o && (e.nativeEvent.node.req.headers.cookie += `${a}=${i};`);
  }), s;
}
async function W$1(e, s) {
  let t, n = new URL(e.request.headers.get("referer")).toString();
  s instanceof Response && (s.headers.has("X-Revalidate") && (t = s.headers.get("X-Revalidate").split(",")), s.headers.has("Location") && (n = new URL(s.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const o = st(e);
  return o.request = new Request(n, { headers: vt(e) }), await provideRequestEvent(o, async () => {
    await gt(o), x || (x = (await import('../build/app-DVO3QTys.mjs')).default), o.router.dataOnly = t || true, o.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = o, x();
      });
    } catch (u) {
      console.log(u);
    }
    const a = o.router.data;
    if (!a) return s;
    let i = false;
    for (const u in a) a[u] === void 0 ? delete a[u] : i = true;
    return i && (s instanceof Response ? s.customBody && (a._$value = s.customBody()) : (a._$value = s, s = new Response(null, { status: 200 })), s.customBody = () => a, s.headers.set("X-Single-Flight", "true")), s;
  });
}
const Wt = eventHandler$1(bt);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
const te = isServer ? (e) => {
  const t = getRequestEvent();
  return t.response.status = e.code, t.response.statusText = e.text, onCleanup(() => !t.nativeEvent.handled && !t.complete && (t.response.status = 200)), null;
} : (e) => null;
var se = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const re = (e) => {
  let t = false;
  const s = catchError(() => e.children, (r) => {
    console.error(r), t = !!r;
  });
  return t ? [ssr(se, ssrHydrationKey()), createComponent$1(te, { code: 500 })] : s;
};
var ne = " ";
const oe = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(ne), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function ae(e, t) {
  let { tag: s, attrs: { key: r, ...o } = { key: void 0 }, children: n } = e;
  return oe[s]({ attrs: { ...o, nonce: t }, key: r, children: n });
}
var E = ["<script", ">", "<\/script>"], $ = ["<script", ' type="module"', "><\/script>"];
const ie = ssr("<!DOCTYPE html>");
function pe(e) {
  const t = getRequestEvent(), s = t.nonce;
  return createComponent$1(NoHydration, { get children() {
    return [ie, createComponent$1(re, { get children() {
      return createComponent$1(e.document, { get assets() {
        return t.assets.map((r) => ae(r));
      }, get scripts() {
        return s ? [ssr(E, ssrHydrationKey() + ssrAttribute("nonce", escape(s, true), false), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr($, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(E, ssrHydrationKey(), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr($, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      } });
    } })];
  } });
}
function ue(e) {
  let t;
  const s = A(e), r = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(s, { ...r, body: e.node.req.body }) : new Request(s, { ...r, get body() {
    return t || (t = xe(e), t);
  } });
}
function ce(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: ue(e), url: A(e) }, e.web.request;
}
function de() {
  return Re();
}
const H = /* @__PURE__ */ Symbol("$HTTPEvent");
function le(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[H]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function a(e) {
  return function(...t) {
    var _a;
    let s = t[0];
    if (le(s)) t[0] = s instanceof H3Event || s.__is_event__ ? s : s[H];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (s = de(), !s) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(s);
    }
    return e(...t);
  };
}
const A = a(getRequestURL$1), he = a(getRequestIP), S = a(setResponseStatus$1), P = a(getResponseStatus), ge = a(getResponseStatusText), m = a(getResponseHeaders), T = a(getResponseHeader$1), fe = a(setResponseHeader$1), me = a(appendResponseHeader$1), ve = a(sendRedirect$1), xe = a(getRequestWebStream), be = a(removeResponseHeader$1), ye = a(ce);
function we() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function Re() {
  return we().use().event;
}
const W = [{ page: true, path: "/(app)", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app).tsx" }, { page: true, path: "/login", filePath: "/home/david/Work/zongii/web_solid/src/routes/login.tsx" }, { page: true, path: "/(app)/categories", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/categories.tsx" }, { page: true, path: "/(app)/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/index.tsx" }, { page: true, path: "/(app)/notifications", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/notifications.tsx" }, { page: true, path: "/(app)/customers/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/customers/[id].tsx" }, { page: true, path: "/(app)/customers/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/customers/index.tsx" }, { page: true, path: "/(app)/documents/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/documents/[id].tsx" }, { page: true, path: "/(app)/documents/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/documents/index.tsx" }, { page: true, path: "/(app)/gate-passes/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/gate-passes/[id].tsx" }, { page: true, path: "/(app)/gate-passes/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/gate-passes/index.tsx" }, { page: true, path: "/(app)/orders/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/orders/[id].tsx" }, { page: true, path: "/(app)/orders/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/orders/index.tsx" }, { page: true, path: "/(app)/picking/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/picking/[id].tsx" }, { page: true, path: "/(app)/picking/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/picking/index.tsx" }, { page: true, path: "/(app)/products/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/products/[id].tsx" }, { page: true, path: "/(app)/products/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/products/index.tsx" }, { page: true, path: "/(app)/sales/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/sales/[id].tsx" }, { page: true, path: "/(app)/sales/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/sales/index.tsx" }, { page: true, path: "/(app)/users/:id", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/users/[id].tsx" }, { page: true, path: "/(app)/users/", filePath: "/home/david/Work/zongii/web_solid/src/routes/(app)/users/index.tsx" }];
Ee(W.filter((e) => e.page));
function Ee(e) {
  function t(s, r, o, n) {
    const p = Object.values(s).find((i) => o.startsWith(i.id + "/"));
    return p ? (t(p.children || (p.children = []), r, o.slice(p.id.length)), s) : (s.push({ ...r, id: o, path: o.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), s);
  }
  return e.sort((s, r) => s.path.length - r.path.length).reduce((s, r) => t(s, r, r.path, r.path), []);
}
function $e(e, t) {
  const s = Pe.lookup(e);
  if (s && s.route) {
    const r = s.route, o = t === "HEAD" ? r.$HEAD || r.$GET : r[`$${t}`];
    if (o === void 0) return;
    const n = r.page === true && r.$component !== void 0;
    return { handler: o, params: s.params, isPage: n };
  }
}
function Se(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
const Pe = createRouter({ routes: W.reduce((e, t) => {
  if (!Se(t)) return e;
  let s = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (r, o) => `**:${o}`).split("/").map((r) => r.startsWith(":") || r.startsWith("*") ? r : encodeURIComponent(r)).join("/");
  if (/:[^/]*\?/g.test(s)) throw new Error(`Optional parameters are not supported in API routes: ${s}`);
  if (e[s]) throw new Error(`Duplicate API routes for "${s}" found at "${e[s].route.path}" and "${t.path}"`);
  return e[s] = { route: t }, e;
}, {}) }), b = "solidFetchEvent";
function Te(e) {
  return { request: ye(e), response: He(e), clientAddress: he(e), locals: {}, nativeEvent: e };
}
function ke(e) {
  if (!e.context[b]) {
    const t = Te(e);
    e.context[b] = t;
  }
  return e.context[b];
}
class _e {
  constructor(t) {
    __publicField(this, "event");
    this.event = t;
  }
  get(t) {
    const s = T(this.event, t);
    return Array.isArray(s) ? s.join(", ") : s || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, s) {
    return fe(this.event, t, s);
  }
  delete(t) {
    return be(this.event, t);
  }
  append(t, s) {
    me(this.event, t, s);
  }
  getSetCookie() {
    const t = T(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(m(this.event)).forEach(([s, r]) => t(Array.isArray(r) ? r.join(", ") : r, s, this));
  }
  entries() {
    return Object.entries(m(this.event)).map(([t, s]) => [t, Array.isArray(s) ? s.join(", ") : s])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(m(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(m(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function He(e) {
  return { get status() {
    return P(e);
  }, set status(t) {
    S(e, t);
  }, get statusText() {
    return ge(e);
  }, set statusText(t) {
    S(e, P(e), t);
  }, headers: new _e(e) };
}
const Ae = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function We(e) {
  return e.status && Ae.has(e.status) ? e.status : 302;
}
function qe(e, t, s = {}, r) {
  return eventHandler$1({ handler: (o) => {
    const n = ke(o);
    return provideRequestEvent(n, async () => {
      const p = $e(new URL(n.request.url).pathname, n.request.method);
      if (p) {
        const h = await p.handler.import(), v = n.request.method === "HEAD" ? h.HEAD || h.GET : h[n.request.method];
        n.params = p.params || {}, sharedConfig.context = { event: n };
        const w = await v(n);
        if (w !== void 0) return w;
        if (n.request.method !== "GET") throw new Error(`API handler for ${n.request.method} "${n.request.url}" did not return a response.`);
        if (!p.isPage) return;
      }
      const i = await t(n), g = typeof s == "function" ? await s(i) : { ...s };
      g.mode, g.nonce && (i.nonce = g.nonce);
      {
        const h = renderToString(() => (sharedConfig.context.event = i, e(i)), g);
        if (i.complete = true, i.response && i.response.headers.get("Location")) {
          const v = We(i.response);
          return ve(o, i.response.headers.get("Location"), v);
        }
        return h;
      }
    });
  } });
}
function ze(e, t, s) {
  return qe(e, Ce, t);
}
async function Ce(e) {
  const t = globalThis.MANIFEST.client;
  return Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], routes: [], complete: false, $islands: /* @__PURE__ */ new Set() });
}
var Ie = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Zongii Mining</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">', "</head>"], Oe = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const Ge = ze(() => createComponent$1(pe, { document: ({ assets: e, children: t, scripts: s }) => ssr(Oe, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(Ie, escape(e));
} }), escape(t), escape(s)) }));

const handlers = [
  { route: '', handler: _jtUFWN, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: Wt, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: Ge, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const nitroApp = useNitroApp();
const localFetch = nitroApp.localFetch;
const closePrerenderer = () => nitroApp.hooks.callHook("close");
trapUnhandledNodeErrors();

export { Ct as C, closePrerenderer as c, localFetch as l };
//# sourceMappingURL=nitro.mjs.map
