import { toast } from "@/hooks/use-toast";
import { CustomAxiosError } from "@/utils/types/axios";
import { useQuery } from "@tanstack/react-query";
import { bankApi } from "./api";

export const useBankAccounts = (enabled = true) => {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      try {
        const response = await bankApi.getAll();
        return response;
      } catch (error) {
        const Err = error as CustomAxiosError;
        toast({
          title: "Error occurred!",
          description:
            Err.response?.data.error || "Failed to fetch bank accounts",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useBankAccount = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["bank-account", id],
    queryFn: async () => {
      try {
        const response = await bankApi.getById(id);
        return response;
      } catch (error) {
        const Err = error as CustomAxiosError;
        toast({
          title: "Error occurred!",
          description:
            Err.response?.data.error || "Failed to fetch bank account",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
