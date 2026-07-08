import { writable, derived } from 'svelte/store';
import type { User } from '../types';
import { auth as authApi, setTokens, clearTokens, getAccessToken } from '../api';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: false,
    initialized: false,
  });

  return {
    subscribe,

    async init() {
      if (getAccessToken()) {
        update(s => ({ ...s, loading: true }));
        try {
          const user = await authApi.me();
          set({ user, loading: false, initialized: true });
        } catch {
          clearTokens();
          set({ user: null, loading: false, initialized: true });
        }
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    },

    async login(username: string, password: string) {
      update(s => ({ ...s, loading: true }));
      const tokens = await authApi.login(username, password);
      setTokens(tokens);
      const user = await authApi.me();
      set({ user, loading: false, initialized: true });
      return user;
    },

    logout() {
      clearTokens();
      set({ user: null, loading: false, initialized: true });
    },
  };
}

export const authStore = createAuthStore();
export const user = derived(authStore, $s => $s.user);
export const isAuthenticated = derived(authStore, $s => $s.user !== null);
