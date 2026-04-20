import axios from 'axios';

import { useAuthStore } from './stores/auth';

function resolveBackendBaseUrl() {
  const envBase = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();
  if (envBase) return envBase.replace(/\/$/, '');
  return 'https://safenet-api-y4se.onrender.com';
}

const BASE_URL = resolveBackendBaseUrl();
export { BASE_URL };

const isDev = import.meta.env.DEV;
const useDevProxy = isDev && !import.meta.env.VITE_BACKEND_URL;
const apiBaseURL = useDevProxy ? '/api/v1' : `${BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

export function safeJsonResponse<T>(data: unknown, fallback: T): T {
  if (data === null || data === undefined) return fallback;
  if (typeof data === 'object') return data as T;
  return fallback;
}

export function safeArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return [];
}

let warmupPromise: Promise<void> | null = null;

export function warmBackendOnce(): Promise<void> {
  if (warmupPromise) return warmupPromise;
  warmupPromise = (async () => {
    try {
      await axios.get(`${BASE_URL}/health`, { timeout: 15_000 }); // warmup only
    } catch {
      // ignore warmup failures
    }
  })();
  return warmupPromise;
}

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().jwt;
  const adminKey = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (adminKey) config.headers['X-Admin-Key'] = adminKey;
  return config;
});

// Response interceptor: retry once on transient errors, redirect on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const reqUrl = String(err.config?.url ?? '');
    const status = err.response?.status as number | undefined;

    // Never retry client errors
    const noRetry = [400, 401, 403, 404, 422].includes(status as number);
    const isTransient =
      err.code === 'ECONNABORTED' ||
      err.code === 'ERR_NETWORK' ||
      String(err.message || '').toLowerCase().includes('timeout') ||
      String(err.message || '').toLowerCase().includes('network') ||
      [502, 503, 504].includes(status as number);

    if (isTransient && !noRetry && !err.config?._retried) {
      err.config._retried = true;
      try {
        return await axios({ ...err.config, timeout: 30_000 });
      } catch (_) {
        // fall through to normal error handling
      }
    }

    if (status === 401) {
      if (reqUrl.includes('/auth/admin-login')) return Promise.reject(err);
      useAuthStore.getState().signOut();
      if (!window.location.pathname.endsWith('/login')) window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;
