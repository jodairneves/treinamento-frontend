import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/services.js';

const AuthContext = createContext(null);

function loadUser() {
  try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [loading, setLoading] = useState(!!localStorage.getItem('auth_token'));

  // Rehydrate user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(u => { setUser(u); localStorage.setItem('auth_user', JSON.stringify(u)); })
      .catch(() => { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const saveAuth = useCallback((data) => {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const loginBarbearia = useCallback(async (email, senha) => {
    const data = await authApi.loginBarbearia({ email, senha });
    saveAuth(data);
    return data.user;
  }, [saveAuth]);

  const loginCliente = useCallback(async (email, senha) => {
    const data = await authApi.loginCliente({ email, senha });
    saveAuth(data);
    return data.user;
  }, [saveAuth]);

  const registrarBarbearia = useCallback(async (formData) => {
    const data = await authApi.registrarBarbearia(formData);
    saveAuth(data);
    return data.user;
  }, [saveAuth]);

  const registrarCliente = useCallback(async (formData) => {
    const data = await authApi.registrarCliente(formData);
    saveAuth(data);
    return data.user;
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  const value = {
    user, loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCliente: user?.role === 'cliente',
    loginBarbearia, loginCliente,
    registrarBarbearia, registrarCliente,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
