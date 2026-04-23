/**
 * authOtp.js
 * Two-tier OTP:
 *   Tier 1 — Firebase Phone Auth → backend /auth/firebase-verify → SafeNet JWT
 *   Tier 2 — Demo fallback (auto-fill random 6-digit, backend DEMO_MODE accepts any)
 */

import { Platform } from 'react-native';
import { auth as backendAuth } from './api';
import { initFirebase } from './firebase';
import axios from 'axios';
import { BACKEND_URL } from './api';

const RECAPTCHA_CONTAINER_ID = 'safenet-recaptcha-container';
const FIREBASE_TIMEOUT_MS = 15000;

let _recaptchaVerifier = null;
let _confirmationResult = null;
let _firebaseAvailable = null; // null=unknown, true/false after first attempt

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function randomSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function _isFirebaseError(e) {
  return e && typeof e.code === 'string' && e.code.startsWith('auth/');
}

function _friendlyFirebaseError(e) {
  const code = e?.code || '';
  if (code === 'auth/invalid-phone-number') return 'Invalid phone number format.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment.';
  if (code === 'auth/missing-phone-number') return 'Please enter your phone number.';
  if (code === 'auth/invalid-verification-code') return 'Incorrect code. Please try again.';
  if (code === 'auth/code-expired') return 'Code expired. Please request a new one.';
  // All infra errors → return null to trigger silent fallback
  return null;
}

async function _withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('firebase_timeout')), ms)
    ),
  ]);
}

// ─── reCAPTCHA (web only) ─────────────────────────────────────────────────────

async function _ensureRecaptchaContainer() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(RECAPTCHA_CONTAINER_ID)) return;
  const div = document.createElement('div');
  div.id = RECAPTCHA_CONTAINER_ID;
  div.style.cssText = 'position:fixed;bottom:0;left:0;z-index:-1;opacity:0;pointer-events:none;';
  document.body.appendChild(div);
}

async function _getRecaptchaVerifier(auth) {
  if (_recaptchaVerifier) return _recaptchaVerifier;
  await _ensureRecaptchaContainer();
  const { RecaptchaVerifier } = await import('firebase/auth');
  _recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => { _recaptchaVerifier = null; },
  });
  return _recaptchaVerifier;
}

// ─── Firebase send ────────────────────────────────────────────────────────────

async function _firebaseSendOtp(phone) {
  const fb = await initFirebase();
  if (!fb) throw new Error('firebase_unavailable');

  const e164 = `+91${phone}`;
  const { signInWithPhoneNumber } = await import('firebase/auth');

  if (Platform.OS === 'web') {
    const verifier = await _getRecaptchaVerifier(fb.auth);
    _confirmationResult = await _withTimeout(
      signInWithPhoneNumber(fb.auth, e164, verifier),
      FIREBASE_TIMEOUT_MS
    );
  } else {
    _confirmationResult = await _withTimeout(
      signInWithPhoneNumber(fb.auth, e164),
      FIREBASE_TIMEOUT_MS
    );
  }
}

// ─── Firebase verify → get Firebase ID token → call backend ──────────────────

async function _firebaseVerifyAndGetJwt(phone, otp) {
  if (!_confirmationResult) throw new Error('no_confirmation_result');

  // 1. Confirm OTP with Firebase
  const result = await _withTimeout(
    _confirmationResult.confirm(otp),
    FIREBASE_TIMEOUT_MS
  );

  // 2. Get Firebase ID token
  const idToken = await result.user.getIdToken();

  // 3. Exchange with SafeNet backend for SafeNet JWT
  const resp = await axios.post(
    `${BACKEND_URL}/api/v1/auth/firebase-verify`,
    { id_token: idToken, phone_number: phone },
    { timeout: 30000 }
  );
  return resp.data; // { access_token, refresh_token, user_id, is_new_user }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * sendOtp(phone)
 * Returns { mode: 'firebase' } or { mode: 'demo', demoCode: '123456' }
 */
export async function sendOtp(phone) {
  if (_firebaseAvailable !== false) {
    try {
      await _firebaseSendOtp(phone);
      _firebaseAvailable = true;
      return { mode: 'firebase' };
    } catch (e) {
      if (_isFirebaseError(e)) {
        const msg = _friendlyFirebaseError(e);
        if (msg) throw new Error(msg); // surface to UI (wrong number etc.)
      }
      // Infra failure → fall through to demo
      _firebaseAvailable = false;
      _recaptchaVerifier = null;
      _confirmationResult = null;
    }
  }

  // Tier 2: call backend send-otp (Twilio if configured, else console)
  try { await backendAuth.sendOTP(phone); } catch (_) {}

  return { mode: 'demo', demoCode: randomSixDigitOtp() };
}

/**
 * verifyOtp(phone, otp, mode)
 * Returns { access_token, refresh_token, user_id, is_new_user }
 */
export async function verifyOtp(phone, otp, mode) {
  if (mode === 'firebase' && _confirmationResult) {
    try {
      return await _firebaseVerifyAndGetJwt(phone, otp);
    } catch (e) {
      if (_isFirebaseError(e)) {
        const msg = _friendlyFirebaseError(e);
        if (msg) throw new Error(msg); // wrong code / expired → show to user
      }
      // Backend firebase-verify returned 503 (firebase unavailable) or other infra error
      // → fall through to demo verify
    }
  }

  // Tier 2: backend verify-otp (DEMO_MODE accepts any 6-digit code)
  return await backendAuth.verifyOTP(phone, otp);
}

/**
 * resendOtp(phone) — resets state and re-sends
 */
export async function resendOtp(phone) {
  _confirmationResult = null;
  _recaptchaVerifier = null;
  return sendOtp(phone);
}
