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
  manager?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
  requirement?: string;
  project?: string;
  fromDate?: Date;
  toDate?: Date;
  reference?: string;
  source?: string;
  relation?: string;
  closing?: string;
  status?: "lost" | "cold" | "warm" | "hot" | "booked";
}

// Client API methods
export const clientApi = {
  // Get all clients with optional filters
  getClients: async (filters: ClientFilters = {}) => {
    const {
      page = 1,
      limit = 10,
      manager,
      search,
      minBudget,
      maxBudget,
      requirement,
      project,
      fromDate,
      toDate,
      reference,
      source,
      relation,
      closing,
      status,
    } = filters;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (manager) queryParams.append("manager", manager);
    if (search) queryParams.append("search", search);
    if (minBudget) queryParams.append("minBudget", minBudget.toString());
    if (maxBudget) queryParams.append("maxBudget", maxBudget.toString());
    if (requirement) queryParams.append("requirement", requirement);
    if (project) queryParams.append("project", project);
    if (fromDate) queryParams.append("fromDate", fromDate.toString());
    if (toDate) queryParams.append("toDate", toDate.toString());
    if (reference) queryParams.append("reference", reference);
    if (source) queryParams.append("source", source);
    if (relation) queryParams.append("relation", relation);
    if (closing) queryParams.append("closing", closing);
    if (status) queryParams.append("status", status);

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
    project: string;
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
      project: string;
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
