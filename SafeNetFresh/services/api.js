import axios from 'axios';
import axiosRetry from 'axios-retry';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getCurrentTokenStore, clearTokenStore } from './tokenStore';

const inferExpoHostURL = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost ||
    '';
  const host = String(hostUri || '').split(':')[0].trim();
  return host ? `http://${host}:8000` : null;
};

const getBackendURL = () => {
  try {
    const envPublic =
      typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL;
    if (envPublic && String(envPublic).trim().startsWith('http')) {
      const normalized = String(envPublic).trim().replace(/\/$/, '');
      if (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/i.test(normalized)) {
        if (__DEV__) {
          const inferred = inferExpoHostURL();
          if (inferred) return inferred;
        } else {
          return 'https://safenet-api-y4se.onrender.com';
        }
      }
      return normalized;
    }
  } catch (_) { /* ignore */ }

  const extraUrl =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.API_URL ||
    Constants.expoConfig?.extra?.BACKEND_URL;
  if (extraUrl && String(extraUrl).trim().startsWith('http')) {
    const normalized = String(extraUrl).trim().replace(/\/$/, '');
    if (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/i.test(normalized)) {
      if (__DEV__) {
        const inferred = inferExpoHostURL();
        if (inferred) return inferred;
      } else {
        return 'https://safenet-api-y4se.onrender.com';
      }
    }
    return normalized;
  }

  return 'https://safenet-api-y4se.onrender.com';
};

export const BASE_URL = getBackendURL();
export const BACKEND_URL = BASE_URL;

function _isLikelyLocalApi(url) {
  if (!url || typeof url !== 'string') return false;
  if (/localhost|127\.0\.0\.1|10\.0\.2\.2/i.test(url)) return true;
  if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url)) return true;
  if (/onrender\.com|amazonaws\.com|vercel\.app/i.test(url)) return false;
  return /:\d{4,5}(\/|$)/i.test(url);
}

/** 30 s gives Render cold-starts enough headroom; warmup ping uses 15 s. */
const TIMEOUT_MS = 30000;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

let _warmupPromise = null;
let _isServerWaking = false;

export function warmBackendOnce() {
  if (_warmupPromise) return _warmupPromise;
  _isServerWaking = true;
  _warmupPromise = axios
    .get(`${BACKEND_URL}/health`, { timeout: 15000 }) // warmup only
    .then(() => { _isServerWaking = false; })
    .catch(() => { _isServerWaking = false; });
  return _warmupPromise;
}

export function isServerWaking() { return _isServerWaking; }

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

function shouldTreatAsUnauthorized(error) {
  const status = error?.response?.status;
  if (status === 401) return true;
  if (status !== 404) return false;
  const detail = String(error?.response?.data?.detail || '').toLowerCase();
  return detail.includes('user not found');
}

api.interceptors.request.use(async (config) => {
  const token = await getCurrentTokenStore();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldTreatAsUnauthorized(error)) {
      await clearTokenStore();
      if (onUnauthorized) onUnauthorized();
    }
    throw error;
  }
);

axiosRetry(api, {
  retries: 1,
  retryDelay: () => 2000,
  retryCondition: (error) => {
    // Never retry client errors
    const status = error?.response?.status;
    if ([400, 401, 403, 404, 422].includes(status)) return false;
    const code = error?.code;
    const msg = String(error?.message || '').toLowerCase();
    if (code === 'ECONNABORTED' || code === 'ERR_NETWORK') return true;
    if (msg.includes('timeout') || msg.includes('network')) return true;
    return [502, 503, 504].includes(status);
  },
});

const unwrap = (res) => res.data;

/** User-facing message; never surfaces raw axios error objects. */
export function formatApiError(error) {
  const status = error?.response?.status;
  const detail = String(error?.response?.data?.detail || '').toLowerCase();
  if (status === 401 || (status === 404 && detail.includes('user not found'))) {
    return 'Your session expired. Please sign in again.';
  }
  if ([502, 503, 504].includes(status)) {
    return 'Unable to reach server right now. Please try again in a moment.';
  }
  if (!error?.response) {
    const msg = String(error?.message || '').toLowerCase();
    const isTimeout = error?.code === 'ECONNABORTED' || msg.includes('timeout');
    const isNetwork = error?.code === 'ERR_NETWORK' || msg.includes('network error');
    if (isTimeout) return 'Server is starting, please wait a few seconds.';
    if (isNetwork) return 'Unable to reach server right now. Check your connection.';
    return 'Unable to reach server right now. Check your internet connection and try again.';
  }
  const d = error?.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    const parts = d
      .map((x) => (typeof x?.msg === 'string' ? x.msg : typeof x?.message === 'string' ? x.message : null))
      .filter(Boolean);
    if (parts.length) return parts.join('\n');
  }
  if (status === 422) return 'Some information could not be saved. Please review your details and try again.';
  return 'Something went wrong. Please try again.';
}

export const auth = {
  sendOTP: async (phone) => unwrap(await api.post('/auth/send-otp', { phone_number: phone })),
  verifyOTP: async (phone, otp) => {
    const data = unwrap(await api.post('/auth/verify-otp', { phone_number: phone, otp }));
    return data;
  },
  refresh: async (refreshToken) => unwrap(await api.post('/auth/refresh', { refresh_token: refreshToken })),
};

export const gigProfile = {
  submit: async (body) => unwrap(await api.post('/profile', body)),
};

