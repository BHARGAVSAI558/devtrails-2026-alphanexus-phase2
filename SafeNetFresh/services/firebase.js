/**
 * firebase.js — Lazy Firebase initializer
 * Only loads when first called. Safe to import anywhere.
 * Fixed: _initAttempted resets on failure so retry is possible.
 */

let _app = null;
let _auth = null;
let _initAttempted = false;
let _initSuccess = false;

function _getFirebaseConfig() {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

function _configComplete(cfg) {
  return !!(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

/**
 * Initialise Firebase once.
 * Returns { app, auth } on success, null if config missing or init fails.
 * On failure: resets state so the next call can retry.
 */
export async function initFirebase() {
  // Return cached success immediately
  if (_initAttempted && _initSuccess) return { app: _app, auth: _auth };
  // If already attempted and failed, allow retry (don't cache failures)
  _initAttempted = true;

  const cfg = _getFirebaseConfig();
  if (!_configComplete(cfg)) {
    _initAttempted = false; // allow retry if env vars arrive later
    return null;
  }

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    _app = getApps().length ? getApp() : initializeApp(cfg);

    const { getAuth } = await import('firebase/auth');
    _auth = getAuth(_app);

    _initSuccess = true;
    return { app: _app, auth: _auth };
  } catch (e) {
    // Reset so next call can retry
    _app = null;
    _auth = null;
    _initAttempted = false;
    _initSuccess = false;
    return null;
  }
}

export function getFirebaseAuth() {
  return _auth;
}

/** Force reset — used by resendOtp to allow fresh Firebase init */
export function resetFirebase() {
  _app = null;
  _auth = null;
  _initAttempted = false;
  _initSuccess = false;
}
