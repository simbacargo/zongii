import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { authAPI, pushTokenAPI } from '@/lib/api';
import { Storage } from '@/lib/storage';
import { registerForPushNotifications } from '@/lib/pushNotifications';

const INACTIVITY_LIMIT_MS = 72 * 60 * 60 * 1000; // 72 hours

export interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  full_name: string;
  email: string;
  mobile: string;
  role: 'staff' | 'sales' | 'accountant' | 'picker' | 'manager' | 'admin';
  is_admin: boolean;
  is_superuser: boolean;
  is_picker: boolean;
  is_sales: boolean;
  is_accountant: boolean;
  allowed_sections: string[];
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update lastActive whenever the app returns to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') Storage.setLastActive();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await Storage.getAccess();
      if (stored) {
        // Force logout if the app hasn't been used in 72 hours
        const lastActive = await Storage.getLastActive();
        const elapsed = lastActive ? Date.now() - Number(lastActive) : Infinity;
        if (elapsed > INACTIVITY_LIMIT_MS) {
          await Storage.clear();
          setIsLoading(false);
          return;
        }

        setToken(stored);
        try {
          const { data } = await authAPI.me();
          setUser(data);
          await Storage.setUser(data);
          await Storage.setLastActive();
          // Re-register push token in case it changed (new device/build)
          registerForPushNotifications(token => pushTokenAPI.register(token)).catch(() => {});
        } catch {
          await Storage.clear();
          setToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(username: string, password: string) {
    const { data } = await authAPI.login(username, password);
    await Storage.setTokens(data.access, data.refresh);
    await Storage.setLastActive();
    setToken(data.access);
    const me = await authAPI.me();
    setUser(me.data);
    await Storage.setUser(me.data);
    // Register push token after successful login (fire-and-forget)
    registerForPushNotifications(token => pushTokenAPI.register(token)).catch(() => {});
  }

  async function logout() {
    await Storage.clear();
    setToken(null);
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

// Convenience hook — returns true/false flags for common permission checks
export function usePermissions() {
  const { user } = useAuth();
  const isAdmin    = !!(user?.is_admin || user?.is_superuser);
  const isManager  = isAdmin || user?.role === 'manager';
  const isSales    = !!(user?.is_sales) || isManager;
  const isPicker   = !!(user?.is_picker) || isAdmin;
  const isAccountant = !!(user?.is_accountant) || isManager;

  const canApprove   = isManager;
  const canEditStock = isManager || isPicker;
  const canViewBilling = isAccountant;

  const sections = user?.allowed_sections ?? [];
  const hasSection = (key: string) =>
    isAdmin || sections.includes(key);

  return { isAdmin, isManager, isSales, isPicker, isAccountant, canApprove, canEditStock, canViewBilling, hasSection };
}
