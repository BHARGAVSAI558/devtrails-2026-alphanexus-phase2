/**
 * authOtp.js
 * Unified OTP service with two-tier strategy:
 *
 * Tier 1 — Firebase Phone Auth (real SMS)
 *   Works on: Expo web, Vercel, localhost (with reCAPTCHA invisible verifier)
 *   On native (iOS/Android): uses signInWithPhoneNumber directly
 *
 * Tier 2 — SafeNet backend demo fallback (current system)
 *   Activates automatically when Firebase is unavailable, misconfigured,
 *   quota exceeded, reCAPTCHA fails, or any unexpected error occurs.
 *   Behaviour: random 6-digit OTP auto-filled after 2 s, backend accepts any
 *   6-digit code in DEMO_MODE.
 *
 * The caller (OnboardingScreen / OTPVerifyScreen) never needs to know which
 * tier is active — the API surface is identical.
 */

import { Platform } from 'react-native';
import { auth as backendAuth } from './api';
import { initFirebase } from './firebase';

// ─── Constants ────────────────────────────────────────────────────────────────

const RECAPTCHA_CONTAINER_ID = 'safenet-recaptcha-container';
const FIREBASE_TIMEOUT_MS = 15000;

// ─── Module-level state ───────────────────────────────────────────────────────

let _recaptchaVerifier = null;
let _confirmationResult = null; // Firebase confirmation object for web
let _firebaseAvailable = null;  // null = unknown, true/false after first attempt

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function _isFirebaseError(e) {
  return e && typeof e.code === 'string' && e.code.startsWith('auth/');
}

function _friendlyFirebaseError(e) {
  const code = e?.code || '';
  if (code === 'auth/invalid-phone-number') return 'Invalid phone number format.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment.';
  if (code === 'auth/quota-exceeded') return null; // trigger fallback silently
  if (code === 'auth/captcha-check-failed') return null; // trigger fallback silently
  if (code === 'auth/network-request-failed') return null; // trigger fallback silently
  if (code === 'auth/internal-error') return null; // trigger fallback silently
  if (code === 'auth/missing-phone-number') return 'Please enter your phone number.';
  if (code === 'auth/invalid-verification-code') return 'Incorrect code. Please try again.';
  if (code === 'auth/code-expired') return 'Code expired. Please request a new one.';
  return null; // unknown → trigger fallback
}

async function _withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('firebase_timeout')), ms)
    ),
  ]);
}

// ─── reCAPTCHA setup (web only) ───────────────────────────────────────────────

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

// ─── Firebase send OTP ────────────────────────────────────────────────────────

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
    // Native: Firebase uses APNs / Play Services silently — no reCAPTCHA needed
    _confirmationResult = await _withTimeout(
      signInWithPhoneNumber(fb.auth, e164),
      FIREBASE_TIMEOUT_MS
    );
  }
}

// ─── Firebase verify OTP ─────────────────────────────────────────────────────

async function _firebaseVerifyOtp(otp) {
  if (!_confirmationResult) throw new Error('no_confirmation_result');
  const result = await _withTimeout(
    _confirmationResult.confirm(otp),
    FIREBASE_TIMEOUT_MS
  );
  // result.user is the Firebase user — we don't use it directly;
  // we still call our backend to get SafeNet JWT.
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * sendOtp(phone)
 *
 * Returns:
 *   { mode: 'firebase' }  — real SMS sent via Firebase
 *   { mode: 'demo', demoCode: '123456' }  — fallback, use this code
 *
 * Never throws a user-visible error for infrastructure failures.
 */
export async function sendOtp(phone) {
  // Try Firebase first (only if config is present)
  if (_firebaseAvailable !== false) {
    try {
      await _firebaseSendOtp(phone);
      _firebaseAvailable = true;
      return { mode: 'firebase' };
    } catch (e) {
      // Friendly Firebase errors that should surface to user
      if (_isFirebaseError(e)) {
        const msg = _friendlyFirebaseError(e);
        if (msg) throw new Error(msg); // surface to UI
      }
      // All other failures → fall through to demo mode
      _firebaseAvailable = false;
      _recaptchaVerifier = null;
      _confirmationResult = null;
    }
  }

  // Tier 2: backend send-otp (Twilio if configured, else console OTP)
  try {
    await backendAuth.sendOTP(phone);
  } catch (_) {
    // Backend also failed — pure demo mode, no SMS at all
  }

  const demoCode = _randomOtp();
  return { mode: 'demo', demoCode };
}

/**
 * verifyOtp(phone, otp, mode)
 *
 * mode: 'firebase' | 'demo'
 *
 * Returns the SafeNet backend token response:
 *   { access_token, refresh_token, user_id, is_new_user }
 *
 * Never throws for infrastructure failures — falls back to demo verify.
 */
export async function verifyOtp(phone, otp, mode) {
  // Tier 1: Firebase verify → then backend verify-otp with the same code
  if (mode === 'firebase' && _confirmationResult) {
    try {
      await _firebaseVerifyOtp(otp);
      // Firebase confirmed — now get SafeNet JWT
      return await backendAuth.verifyOTP(phone, otp);
    } catch (e) {
      if (_isFirebaseError(e)) {
        const msg = _friendlyFirebaseError(e);
        if (msg) throw new Error(msg); // surface invalid-code errors
      }
      // Firebase verify failed for infra reasons → fall through to backend
    }
  }

  // Tier 2: backend verify (works in DEMO_MODE with any 6-digit code)
  return await backendAuth.verifyOTP(phone, otp);
}

/**
 * resendOtp(phone, currentMode)
 * Resets confirmation state and re-sends.
 */
export async function resendOtp(phone) {
  _confirmationResult = null;
  _recaptchaVerifier = null;
  return sendOtp(phone);
}
