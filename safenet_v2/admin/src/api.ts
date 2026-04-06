import axios from 'axios';

import { useAuthStore } from './stores/auth';

const RENDER_BACKEND = 'https://safenet-api-y4se.onrender.com';

const envBase = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();
const BASE_URL = (envBase || RENDER_BACKEND).replace(/\/$/, '');
export { BASE_URL };

const isDev = import.meta.env.DEV;
const useDevProxy = isDev && !import.meta.env.VITE_BACKEND_URL;
const apiBaseURL = useDevProxy ? '/api/v1' : `${BASE_URL}/api/v1`;
const fallbackBaseURL = `${RENDER_BACKEND}/api/v1`;

const api = axios.create({
  baseURL: apiBaseURL,
  // Render can cold-start slowly; 60s avoids false "timeout" login failures.
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().jwt;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401 (but not failed admin password — that must show "Invalid" on the form)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const cfg = err?.config as { __fallbackTried?: boolean; baseURL?: string } | undefined;
    const timedOut = err?.code === 'ECONNABORTED' || String(err?.message || '').toLowerCase().includes('timeout');
    const networkish = !err?.response;
    const canRetryToFallback =
      Boolean(cfg) &&
      !useDevProxy &&
      !cfg?.__fallbackTried &&
      cfg?.baseURL !== fallbackBaseURL &&
      (timedOut || networkish);

    if (canRetryToFallback && cfg) {
      cfg.__fallbackTried = true;
      cfg.baseURL = fallbackBaseURL;
      return api.request(cfg);
    }

    if (err.response?.status === 401) {
      const reqUrl = String(err.config?.url ?? '');
      if (reqUrl.includes('/auth/admin-login')) {
        return Promise.reject(err);
      }
      useAuthStore.getState().signOut();
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
