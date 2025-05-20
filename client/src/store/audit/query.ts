import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "./api";

// React Query Hooks
export const useAuditLogs = (params: {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => auditLogApi.getLogs(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAuditLogById = (id: string | null) => {
  return useQuery({
    queryKey: ["auditLog", id],
    queryFn: () => (id ? auditLogApi.getLogById(id) : null),
    enabled: !!id,
  });
};

export const useAuditSources = () => {
  return useQuery({
    queryKey: ["auditSources"],
    queryFn: () => auditLogApi.getSources(),
  });
};

export const useAuditLogStatistics = () => {
  return useQuery({
    queryKey: ["auditLogStatistics"],
    queryFn: auditLogApi.getStatistics,
  });
};
