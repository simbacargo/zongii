import { createContext, useContext, onMount, JSX } from "solid-js";
import { createStore } from "solid-js/store";
import type { User } from "../types";
import { auth as authApi, setTokens, clearTokens, getAccessToken } from "../lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthCtx {
  state: AuthState;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore<AuthState>({
    user: null,
    loading: false,
    initialized: false,
  });

  async function init() {
    if (getAccessToken()) {
      setState("loading", true);
      try {
        const user = await authApi.me();
        setState({ user, loading: false, initialized: true });
      } catch {
        clearTokens();
        setState({ user: null, loading: false, initialized: true });
      }
    } else {
      setState({ user: null, loading: false, initialized: true });
    }
  }

  async function login(username: string, password: string): Promise<User> {
    setState("loading", true);
    const tokens = await authApi.login(username, password);
    setTokens(tokens);
    const user = await authApi.me();
    setState({ user, loading: false, initialized: true });
    return user;
  }

  function logout() {
    clearTokens();
    setState({ user: null, loading: false, initialized: true });
  }

  onMount(init);

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
