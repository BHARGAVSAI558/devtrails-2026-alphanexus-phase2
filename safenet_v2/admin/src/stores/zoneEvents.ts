import { create } from 'zustand';

export type AdminZoneEvent = {
  type?: string;
  zone_id: string;
  event_type: string;
  details: Record<string, unknown>;
  timestamp: number;
};

type ZoneEventsState = {
  latestByZone: Record<string, AdminZoneEvent | undefined>;
  upsertZoneEvent: (evt: AdminZoneEvent) => void;
  clear: () => void;
};

export const useZoneEventsStore = create<ZoneEventsState>((set) => ({
  latestByZone: {},

  upsertZoneEvent: (evt) =>
    set((state) => ({
      latestByZone: {
        ...state.latestByZone,
        [evt.zone_id]: evt,
      },
    })),

  clear: () => set({ latestByZone: {} }),
}));

