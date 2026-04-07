import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

type User = {
  id: string;
  name: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean | null;
  set_isAdmin: (isAdmin: boolean | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WS_URL = "ws://192.168.1.191:8080/ws/socket_server/";

export function AuthProvider({ children }: { children: React.ReactElement }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [current_store, set_current_store] = useState<string | null>("");
  const [isAdmin, set_isAdmin] = useState<boolean | null>(false);

  // Ref persists the socket instance without triggering re-renders
  const socketRef = useRef<WebSocket | null>(null);

  const login = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("msaidizi_user", JSON.stringify(user));
  };

  const logout = () => {
    setLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("msaidizi_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setLoading(false);
  };

  const [theme, setTheme] = useState<string>("light");
  const [language, setLanguage] = useState<string>();

  // 1. Handle Hydration (Restoring session from LocalStorage)
  useEffect(() => {
    const savedAccessToken = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("msaidizi_user");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedCurrentStore = localStorage?.getItem("current_store");
    setTheme(localStorage.getItem("theme") || "light");
    setLanguage(localStorage.getItem("lang") || "en");
    if (savedAccessToken && savedUser && savedUser !== "[object Object]") {
      try {
        const the_user = JSON.parse(savedUser);
        setUser(the_user);
        setAccessToken(savedAccessToken);
        setRefreshToken(savedRefreshToken);
        set_current_store(savedCurrentStore);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Auth initialization error", e);
        logout(); // Clean up corrupted storage
      }
    }
    setLoading(false);
  }, []);


  // Apply theme to the HTML tag whenever it changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem("lang", language);
    // Logic for i18n changeLanguage(language) would go here
  }, [language]);
  
   useEffect(() => {
    localStorage.setItem("current_store", current_store || "");
    // Logic for i18n changeLanguage(language) would go here
  }, [current_store]);
  
  // 2. Handle WebSocket Lifecycle
  // useEffect(() => {
  //   // Only attempt connection once loading is finished and user is authed
  //   if (!loading && isAuthenticated && !socketRef.current) {
  //     console.log("Connecting to WebSocket...");

  //     const ws = new WebSocket("WS_URL");

  //     ws.onopen = () => {
  //       console.log("WebSocket connection established");
  //       ws.send(
  //         JSON.stringify({
  //           type: "authenticate",
  //           token: accessToken,
  //         }),
  //       );
  //     };

  //     ws.onmessage = (event) => {
  //       const data = JSON.parse(event.data);
  //       console.log("Message from server:", data);
  //     };

  //     ws.onerror = (error) => console.error("WebSocket Error:", error);

  //     ws.onclose = () => {
  //       console.log("WebSocket connection closed");
  //       socketRef.current = null;
  //     };

  //     socketRef.current = ws;
  //   }

  //   // Cleanup when component unmounts or auth state changes
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.close();
  //       socketRef.current = null;
  //     }
  //   };
  // }, [isAuthenticated, loading]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, accessToken, refreshToken , user, login, logout, theme, setTheme, language, setLanguage,current_store, set_current_store, isAdmin, set_isAdmin}}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
