import axios from 'axios';
import { handleOfflineMock } from './mockData';

/**
 * Determine API Base URL dynamically:
 * 1. If VITE_API_URL is set (e.g. on Vercel pointing to Render backend), use it.
 * 2. Fall back to relative '/api' (handled by Vite dev proxy or same-domain hosts).
 */
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pft_token');

  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable or returning 404 (e.g. on Streamlit Cloud, initial demo preview, or network drop)
    if (!error.response || error.response.status === 404 || error.code === 'ERR_NETWORK') {
      const fallback = handleOfflineMock(error.config);
      if (fallback) {
        return Promise.resolve(fallback);
      }
    }

    if (error.response?.status === 401) {
      // Do not clear token if in demo evaluator session
      const token = localStorage.getItem('pft_token');
      if (!token || !token.includes('demo-jwt-token')) {
        localStorage.removeItem('pft_token');
        localStorage.removeItem('pft_user');
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register' &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
