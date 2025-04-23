// src/store/clientStore.ts
import { create } from "zustand";

// Types
interface ClientFilters {
  page: number;
  limit: number;
  manager?: string;
  search: string;
  minBudget?: number;
  maxBudget?: number;
  requirement?: string;
  project?: string;
  fromDate?: Date;
  toDate?: Date;
  reference?: string;
  source?: string;
  relation?: string;
  closing?: string;
  status?: "lost" | "cold" | "warm" | "hot" | "booked";
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
      filters: { page: 1, limit: 5, search: "" },
    }),

  // Selected client state
  selectedClientId: null,
  setSelectedClientId: (id) =>
    set({
      selectedClientId: id,
    }),
}));
