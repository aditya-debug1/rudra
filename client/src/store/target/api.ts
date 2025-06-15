import newRequest from "@/utils/func/request";
import { SalesManagerStatsParams, SalesManagerStatsResponse } from "./types";

export const salesManagerStatsApi = {
  // Get sales manager statistics
  getStats: async (params: SalesManagerStatsParams) => {
    const { data } = await newRequest.get<SalesManagerStatsResponse>(
      "/target/range-stats",
      { params },
    );
    return data;
  },
};
