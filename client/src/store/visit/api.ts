import newRequest from "@/utils/func/request";
import { VisitType } from "../client";

// Types for API responses
interface VisitResponse {
  message: string;
  visit: Omit<VisitType, "client">;
}

interface DeleteVistResponse {
  message: string;
  visitId: string;
}

// Visit API methods
export const visitApi = {
  // Create a new visit
  createVisit: async (
    clientId: string,
    visitData: Omit<VisitType, "client">,
  ) => {
    const response = await newRequest.post<VisitResponse>("/visit", {
      clientId,
      ...visitData,
    });
    return response.data;
  },

  // Update an existing visit
  updateVisit: async (id: string, visitData: Omit<VisitType, "client">) => {
    const response = await newRequest.patch<VisitResponse>(
      `/visit/${id}`,
      visitData,
    );
    return response.data;
  },

  // Delete a visit
  deleteVisit: async (id: string) => {
    const response = await newRequest.delete<DeleteVistResponse>(
      `/visit/${id}`,
    );
    return response.data;
  },

  createRemark: async (id: string, remark: string) => {
    const response = await newRequest.post<VisitResponse>(
      `/visit/${id}/remarks`,
      {
        remark: remark,
      },
    );
    return response.data;
  },

  deleteRemark: async (id: string, remarkId: string) => {
    const response = await newRequest.delete<VisitResponse>(
      `/visit/${id}/remarks/${remarkId}`,
    );
    return response.data;
  },
};
