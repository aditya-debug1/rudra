// src/store/clientStore.ts
import { create } from "zustand";

// Types
interface ClientFilters {
  page: number;
  limit: number;
  search: string;
  status?: "lost" | "cold" | "warm" | "hot" | "booked";
  reference?: string;
  source?: string;
  relation?: string;
  closing?: string;
}

interface ClientStore {
  // Filter state
  filters: ClientFilters;
  setFilters: (filters: Partial<ClientFilters>) => void;
  resetFilters: () => void;

  // Selected client state
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
}

// Create client store
export const useClientStore = create<ClientStore>((set) => ({
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

  // Selected client state
  selectedClientId: null,
  setSelectedClientId: (id) =>
    set({
      selectedClientId: id,
    }),
}));
