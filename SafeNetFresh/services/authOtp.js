/**
 * authOtp.js — SafeNet OTP Service
 *
 * Web:    Firebase Phone Auth (requires domain in Firebase Console authorized list)
 *         If Firebase fails → falls back to Twilio backend (same as native)
 * Native: Backend Twilio SMS directly
 * Fallback: Demo mode ONLY if both Firebase AND Twilio fail
 *
 * Key fix: web no longer falls to random demo code when Firebase fails.
 * It falls to Twilio backend instead, so DEMO_MODE=false still works.
 */

import { Platform } from 'react-native';
import { auth as backendAuth } from './api';
import { initFirebase, resetFirebase } from './firebase';
import axios from 'axios';
import { BACKEND_URL } from './api';

const RECAPTCHA_CONTAINER_ID = 'safenet-recaptcha-container';
const FIREBASE_TIMEOUT_MS = 20000;
const RETRY_DELAY_MS = 3000;

let _recaptchaVerifier = null;
let _confirmationResult = null;
let _firebaseAvailable = null;

// ─── Dev logging ──────────────────────────────────────────────────────────────
function _log(msg, data) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(`[OTP] ${msg}`, data !== undefined ? data : '');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function randomSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function _isFirebaseError(e) {
  return e && typeof e.code === 'string' && e.code.startsWith('auth/');
}

function _friendlyFirebaseError(e) {
  const code = e?.code || '';
  if (code === 'auth/invalid-phone-number') return 'Invalid phone number. Please check and try again.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a few minutes.';
  if (code === 'auth/missing-phone-number') return 'Please enter your phone number.';
  if (code === 'auth/invalid-verification-code') return 'Incorrect code. Please try again.';
  if (code === 'auth/code-expired') return 'Code expired. Please request a new one.';
  return null; // infra/domain error → try Twilio fallback
}

function _withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('firebase_timeout')), ms)
    ),
  ]);
}

function _sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Web: reCAPTCHA ───────────────────────────────────────────────────────────
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
  _log('Recaptcha verifier creating');
  _recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: 'invisible',
    callback: () => { _log('Recaptcha solved'); },
    'expired-callback': () => { _log('Recaptcha expired'); _recaptchaVerifier = null; },
  });
  _log('Recaptcha ready');
  return _recaptchaVerifier;
}

// ─── Web: Firebase send ───────────────────────────────────────────────────────
async function _firebaseWebSendOtp(phone) {
  _log('Firebase config', {
    hasApiKey: !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasAppId: !!process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  });
  const fb = await initFirebase();
  if (!fb) { _log('Firebase init failed'); throw new Error('firebase_unavailable'); }
  _log('Firebase initialized');
  const e164 = `+91${phone}`;
  _log(`Firebase send to ${e164}`);
  const { signInWithPhoneNumber } = await import('firebase/auth');
  const verifier = await _getRecaptchaVerifier(fb.auth);
  _confirmationResult = await _withTimeout(
    signInWithPhoneNumber(fb.auth, e164, verifier),
    FIREBASE_TIMEOUT_MS
  );
  _log('Firebase SMS send success');
}

// ─── Web: Firebase verify → SafeNet JWT ──────────────────────────────────────
async function _firebaseWebVerifyAndGetJwt(phone, otp) {
  if (!_confirmationResult) throw new Error('no_confirmation_result');
  _log('Firebase confirming OTP');
  const result = await _withTimeout(_confirmationResult.confirm(otp), FIREBASE_TIMEOUT_MS);
  _log('Firebase OTP confirmed — getting ID token');
  const idToken = await result.user.getIdToken();
  _log('Exchanging ID token with backend');
  const resp = await axios.post(
    `${BACKEND_URL}/api/v1/auth/firebase-verify`,
    { id_token: idToken, phone_number: phone },
    { timeout: 30000 }
  );
  _log('Backend firebase-verify success');
  return resp.data;
}

// ─── Twilio via backend (used by both native AND web fallback) ────────────────
async function _twilioSendOtp(phone) {
  _log(`Twilio send to +91${phone}`);
  await backendAuth.sendOTP(phone);
  _log('Twilio SMS dispatched');
}

