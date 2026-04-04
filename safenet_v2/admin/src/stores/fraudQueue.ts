import { create } from 'zustand';

export type AdminFraudRingConfidence = 'NONE' | 'MONITOR' | 'PROBABLE' | 'CONFIRMED' | string;

export type AdminFraudAlert = {
  type?: string;
  cluster_id: string;
  ring_confidence: AdminFraudRingConfidence;
  worker_ids: number[];
  zone_id: string;
  timestamp: number; // epoch ms
  freeze_status?: string;
};

type FraudQueueState = {
  items: AdminFraudAlert[]; // newest first
  upsertFraudAlert: (alert: AdminFraudAlert) => void;
  clear: () => void;
};

const MAX_ITEMS = 100;

export const useFraudQueueStore = create<FraudQueueState>((set) => ({
  items: [],

  upsertFraudAlert: (alert) =>
    set((state) => {
      const items = state.items.slice();
      const idx = items.findIndex((x) => x.cluster_id === alert.cluster_id);
      if (idx >= 0) items[idx] = alert;
      else items.push(alert);

      items.sort((a, b) => b.timestamp - a.timestamp);
      return { items: items.slice(0, MAX_ITEMS) };
    }),

  clear: () => set({ items: [] }),
}));

