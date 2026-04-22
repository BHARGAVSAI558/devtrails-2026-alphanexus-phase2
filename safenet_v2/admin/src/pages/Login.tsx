import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const workerAppUrl = 'https://safenet-sage.vercel.app';
  const expoDeepLink =
    'exp://u.expo.dev/2d45889e-9415-4966-be7f-ba2711a57f13/group/b9f6630e-f94b-4e51-a1e9-c814b0e08e45';

  const goToAdminLogin = () => {
    navigate('/admin-login', { state: { username: 'admin', password: 'admin123' } });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e1b4b 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '56px 24px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <img src="/favicon.svg" alt="SafeNet" style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.12)', padding: 6 }} />
          <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>SafeNet</span>
        </div>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
          AI-powered income protection for India's Millions of gig delivery workers
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {['🔴 Live Backend', '⚡ Real-time WebSockets', '🤖 ML-Powered', '🛡️ Zero-Touch Claims'].map((tag) => (
            <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Two main cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Worker App Card */}
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>📱</span>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>Worker App</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Experience the full worker journey — OTP login, coverage selection, live disruption claims.
            </p>

            {/* QR Section */}
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Scan with Expo Go</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img src="/worker-app-qr.png" alt="Worker app QR code" style={{ width: 200, height: 200, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 12 }}>Best experience on mobile</p>
              <a href={expoDeepLink} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>
                Open Expo link directly →
              </a>
            </div>

            <a
              href={workerAppUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', borderRadius: 14, padding: '14px 20px', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', transition: 'opacity 0.2s' }}
            >
              🌐 Open Worker App (Web)
            </a>
            <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{workerAppUrl}</p>
          </div>

          {/* Admin Dashboard Card */}
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🖥️</span>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>Admin Dashboard</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Monitor live claims, fraud signals, zone heatmaps, and worker analytics in real time.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Demo Credentials</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Username</span>
                <code style={{ color: '#a5f3fc', fontWeight: 700, fontSize: 14 }}>admin</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Password</span>
                <code style={{ color: '#a5f3fc', fontWeight: 700, fontSize: 14 }}>admin123</code>
              </div>
            </div>

            <div style={{ flex: 1 }} />

            <button
              type="button"
              onClick={goToAdminLogin}
              style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', color: '#fff', border: 'none', borderRadius: 14, padding: '16px 20px', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 24px rgba(5,150,105,0.4)', width: '100%' }}
            >
              Sign in as Admin →
            </button>
            <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Live WebSocket feed · Fraud detection · Zone heatmap
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '🧬', label: 'Earnings DNA', desc: 'Personal 7×24 income fingerprint' },
            { icon: '🔄', label: 'Zero-Touch Claims', desc: 'Fully automated claim pipeline' },
            { icon: '📍', label: 'Live Location', desc: 'GPS + Nominatim zone detection' },
            { icon: '💬', label: 'Multilingual', desc: 'English · हिंदी · తెలుగు' },
      {icon:'🤖',label:'AI Risk Priority for Queries',desc:'AI to prioritize critical issues'},
      {icon:'📡🛢️',label:'DBSCAN',desc:'DBSCAN Zero-Day Detection'},
      {icon:'📍🔍',label:'Micro-Location Intelligence',desc:'operate at a granular'},
      
          ].map((f) => (
            <div key={f.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 18px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{f.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.3 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Evaluator link */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={goToAdminLogin}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 28px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Team / evaluator admin access →
          </button>
        </div>
      </main>
    </div>
  );
}
