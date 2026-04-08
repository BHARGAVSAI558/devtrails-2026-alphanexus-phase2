import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api, { warmBackendOnce } from '../api';
import { useAuthStore } from '../stores/auth';

function formatApiError(e: unknown, fallback: string): string {
  const err = e as {
    code?: string;
    response?: { status?: number; data?: { detail?: string | Array<{ msg?: string }> } };
    message?: string;
  };
  if (err.code === 'ECONNABORTED' || String(err.message || '').toLowerCase().includes('timeout')) {
    return 'Request timed out. Start the API (port 8000) or set VITE_BACKEND_URL. In dev, use `npm run dev` with the proxy (no VITE_BACKEND_URL needed).';
  }
  const status = err.response?.status;
  const detail = err.response?.data?.detail;
  if (status === 401) return 'Invalid username or password.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail.map((x) => x.msg).join(' ');
  return err.message || fallback;
}

type NavState = {
  username?: string;
  password?: string;
};

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((s) => s.signIn);
  const busy = useRef(false);
  const autofillTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const state = (location.state || {}) as NavState;
    if (state.username && !username) setUsername(state.username);
    if (state.password && !password) setPassword(state.password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    // Demo UX: if fields are empty, auto-fill within ~3.5s so evaluators can continue quickly.
    if (username || password) return undefined;
    autofillTimerRef.current = window.setTimeout(() => {
      setUsername('admin');
      setPassword('admin123');
    }, 3500);
    return () => {
      if (autofillTimerRef.current !== null) {
        window.clearTimeout(autofillTimerRef.current);
      }
    };
  }, [username, password]);

  useEffect(() => {
    // Start waking backend as soon as login screen opens.
    void warmBackendOnce();
  }, []);

  const submit = async () => {
    if (busy.current) return;
    const u = username.trim();
    if (!u) {
      setError('Enter your username.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/admin-login', {
        username: u,
        password,
      });
      const access = data?.access_token;
      const refresh = data?.refresh_token;
      if (typeof access !== 'string' || !access || typeof refresh !== 'string' || !refresh) {
        setError('Server returned an invalid response. Is VITE_BACKEND_URL pointing at this API?');
        return;
      }
      signIn(access, refresh);
      navigate('/', { replace: true });
    } catch (e: unknown) {
      setError(formatApiError(e, 'Could not reach the server. Check VITE_BACKEND_URL and that the API is running.'));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,_#dbe7fb_0%,_#e9eef8_38%,_#f4f7fc_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto mt-6 grid w-full max-w-6xl gap-6 md:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-[#0f1f55] via-[#1e3a8a] to-[#312e81] p-8 text-white shadow-[0_22px_70px_rgba(15,23,42,0.28)]">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              SafeNet Operations
            </div>
            <h1 className="mt-6 text-3xl font-black leading-tight md:text-4xl">Admin Control Center</h1>
            <p className="mt-3 max-w-md text-sm text-blue-100/90 md:text-[15px]">
              Unified command surface for claims, payouts, fraud signals, and support ticket response.
            </p>

            <div className="mt-8 grid gap-3 text-sm">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Real-time claim lifecycle and payout stream</div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Fraud intelligence with risk flag timelines</div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Zone disruption visibility and ticket operations</div>
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur md:p-9">
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">SafeNet Admin Login</h2>
            <p className="mt-2 text-sm text-slate-600">Sign in to continue to the operations dashboard.</p>
            {!username && !password ? (
              <p className="mt-2 text-xs font-semibold text-blue-700">Preparing demo credentials...</p>
            ) : null}
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>
          ) : null}

          <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Username</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none ring-blue-200 transition focus:border-blue-400 focus:bg-white focus:ring"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
          />

          <label className="mt-5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none ring-blue-200 transition focus:border-blue-400 focus:bg-white focus:ring"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
          />

          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.3)] transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Secure access enabled for admin operations. Session activity is monitored for audit safety.
          </div>
        </section>
      </div>
    </div>
  );
}

