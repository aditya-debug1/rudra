import { create } from "zustand";

interface AuditLogStore {
  selectedLogId: string | null;
  setSelectedLogId: (id: string | null) => void;
  resetSelectedLogId: () => void;
}

export const useAuditLogStore = create<AuditLogStore>((set) => ({
  selectedLogId: null,
  setSelectedLogId: (id) => set({ selectedLogId: id }),
  resetSelectedLogId: () => set({ selectedLogId: null }),
}));
