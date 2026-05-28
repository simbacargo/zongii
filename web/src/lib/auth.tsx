import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from './api';

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  is_admin: boolean;
  is_superuser: boolean;
  is_picker: boolean;
  is_sales: boolean;
  is_accountant: boolean;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.me()
        .then(({ data }) => { setUser(data); })
        .catch(() => { localStorage.clear(); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username: string, password: string) {
    const { data } = await authAPI.login(username, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setToken(data.access);
    const me = await authAPI.me();
    setUser(me.data);
  }

  function logout() {
    localStorage.clear();
    setToken(null);
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

export function usePermissions() {
  const { user } = useAuth();
  const isAdmin      = !!(user?.is_admin || user?.is_superuser);
  const isManager    = isAdmin || user?.role === 'manager';
  const isSales      = !!(user?.is_sales) || isManager;
  const isPicker     = !!(user?.is_picker) || isAdmin;
  const isAccountant = !!(user?.is_accountant) || isManager;
  return { isAdmin, isManager, isSales, isPicker, isAccountant };
}
