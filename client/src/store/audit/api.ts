import newRequest from "@/utils/func/request";
import { AuditLogPaginatedResponse } from "./types";

export const auditLogApi = {
  getLogs: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    source?: string;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const { data } = await newRequest.get<AuditLogPaginatedResponse>(
      "/audit/logs",
      { params },
    );
    return data;
  },

  getLogById: async (id: string) => {
    const { data } = await newRequest.get(`/audit/logs/${id}`);
    return data;
  },

  getStatistics: async () => {
    const { data } = await newRequest.get("/audit/statistics");
    return data.statistics;
  },
};
