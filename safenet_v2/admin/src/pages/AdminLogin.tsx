import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api, { warmBackendOnce } from '../api';
import { useAuthStore } from '../stores/auth';

function classifyError(e: unknown): 'timeout' | 'network' | 'auth' | 'other' {
  const err = e as { code?: string; response?: { status?: number }; message?: string };
  const msg = String(err.message || '').toLowerCase();
  if (err.code === 'ECONNABORTED' || msg.includes('timeout')) return 'timeout';
  if (err.code === 'ERR_NETWORK' || msg.includes('network')) return 'network';
  if (err.response?.status === 401) return 'auth';
  return 'other';
}

function formatApiError(e: unknown, fallback: string): string {
  const err = e as {
    code?: string;
    response?: { status?: number; data?: { detail?: string | Array<{ msg?: string }> } };
    message?: string;
  };
  const kind = classifyError(e);
  if (kind === 'timeout') return 'Server is starting, please wait a few seconds.';
  if (kind === 'network') return 'Unable to reach server right now. Check your connection.';
  if (kind === 'auth') return 'Invalid username or password.';
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail.map((x) => x.msg).join(' ');
  return err.message || fallback;
}

type NavState = { username?: string; password?: string };

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverWaking, setServerWaking] = useState(false);
  const [retrying, setRetrying] = useState(false);
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
    if (username || password) return undefined;
    autofillTimerRef.current = window.setTimeout(() => {
      setUsername('admin');
      setPassword('admin123');
    }, 3500);
    return () => {
      if (autofillTimerRef.current !== null) window.clearTimeout(autofillTimerRef.current);
    };
  }, [username, password]);

  useEffect(() => {
    void warmBackendOnce();
  }, []);

  const submit = async () => {
    if (busy.current) return;
    const u = username.trim();
    if (!u) { setError('Enter your username.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/admin-login', { username: u, password });
      const access = data?.access_token;
      const refresh = data?.refresh_token;
      if (typeof access !== 'string' || !access || typeof refresh !== 'string' || !refresh) {
        setError('Server returned an invalid response.');
        return;
      }
      signIn(access, refresh);
      navigate('/', { replace: true });
    } catch (e: unknown) {
      const kind = classifyError(e);
      if (kind === 'timeout' || kind === 'network') {
        setServerWaking(true);
        setRetrying(true);
        setError('');
        // Show "Reconnecting..." briefly then settle on waking message
        setTimeout(() => setRetrying(false), 3000);
        setTimeout(() => setServerWaking(false), 15000);
      } else {
        setError(formatApiError(e, 'Unable to reach server right now.'));
      }
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0, borderRadius: 28, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

        {/* Left panel */}
        <div style={{ background: 'linear-gradient(160deg, #0f1f55 0%, #1e3a8a 50%, #312e81 100%)', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(6,182,212,0.06)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <img src="/favicon.svg" alt="SafeNet" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', padding: 5 }} />
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>SafeNet</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '6px 14px', marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              <span style={{ color: '#bfdbfe', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Operations Center</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px' }}>Admin Control Center</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, margin: '0 0 36px', maxWidth: 320 }}>
              Unified command surface for claims, payouts, fraud signals, and support operations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Real-time claim lifecycle and payout stream', 'Fraud intelligence with risk flag timelines', 'Zone disruption visibility and ticket operations'].map((item) => (
                <div key={item} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background: '#fff', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Sign in</h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Access the SafeNet operations dashboard.</p>
            {!username && !password && (
              <p style={{ color: '#2563eb', fontSize: 12, fontWeight: 700, marginTop: 8 }}>Preparing demo credentials…</p>
            )}
          </div>

          {serverWaking && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{retrying ? '🔄' : '⏳'}</span>
              <span style={{ color: '#92400e', fontSize: 13, fontWeight: 700 }}>
                {retrying ? 'Reconnecting...' : 'Server is starting, please wait a few seconds.'}
              </span>
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#b91c1c', fontSize: 14, fontWeight: 700 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 8 }}>Username</label>
            <input
              style={{ width: '100%', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', padding: '14px 16px', fontSize: 15, fontWeight: 600, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 8 }}>Password</label>
            <input
              style={{ width: '100%', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', padding: '14px 16px', fontSize: 15, fontWeight: 600, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 24px rgba(37,99,235,0.35)', transition: 'all 0.2s' }}
          >
            {loading ? 'Signing in…' : 'Sign in to Dashboard →'}
          </button>

          <div style={{ marginTop: 24, background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              🔒 Secure admin access. Session activity is monitored for audit safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
