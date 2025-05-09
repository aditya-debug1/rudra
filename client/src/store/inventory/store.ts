import { create } from "zustand";

interface InventoryFilters {
  page: number;
  limit: number;
  search: string;
}

interface InventoryStore {
  // Filter state
  filters: InventoryFilters;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  resetFilters: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  // Initial filter state
  filters: {
    page: 1,
    limit: 5,
    search: "",
  },

  // Filter actions
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () =>
    set({
      filters: { page: 1, limit: 5, search: "" },
    }),
}));