export const workers = {
  createProfile: async (body) => unwrap(await api.post('/workers/create', body)),
  getProfile: async () => unwrap(await api.get('/workers/me')),
  getDashboard: async (workerId) => unwrap(await api.get(`/workers/${workerId}/dashboard`)),
  getClaims: async (workerId, params = {}) =>
    unwrap(await api.get(`/workers/${workerId}/claims`, { params })),
  updateProfile: async (body) => unwrap(await api.put('/workers/update', body)),
  getWeeklyBreakdown: async () => unwrap(await api.get('/workers/weekly-breakdown')),
  listWeeklySummaries: async () => unwrap(await api.get('/workers/weekly-summaries')),
  getEarningsDna: async (workerId) =>
    workerId != null
      ? unwrap(await api.get(`/workers/${workerId}/earnings-dna`))
      : unwrap(await api.get('/workers/earnings-dna')),
  uploadGPSTrail: async (workerId, gpsTrail) =>
    unwrap(await api.post(`/workers/${workerId}/gps-trail`, gpsTrail)),
};

export const policies = {
  getCurrent: async () => unwrap(await api.get('/policies/current')),
  list: async () => unwrap(await api.get('/policies')),
  quote: async (workerId, tier) =>
    unwrap(await api.get('/policies/quote', { params: { worker_id: workerId, tier } })),
  activate: async (body) => unwrap(await api.post('/policies/activate', body)),
  createOrder: async (workerId, tier, policyId = null) =>
    unwrap(
      await api.post('/policies/create-order', {
        worker_id: workerId,
        tier,
        policy_id: policyId,
      })
    ),
  verifyPayment: async (body) => unwrap(await api.post('/policies/verify-payment', body)),
};

export const pools = {
  getHealth: async () => unwrap(await api.get('/pools/health')),
};

export const claims = {
  runSimulation: async ({ is_active, fraud_flag }) =>
    unwrap(await api.post('/simulation/run', { is_active, fraud_flag })),
  getActive: async () => {
    try {
      const raw = unwrap(await api.get('/claims/active'));
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.disruptions)) return raw.disruptions;
      return [];
    } catch { return []; }
  },
  getHistory: async () => {
    const raw = unwrap(await api.get('/claims/history'));
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  },
  getWorkerHistory: async (workerId, params = {}) => {
    const raw = unwrap(await api.get(`/workers/${workerId}/claims`, { params }));
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  },
  getPayouts: async (limit = 10) => {
    const raw = unwrap(await api.get('/claims/payouts', { params: { limit } }));
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  },
  downloadReceipt: async (claimId) =>
    api.get(`/claims/${encodeURIComponent(claimId)}/receipt`, { responseType: 'arraybuffer' }),
  getAiExplanation: async (claimId) =>
    unwrap(await api.get(`/claims/${encodeURIComponent(claimId)}/ai-explanation`)),
  submitDispute: async (claimId, text) =>
    unwrap(await api.post(`/claims/${encodeURIComponent(claimId)}/dispute`, { text })),
};

export const payouts = {
  getHistory: async () => {
    const raw = unwrap(await api.get('/claims/history'));
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  },
};

export const simulation = {
  run: async (body) => unwrap(await api.post('/simulation/disruptions/simulate', body)),
};

export const zones = {
  getForecastShield: async (zoneId) =>
    unwrap(await api.get(`/zones/${encodeURIComponent(zoneId)}/forecast-shield`)),
  getForecastDaily: async (zoneId) =>
    unwrap(await api.get(`/zones/${encodeURIComponent(zoneId)}/forecast-daily`)),
  detectFromGPS: async (lat, lng) =>
    unwrap(await api.get('/zones/detect', { params: { lat, lng } })),
  reverseGeocodeURL: (lat, lng) =>
    `${BACKEND_URL}/api/v1/geo/reverse?latitude=${encodeURIComponent(String(lat))}&longitude=${encodeURIComponent(String(lng))}`,
  getActiveDisruptions: async (zoneId) =>
    unwrap(await api.get(`/zones/${encodeURIComponent(zoneId)}/disruptions/active`)),
  getRiskMode: async (zoneId) =>
    unwrap(await api.get(`/zones/${encodeURIComponent(zoneId)}/risk-mode`)),
};

export const payments = {
  createPremiumOrder: async (tier, policyId = null) =>
    unwrap(await api.post('/payments/premium/order', { tier, policy_id: policyId })),
  verifyPremium: async (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    unwrap(
      await api.post('/payments/premium/verify', {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      })
    ),
  getHistory: async (page = 1, limit = 20) =>
    unwrap(await api.get('/payments/history', { params: { page, limit } })),
};

export const support = {
  query: async ({ user_id, message, type = 'custom', language = 'en', query_key = null }) =>
    unwrap(await api.post('/support/query', { user_id, message, type, language, query_key })),
  history: async (userId) =>
    unwrap(await api.get('/support/history', { params: { user_id: userId } })),
};

export const notifications = {
  list: async (userId, opts = {}) =>
    unwrap(await api.get('/notifications', { params: { user_id: userId, ntype: opts?.type } })),
  markRead: async (id) => unwrap(await api.post(`/notifications/mark-read/${id}`)),
  markAllRead: async () => unwrap(await api.post('/notifications/mark-all-read')),
  clearAll: async () => unwrap(await api.post('/notifications/clear-all')),
};

export default api;
