import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY, USER_KEY, registerUnauthorizedHandler } from '../services/api';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

/** Reads `exp` without verifying the signature — that is the server's job, not the browser's. */
function isExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // Guards must not redirect while this is true, or a refresh on a protected page bounces to login.
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  // Rehydrate before the first paint of any guarded route.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser && !isExpired(storedToken)) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else if (storedToken) {
      clearSession();
    }
    setLoading(false);
  }, [clearSession]);

  const persist = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      persist(data.token, data.user);
      return data.user;
    },
    [persist],
  );

  const register = useCallback((payload) => authService.register(payload), []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  /** Keeps the sidebar name in step after a profile edit without forcing a re-login. */
  const updateUser = useCallback((patch) => {
    setUser((current) => {
      const next = { ...current, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
    }),
    [user, token, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

export { api };
