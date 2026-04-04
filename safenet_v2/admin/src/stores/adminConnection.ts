import { create } from 'zustand';

export type AdminConnectionStatus = 'live' | 'reconnecting' | 'offline';

type AdminConnectionState = {
  status: AdminConnectionStatus;
  lastError: string | null;
  /** Epoch ms of last WebSocket message (any channel). */
  lastEventAtMs: number | null;
  setStatus: (status: AdminConnectionStatus) => void;
  setError: (err: string | null) => void;
  touchLastEvent: () => void;
};

export const useAdminConnectionStore = create<AdminConnectionState>((set) => ({
  status: 'offline',
  lastError: null,
  lastEventAtMs: null,

  setStatus: (status) => set({ status }),
  setError: (lastError) => set({ lastError }),
  touchLastEvent: () => set({ lastEventAtMs: Date.now() }),
}));

