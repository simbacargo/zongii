import { writable } from 'svelte/store';

function getHash(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/login';
}

export const currentPath = writable<string>(getHash());

window.addEventListener('hashchange', () => currentPath.set(getHash()));

export function navigate(path: string) {
  if (window.location.hash.replace(/^#/, '') === path) return;
  window.location.hash = path;
}

export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    if (pp.startsWith(':')) {
      params[pp.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (pp !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
