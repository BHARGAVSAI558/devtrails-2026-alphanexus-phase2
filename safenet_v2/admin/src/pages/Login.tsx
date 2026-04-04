import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api';
import { useAuthStore } from '../stores/auth';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [otpHint, setOtpHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/send-otp', { phone });
      if (data.otp) setOtpHint(data.otp);
      setStep(2);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp, admin: true });
      signIn(data.access_token, data.refresh_token);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={{ fontSize: 48 }}>🛡️</span>
          <h1 style={styles.title}>SafeNet Admin</h1>
          <p style={styles.sub}>Sign in to access the dashboard</p>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        {step === 1 ? (
          <>
            <label style={styles.label}>Phone Number</label>
            <input
              style={styles.input}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
            <button style={styles.btn} onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            {otpHint ? (
              <div style={styles.otpBox}>
                <p style={styles.otpLabel}>Demo OTP</p>
                <p style={styles.otpValue}>{otpHint}</p>
                <button style={styles.autofill} onClick={() => setOtp(otpHint)}>
                  Auto-fill
                </button>
              </div>
            ) : null}
            <label style={styles.label}>Enter OTP</label>
            <input
              style={styles.input}
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
            <button style={styles.btn} onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button style={styles.back} onClick={() => setStep(1)} disabled={loading}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    width: 380,
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 800, color: '#1a73e8', margin: '8px 0 4px' },
  sub: { color: '#888', fontSize: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 15,
    marginBottom: 14,
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: 14,
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  back: {
    width: '100%',
    padding: 10,
    backgroundColor: 'transparent',
    color: '#1a73e8',
    border: 'none',
    cursor: 'pointer',
    marginTop: 8,
    fontSize: 14,
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 13,
  },
  otpBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  otpLabel: { fontSize: 12, color: '#2e7d32', fontWeight: 700, margin: 0 },
  otpValue: { fontSize: 28, fontWeight: 800, color: '#1a73e8', letterSpacing: 6, margin: '6px 0' },
  autofill: {
    padding: '4px 12px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
  },
};

