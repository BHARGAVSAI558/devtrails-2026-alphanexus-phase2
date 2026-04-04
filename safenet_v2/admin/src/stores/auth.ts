import { create } from 'zustand';

type AuthState = {
  jwt: string | null;
  expiresAtMs: number | null;

  signIn: (accessToken: string, refreshToken: string) => void;
  signOut: () => void;
};

function decodeJwtExpMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

const REFRESH_LS_KEY = 'admin_refresh_token';
const REFRESH_EXP_LS_KEY = 'admin_refresh_expires_at_ms';

export const useAuthStore = create<AuthState>((set) => ({
  jwt: null,
  expiresAtMs: null,

  signIn: (accessToken, refreshToken) => {
    const accessExp = decodeJwtExpMs(accessToken);

    // Simulate an httpOnly cookie with a short local TTL on the client.
    // We still store the refresh token itself, but we treat it as expired quickly.
    const now = Date.now();
    const shortTtlMs = 15 * 60 * 1000;
    const refreshExpiresAtMs = now + shortTtlMs;

    localStorage.setItem(REFRESH_LS_KEY, refreshToken);
    localStorage.setItem(REFRESH_EXP_LS_KEY, String(refreshExpiresAtMs));

    set({ jwt: accessToken, expiresAtMs: accessExp });
  },

  signOut: () => {
    localStorage.removeItem(REFRESH_LS_KEY);
    localStorage.removeItem(REFRESH_EXP_LS_KEY);
    set({ jwt: null, expiresAtMs: null });
  },
}));

