// src/api/clientApi.ts
import newRequest from "@/utils/func/request";
import { ClientType, VisitType } from "./types";

// Types for API responses
export interface GetClientsResponse {
  clients: ClientType[];
  currentPage: number;
  limitNumber: number;
  totalPages: number;
  totalClients: number;
}

interface ClientResponse {
  message: string;
  client: ClientType;
}

interface DeleteClientResponse {
  message: string;
  clientId: string;
}

interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "lost" | "cold" | "warm" | "hot" | "booked";
  reference?: string;
  source?: string;
  relation?: string;
  closing?: string;
}

// Client API methods
export const clientApi = {
  // Get all clients with optional filters
  getClients: async (filters: ClientFilters = {}) => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      reference,
      source,
      relation,
      closing,
    } = filters;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (status) queryParams.append("status", status);
    if (reference) queryParams.append("reference", reference);
    if (source) queryParams.append("search", source);
    if (relation) queryParams.append("search", relation);
    if (closing) queryParams.append("search", closing);

    const response = await newRequest.get<GetClientsResponse>(
      `/client?${queryParams.toString()}`,
    );
    return response.data;
  },

  // Get a single client by ID
  getClient: async (id: string) => {
    const response = await newRequest.get<ClientType>(`/client/${id}`);
    return response.data;
  },

  // Create a new client
  createClient: async (clientData: {
    firstName: string;
    lastName: string;
    occupation?: string;
    email?: string;
    phoneNo: string;
    altNo?: string;
    address?: string;
    note?: string;
    requirement: string;
    budget: number;
    visitData: Omit<VisitType, "client">;
  }) => {
    const response = await newRequest.post<ClientResponse>(
      "/client",
      clientData,
    );
    return response.data;
  },

  // Update an existing client
  updateClient: async (
    id: string,
    clientData: Partial<{
      firstName: string;
      lastName: string;
      occupation: string;
      email: string;
      phoneNo: string;
      altNo: string;
      address: string;
      note: string;
      requirement: string;
      budget: number;
    }>,
  ) => {
    const response = await newRequest.patch<{
      message: string;
      client: ClientType;
    }>(`/client/${id}`, clientData);
    return response.data;
  },

  // Delete a client
  deleteClient: async (id: string) => {
    const response = await newRequest.delete<DeleteClientResponse>(
      `/client/${id}`,
    );
    return response.data;
  },
};