async function _twilioVerifyOtp(phone, otp) {
  _log('Twilio verify OTP');
  const data = await backendAuth.verifyOTP(phone, otp);
  _log('Twilio verify success');
  return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * sendOtp(phone)
 *
 * Web:
 *   1. Try Firebase → { mode: 'firebase' }
 *   2. If Firebase fails → Try Twilio backend → { mode: 'twilio' }
 *   3. If both fail → { mode: 'demo', demoCode }
 *
 * Native:
 *   1. Try Twilio backend → { mode: 'twilio' }
 *   2. If fails → { mode: 'demo', demoCode }
 */
export async function sendOtp(phone) {
  _log(`Platform: ${Platform.OS}`);

  // ── WEB ───────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    // Tier 1: Firebase
    if (_firebaseAvailable !== false) {
      try {
        await _firebaseWebSendOtp(phone);
        _firebaseAvailable = true;
        return { mode: 'firebase' };
      } catch (e) {
        _log('Firebase send failed', e?.code || e?.message);
        if (_isFirebaseError(e)) {
          const msg = _friendlyFirebaseError(e);
          if (msg) throw new Error(msg); // actionable error (invalid number etc.)
        }
        // Infra/domain error — mark unavailable, fall to Twilio
        _firebaseAvailable = false;
        _recaptchaVerifier = null;
        _confirmationResult = null;
        _log('Firebase unavailable — trying Twilio backend on web');
      }
    }

    // Tier 2: Twilio backend (works on web too — backend sends SMS)
    try {
      await _twilioSendOtp(phone);
      return { mode: 'twilio' };
    } catch (e) {
      _log('Twilio send failed on web (attempt 1)', e?.message);
      await _sleep(RETRY_DELAY_MS);
      try {
        await _twilioSendOtp(phone);
        return { mode: 'twilio' };
      } catch (e2) {
        _log('Twilio retry failed on web', e2?.message);
      }
    }

    // Tier 3: Demo (only if both Firebase AND Twilio failed)
    _log('Both Firebase and Twilio failed — demo fallback');
    return { mode: 'demo', demoCode: randomSixDigitOtp() };
  }

  // ── NATIVE ────────────────────────────────────────────────────────────────
  // Tier 1: Twilio
  try {
    await _twilioSendOtp(phone);
    return { mode: 'twilio' };
  } catch (e) {
    _log('Twilio send failed (attempt 1)', e?.message);
    await _sleep(RETRY_DELAY_MS);
    try {
      await _twilioSendOtp(phone);
      return { mode: 'twilio' };
    } catch (e2) {
      _log('Twilio retry failed', e2?.message);
    }
  }

  // Tier 2: Demo
  _log('Twilio failed — demo fallback');
  return { mode: 'demo', demoCode: randomSixDigitOtp() };
}

/**
 * verifyOtp(phone, otp, mode)
 * Returns { access_token, refresh_token, user_id, is_new_user }
 */
export async function verifyOtp(phone, otp, mode) {
  // Firebase verify (web only)
  if (mode === 'firebase' && _confirmationResult) {
    try {
      return await _firebaseWebVerifyAndGetJwt(phone, otp);
    } catch (e) {
      _log('Firebase verify failed', e?.code || e?.message);
      if (_isFirebaseError(e)) {
        const msg = _friendlyFirebaseError(e);
        if (msg) throw new Error(msg);
      }
      // Firebase infra failure → fall through to Twilio verify
      _log('Firebase verify failed — trying Twilio verify');
    }
  }

  // Twilio verify (native + web fallback)
  if (mode === 'twilio' || mode === 'firebase') {
    return await _twilioVerifyOtp(phone, otp);
  }

  // Demo verify (DEMO_MODE must be true on backend for this to work)
  _log('Demo verify via backend');
  return await backendAuth.verifyOTP(phone, otp);
}

/**
 * resendOtp — resets all state and re-sends
 */
export async function resendOtp(phone) {
  _confirmationResult = null;
  _recaptchaVerifier = null;
  _firebaseAvailable = null;
  resetFirebase();
  return sendOtp(phone);
}
