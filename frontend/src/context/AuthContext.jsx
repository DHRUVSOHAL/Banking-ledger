import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../service/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authService
      .me()
      .then((res) => setUser(res.data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      setUser(res.data?.user || null);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
      throw err;
    }
  }, []);

  const register = useCallback(async (credentials) => {
    setError(null);
    try {
      const res = await authService.register(credentials);
      setUser(res.data?.user || null);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setError(null);
    try {
      return (await authService.forgotPassword(email)).data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (data) => {
    setError(null);
    try {
      return (await authService.verifyOtp(data)).data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword) => {
    setError(null);
    try {
      return (await authService.resetPassword(newPassword)).data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
      throw err;
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}