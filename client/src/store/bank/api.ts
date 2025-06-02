import newRequest from "@/utils/func/request";
import { BankDetailsListResponse, BankDetailsResponse } from "./types";

export const bankApi = {
  getAll: async () => {
    const { data } = await newRequest.get<BankDetailsListResponse>("/bank");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await newRequest.get<BankDetailsResponse>(`/bank/${id}`);
    return data;
  },
};
