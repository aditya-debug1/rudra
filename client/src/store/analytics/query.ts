import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./api";

// Hook for client status counts
export const useClientStatusCounts = (params?: {
  startDate?: string;
  endDate?: string;
  manager?: string;
}) => {
  return useQuery({
    queryKey: ["clientStatusCounts", params],
    queryFn: () => analyticsApi.getClientStatusCounts(params),
  });
};

// Hook for yearly booking statistics
export const useYearlyBookingStats = (params?: {
  year?: number;
  manager?: string;
}) => {
  return useQuery({
    queryKey: ["yearlyBookingStats", params],
    queryFn: () => analyticsApi.getYearlyBookingStats(params),
  });
};

// The same hooks with parameters pre-typed for additional context
export const useFilteredClientStatusCounts = (
  startDate?: string,
  endDate?: string,
  manager?: string,
) => {
  return useClientStatusCounts({
    startDate,
    endDate,
    manager,
  });
};

export const useYearlyBookingStatsForYear = (
  year: number = new Date().getFullYear(),
  manager?: string,
) => {
  return useYearlyBookingStats({
    year,
    manager,
  });
};
