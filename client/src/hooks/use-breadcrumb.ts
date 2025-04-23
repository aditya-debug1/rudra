import { useContext } from "react";
import { BreadcrumbContext } from "@/context/BreadcrumbContext";
import { create } from "zustand";

// Custom hook for accessing breadcrumb context
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};

interface BreadcrumbStore {
  breadcrumbItems: { label: string; to?: string }[] | undefined;
  setBreadcrumbItems: (
    items: { label: string; to?: string }[] | undefined,
  ) => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  breadcrumbItems: undefined,
  setBreadcrumbItems: (items) => set({ breadcrumbItems: items }),
}));
