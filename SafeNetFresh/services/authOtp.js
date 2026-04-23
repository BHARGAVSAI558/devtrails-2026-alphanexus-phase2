/**
 * authOtp.js — SafeNet OTP Service
 *
 * Platform strategy:
 *   WEB  → Firebase Phone Auth (JS SDK + invisible reCAPTCHA)
 *          → on success: exchange Firebase ID token with backend /auth/firebase-verify
 *   NATIVE (Android/iOS/Expo Go)
 *          → Backend Twilio SMS via /auth/send-otp + /auth/verify-otp
 *          → Real SMS delivered by Twilio to the device
 *
 * Fallback (both platforms):
 *   If real OTP fails after 1 retry → demo mode (backend DEMO_MODE bypass)
 *   User sees clear message, never a raw error.
 *
 * Root causes fixed:
 *   1. Firebase JS SDK phone auth does NOT work on React Native native — removed from native path
 *   2. _initAttempted flag was permanent — now resets on failure
 *   3. Silent catch was triggering fallback instantly — now retries once first
 *   4. No logging — added structured [OTP] logs in __DEV__
 */

import { Platform } from 'react-native';
import { auth as backendAuth } from './api';
import { initFirebase } from './firebase';
import axios from 'axios';
import { BACKEND_URL } from './api';

// ─── Constants ────────────────────────────────────────────────────────────────

const RECAPTCHA_CONTAINER_ID = 'safenet-recaptcha-container';
const FIREBASE_TIMEOUT_MS = 20000;
const RETRY_DELAY_MS = 2000;

// ─── State ────────────────────────────────────────────────────────────────────

let _recaptchaVerifier = null;
let _confirmationResult = null;
let _firebaseAvailable = null; // null=unknown, true/false after attempt

// ─── Dev logging ─────────────────────────────────────────────────────────────

