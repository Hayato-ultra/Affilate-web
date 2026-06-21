import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authLogin, authRegister, authLogout, authMe } from '../api';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'lumina_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
        setIsAdmin(parsed.user?.role === 'admin');
        if (parsed.token) {
          authMe(parsed.token).catch(() => {
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
            setToken(null);
            setIsAdmin(false);
          });
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((u: User | null, t: string | null) => {
    if (u && t) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authLogin(email, password);
    setUser(result.user);
    setToken(result.token);
    setIsAdmin(result.user.role === 'admin');
    persist(result.user, result.token);
  }, [persist]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authRegister(email, password, name);
    await login(email, password);
  }, [login, persist]);

  const logout = useCallback(async () => {
    if (token) {
      try { await authLogout(token); } catch {}
    }
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    persist(null, null);
  }, [token, persist]);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
