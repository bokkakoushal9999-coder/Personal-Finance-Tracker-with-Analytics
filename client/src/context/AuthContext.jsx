import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pft_token');
    const savedUser = localStorage.getItem('pft_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('pft_token');
        localStorage.removeItem('pft_user');
      }
    }

    setLoading(false);
  }, []);

  const persistAuth = (authToken, userData) => {
    localStorage.setItem('pft_token', authToken);
    localStorage.setItem('pft_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const login = async (credentialsOrToken, maybeUser) => {
    if (typeof credentialsOrToken === 'string' && maybeUser) {
      persistAuth(credentialsOrToken, maybeUser);
      return { token: credentialsOrToken, user: maybeUser };
    }

    const { data } = await api.post('/auth/login', credentialsOrToken);
    persistAuth(data.token, data.user);
    return data;
  };

  const register = async (credentialsOrToken, maybeUser) => {
    if (typeof credentialsOrToken === 'string' && maybeUser) {
      persistAuth(credentialsOrToken, maybeUser);
      return { token: credentialsOrToken, user: maybeUser };
    }

    const { data } = await api.post('/auth/register', credentialsOrToken);
    persistAuth(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pft_token');
    localStorage.removeItem('pft_user');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, loading, login, register, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
