import { useQuery } from "@tanstack/react-query";
import { salesManagerStatsApi } from "./api";
import { SalesManagerStatsParams } from "./types";

// Get sales manager statistics
export const useSalesManagerStats = (params: SalesManagerStatsParams) => {
  return useQuery({
    queryKey: ["salesManagerStats", params],
    queryFn: () => salesManagerStatsApi.getStats(params),
    enabled: !!(params.startDate && params.endDate),
    placeholderData: (previousData) => previousData,
  });
};
