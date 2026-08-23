import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth';
import { setToken } from '../api/client';

const AuthContext = createContext(null);

const USER_KEY = 'user';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const persistUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials);
    persistUser(data.user);
    return data;
  }, [persistUser]);

  const register = useCallback(async (credentials) => {
    const data = await registerApi(credentials);
    persistUser(data.user);
    return data;
  }, [persistUser]);

  const logout = useCallback(async () => {
    await logoutApi();
    setToken(null);
    persistUser(null);
  }, [persistUser]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
