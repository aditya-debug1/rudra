// store.ts
import { create } from "zustand";
import { BookingLedgerFilters } from "./types";

interface BookingLedgerStore {
  // Filter state
  filters: BookingLedgerFilters;
  setFilters: (filters: Partial<BookingLedgerFilters>) => void;
  resetFilters: () => void;

  // Selected client for payment operations
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
}

export const useBookingLedgerStore = create<BookingLedgerStore>((set) => ({
  // Initial filter state
  filters: {
    page: 1,
    limit: 5,
    includeDeleted: true,
  },

  // Filter actions
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () =>
    set({
      filters: { page: 1, limit: 5, includeDeleted: false },
    }),

  // Selected client
  selectedClientId: null,
  setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
}));
