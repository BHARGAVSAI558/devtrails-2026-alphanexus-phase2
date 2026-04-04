import { create } from 'zustand';

export type AdminPoolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | string;

export type AdminPoolHealth = {
  type?: string;
  zone_id: string;
  balance: number;
  utilization_pct: number;
  risk_level: AdminPoolRiskLevel;
  timestamp: number; // epoch ms
};

type PoolHealthState = {
  latestByZone: Record<string, AdminPoolHealth | undefined>;
  upsertPoolHealth: (health: AdminPoolHealth) => void;
  clear: () => void;
};

export const usePoolHealthStore = create<PoolHealthState>((set) => ({
  latestByZone: {},

  upsertPoolHealth: (health) =>
    set((state) => ({
      latestByZone: {
        ...state.latestByZone,
        [health.zone_id]: health,
      },
    })),

  clear: () => set({ latestByZone: {} }),
}));

