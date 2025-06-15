import { create } from "zustand";

export interface SalesManagerStatsFilters {
  startDate: string;
  endDate: string;
}

interface SalesManagerStatsStore {
  filters: SalesManagerStatsFilters;
  setFilters: (filters: Partial<SalesManagerStatsFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: SalesManagerStatsFilters = {
  startDate: "",
  endDate: "",
};

export const useSalesManagerStatsStore = create<SalesManagerStatsStore>(
  (set) => ({
    filters: initialFilters,
    setFilters: (newFilters) =>
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      })),
    resetFilters: () => set({ filters: initialFilters }),
  }),
);
