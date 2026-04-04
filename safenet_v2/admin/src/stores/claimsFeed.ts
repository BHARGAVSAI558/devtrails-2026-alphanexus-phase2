import { create } from 'zustand';

export type AdminClaimStatus =
  | 'Approved'
  | 'Flagged'
  | 'Rejected'
  | 'Processing'
  | string;

export type AdminClaimUpdate = {
  type?: string;
  claim_id: string | number;
  status: AdminClaimStatus;
  message: string;
  payout_amount?: number | null;
  timestamp: number; // epoch ms

  // Optional enriched fields (may be absent until backend payload enrichment is done).
  worker_id?: number;
  zone_id?: string;
  disruption_type?: string;
  confidence_level?: string;
  fraud_score?: number;
};

type ClaimsFeedState = {
  items: AdminClaimUpdate[]; // newest first
  upsertClaimUpdate: (update: AdminClaimUpdate) => void;
  clear: () => void;
};

const MAX_ITEMS = 80;

export const useClaimsFeedStore = create<ClaimsFeedState>((set) => ({
  items: [],

  upsertClaimUpdate: (update) =>
    set((state) => {
      const items = state.items.slice();
      const idx = items.findIndex((x) => String(x.claim_id) === String(update.claim_id));
      if (idx >= 0) items[idx] = update;
      else items.push(update);

      items.sort((a, b) => b.timestamp - a.timestamp);
      return { items: items.slice(0, MAX_ITEMS) };
    }),

  clear: () => set({ items: [] }),
}));