function _log(msg, data) {
  if (__DEV__) {
    if (data !== undefined) {
      console.log(`[OTP] ${msg}`, data);
    } else {
      console.log(`[OTP] ${msg}`);
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function randomSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function _isFirebaseError(e) {
  return e && typeof e.code === 'string' && e.code.startsWith('auth/');
}

/** Returns a user-visible message for actionable Firebase errors, null for infra errors. */
function _friendlyFirebaseError(e) {
  const code = e?.code || '';
  if (code === 'auth/invalid-phone-number') return 'Invalid phone number. Please check and try again.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a few minutes.';
  if (code === 'auth/missing-phone-number') return 'Please enter your phone number.';
  if (code === 'auth/invalid-verification-code') return 'Incorrect code. Please try again.';
  if (code === 'auth/code-expired') return 'Code expired. Please request a new one.';
  // Infra errors (quota, captcha, network, internal) → null = trigger fallback silently
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

function _sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Web: reCAPTCHA setup ─────────────────────────────────────────────────────

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
  _log('Recaptcha verifier creating...');
  _recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: 'invisible',
    callback: () => { _log('Recaptcha solved'); },
    'expired-callback': () => {
      _log('Recaptcha expired — resetting');
      _recaptchaVerifier = null;
    },
  });
  _log('Recaptcha ready');
  return _recaptchaVerifier;
}

// ─── Web: Firebase send OTP ───────────────────────────────────────────────────

async function _firebaseWebSendOtp(phone) {
  const cfg = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  _log('Firebase config loaded', {
    hasApiKey: !!cfg.apiKey,
    hasAuthDomain: !!cfg.authDomain,
    hasProjectId: !!cfg.projectId,
    hasAppId: !!cfg.appId,
  });

  const fb = await initFirebase();
  if (!fb) {
    _log('Firebase init failed — config incomplete or init error');
    throw new Error('firebase_unavailable');
  }
  _log('Firebase initialized');

  const e164 = `+91${phone}`;
  _log(`Attempting Firebase send to ${e164}`);

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
  _log(`Firebase confirming OTP for +91${phone}`);

  const result = await _withTimeout(
    _confirmationResult.confirm(otp),
    FIREBASE_TIMEOUT_MS
  );
  _log('Firebase OTP confirmed — getting ID token');

  const idToken = await result.user.getIdToken();
  _log('Firebase ID token obtained — exchanging with backend');

  const resp = await axios.post(
    `${BACKEND_URL}/api/v1/auth/firebase-verify`,
    { id_token: idToken, phone_number: phone },
    { timeout: 30000 }
  );
  _log('Backend firebase-verify success');
  return resp.data;
}

// ─── Native: Backend Twilio SMS ───────────────────────────────────────────────

async function _nativeSendOtp(phone) {
  _log(`Native: sending Twilio OTP via backend to +91${phone}`);
  await backendAuth.sendOTP(phone);
  _log('Native: backend send-otp success (Twilio SMS dispatched)');
}

async function _nativeVerifyOtp(phone, otp) {
  _log(`Native: verifying OTP with backend for +91${phone}`);
  const data = await backendAuth.verifyOTP(phone, otp);
  _log('Native: backend verify-otp success');
  return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * sendOtp(phone)
 *
 * Web:    Firebase → { mode: 'firebase' }
 * Native: Twilio via backend → { mode: 'twilio' }
 * Fallback (after 1 retry): { mode: 'demo', demoCode: '123456' }
 */
export async function sendOtp(phone) {
  // ── WEB PATH ──────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    if (_firebaseAvailable !== false) {
      try {
        await _firebaseWebSendOtp(phone);
        _firebaseAvailable = true;
        return { mode: 'firebase' };
      } catch (e) {
        _log('Firebase send failed', e?.code || e?.message);

        if (_isFirebaseError(e)) {
          const msg = _friendlyFirebaseError(e);
          if (msg) throw new Error(msg); // actionable error → show to user
        }

        // Infra failure — retry once after delay
        _log('Firebase infra failure — retrying once in 2s...');
        _recaptchaVerifier = null; // reset verifier for retry
        await _sleep(RETRY_DELAY_MS);

        try {
          await _firebaseWebSendOtp(phone);
          _firebaseAvailable = true;
          return { mode: 'firebase' };
        } catch (e2) {
          _log('Firebase retry also failed', e2?.code || e2?.message);
          if (_isFirebaseError(e2)) {
            const msg = _friendlyFirebaseError(e2);
            if (msg) throw new Error(msg);
          }
          _firebaseAvailable = false;
          _recaptchaVerifier = null;
          _confirmationResult = null;
        }
      }
    }

    // Web fallback: backend send-otp (Twilio if configured)
    _log('Fallback activated on web');
    try { await backendAuth.sendOTP(phone); } catch (_) {}
    return { mode: 'demo', demoCode: randomSixDigitOtp() };
  }

  // ── NATIVE PATH (Android / iOS / Expo Go) ─────────────────────────────────
  // Firebase JS SDK phone auth does NOT work on React Native without
  // @react-native-firebase/auth native module. Use backend Twilio directly.
  try {
    await _nativeSendOtp(phone);
    return { mode: 'twilio' };
  } catch (e) {
    _log('Twilio send failed — retrying once', e?.message);
    await _sleep(RETRY_DELAY_MS);

    try {
      await _nativeSendOtp(phone);
      return { mode: 'twilio' };
    } catch (e2) {
      _log('Twilio retry failed — activating fallback', e2?.message);
    }
  }

  // Native fallback: demo mode
  _log('Fallback activated on native');
  return { mode: 'demo', demoCode: randomSixDigitOtp() };
}

/**
 * verifyOtp(phone, otp, mode)
 * Returns { access_token, refresh_token, user_id, is_new_user }
 */
export async function verifyOtp(phone, otp, mode) {
  // ── WEB: Firebase verify ──────────────────────────────────────────────────
  if (mode === 'firebase' && _confirmationResult) {
    try {
      return await _firebaseWebVerifyAndGetJwt(phone, otp);
    } catch (e) {
      _log('Firebase verify failed', e?.code || e?.message);
      if (_isFirebaseError(e)) {
        const msg = _friendlyFirebaseError(e);
        if (msg) throw new Error(msg); // wrong code / expired → show to user
      }
      // Infra failure → fall through to backend verify
      _log('Firebase verify infra failure — falling back to backend verify');
    }
  }

  // ── NATIVE: Twilio verify ─────────────────────────────────────────────────
  if (mode === 'twilio') {
    return await _nativeVerifyOtp(phone, otp);
  }

  // ── DEMO / FALLBACK: backend verify (DEMO_MODE accepts any 6-digit code) ──
  _log('Using backend demo verify');
  return await backendAuth.verifyOTP(phone, otp);
}

/**
 * resendOtp(phone) — resets state and re-sends
 */
export async function resendOtp(phone) {
  _confirmationResult = null;
  _recaptchaVerifier = null;
  _firebaseAvailable = null; // allow retry on web
  return sendOtp(phone);
}
