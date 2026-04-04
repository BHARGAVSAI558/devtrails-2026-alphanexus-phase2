import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useAdminConnectionStore } from '../stores/adminConnection';
import { connectAdminWebSocket } from '../services/admin_websocket';

const links: { to: string; label: string; icon: string }[] = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/zones', label: 'Zone Heatmap', icon: '🗺️' },
  { to: '/fraud', label: 'Fraud Insights', icon: '🚨' },
  { to: '/workers', label: 'Workers', icon: '👥' },
  { to: '/simulations', label: 'Simulations', icon: '⚡' },
];

export default function Layout() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const jwt = useAuthStore((s) => s.jwt);
  const wsStatus = useAdminConnectionStore((s) => s.status);
  const lastEventAtMs = useAdminConnectionStore((s) => s.lastEventAtMs);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const lastEventSec =
    lastEventAtMs != null ? Math.max(0, Math.floor((now - lastEventAtMs) / 1000)) : null;

  useEffect(() => {
    if (!jwt) return;
    const stop = connectAdminWebSocket(jwt);
    return () => stop();
  }, [jwt]);

  const logout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={styles.brandIcon}>🛡️</span>
            <span style={styles.brandName}>SafeNet Admin</span>
          </div>
          <div style={styles.wsIndicator}>
            <span
              aria-hidden
              style={{
                ...styles.wsDot,
                backgroundColor:
                  wsStatus === 'live' ? '#22c55e' : wsStatus === 'reconnecting' ? '#f59e0b' : '#9ca3af',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span style={styles.wsText}>
                {wsStatus === 'live' ? '🟢 Live' : wsStatus === 'reconnecting' ? '🟠 Reconnecting' : '⚪ Offline'}
              </span>
              {lastEventSec != null ? (
                <span style={styles.wsSub}>
                  Last event: {lastEventSec}s ago
                </span>
              ) : (
                <span style={styles.wsSub}>No events yet</span>
              )}
            </div>
          </div>
        </div>
        <nav style={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              <span style={styles.linkIcon}>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button style={styles.logout} onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f0f4ff' },
  sidebar: {
    width: 220,
    backgroundColor: '#1a73e8',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
  brandIcon: { fontSize: 24 },
  brandName: { color: '#fff', fontWeight: 800, fontSize: 16 },
  wsIndicator: { display: 'flex', alignItems: 'center', gap: 8 },
  wsDot: { width: 10, height: 10, borderRadius: 9999, display: 'inline-block' },
  wsText: { color: '#fff', fontSize: 12, fontWeight: 700 },
  wsSub: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 600 },
  nav: { flex: 1, padding: '16px 0' },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 20px',
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  },
  linkActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    borderLeft: '3px solid #fff',
  },
  linkIcon: { fontSize: 18 },
  logout: {
    margin: '0 16px',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
  },
  main: { flex: 1, overflow: 'auto', padding: 32 },
};

