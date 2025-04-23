// src/store/clientPartnerStore.ts
import { create } from "zustand";

// Types
interface ClientPartnerFilters {
  page: number;
  limit: number;
  search: string;
}

interface ClientPartnerStore {
  // Filter state
  filters: ClientPartnerFilters;
  setFilters: (filters: Partial<ClientPartnerFilters>) => void;
  resetFilters: () => void;

  // Selected client partner state
  selectedClientPartnerId: string | null;
  setSelectedClientPartnerId: (id: string | null) => void;

  // Selected employee state
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
}

// Create client partner store
export const useClientPartnerStore = create<ClientPartnerStore>((set) => ({
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
      filters: { page: 1, limit: 10, search: "" },
    }),

  // Selected client partner state
  selectedClientPartnerId: null,
  setSelectedClientPartnerId: (id) =>
    set({
      selectedClientPartnerId: id,
    }),

  // Selected employee state
  selectedEmployeeId: null,
  setSelectedEmployeeId: (id) =>
    set({
      selectedEmployeeId: id,
    }),
}));
