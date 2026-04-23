/**
 * firebase.js
 * Lazy Firebase initializer — only loads when first called.
 * Safe to import anywhere; does nothing until initFirebase() is called.
 */
import { Platform } from 'react-native';

let _app = null;
let _auth = null;
let _initAttempted = false;

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
 * Initialise Firebase once. Returns { app, auth } or null if config missing / init fails.
 * Safe to call multiple times — returns cached result after first call.
 */
export async function initFirebase() {
  if (_initAttempted) return _app && _auth ? { app: _app, auth: _auth } : null;
  _initAttempted = true;

  const cfg = _getFirebaseConfig();
  if (!_configComplete(cfg)) return null;

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    _app = getApps().length ? getApp() : initializeApp(cfg);

    const { getAuth } = await import('firebase/auth');
    _auth = getAuth(_app);

    return { app: _app, auth: _auth };
  } catch (e) {
    _app = null;
    _auth = null;
    return null;
  }
}

export function getFirebaseAuth() {
  return _auth;
}
