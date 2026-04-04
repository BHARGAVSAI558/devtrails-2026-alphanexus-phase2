import { create } from 'zustand';

type AdminUiState = {
  claimDrawerOpen: boolean;
  selectedClaimId: string | number | null;

  openClaimDrawer: (claimId: string | number) => void;
  closeClaimDrawer: () => void;

  selectedZoneId: string | null;
  setSelectedZoneId: (zoneId: string | null) => void;
};

export const useAdminUiStore = create<AdminUiState>((set) => ({
  claimDrawerOpen: false,
  selectedClaimId: null,

  openClaimDrawer: (claimId) => set({ claimDrawerOpen: true, selectedClaimId: claimId }),
  closeClaimDrawer: () => set({ claimDrawerOpen: false, selectedClaimId: null }),

  selectedZoneId: null,
  setSelectedZoneId: (zoneId) => set({ selectedZoneId: zoneId }),
}));

