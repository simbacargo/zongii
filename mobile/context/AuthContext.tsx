import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';
import { Storage } from '@/lib/storage';

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  full_name: string;
  email: string;
  mobile: string;
  role: 'staff' | 'manager' | 'admin';
  is_admin: boolean;
  is_superuser: boolean;
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

  useEffect(() => {
    (async () => {
      const stored = await Storage.getAccess();
      if (stored) {
        setToken(stored);
        try {
          const { data } = await authAPI.me();
          setUser(data);
          await Storage.setUser(data);
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
    setToken(data.access);
    const me = await authAPI.me();
    setUser(me.data);
    await Storage.setUser(me.data);
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
