// src/api/clientPartnerApi.ts
import newRequest from "@/utils/func/request";
import { ClientPartnerType, RefernceListType } from "./types";

// Types for API responses
export interface GetClientPartnersResponse {
  totalClientPartners: number;
  totalPages: number;
  currentPage: number;
  limitNumber: number;
  clientPartners: ClientPartnerType[];
}

export interface GetRefernceResponse {
  references: RefernceListType[];
}

export interface ClientPartnerResponse {
  message: string;
  cp: ClientPartnerType;
}

export interface DeleteClientPartnerResponse {
  message: string;
  cpId: string;
}

interface ClientPartnerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// Employee data types
export interface EmployeeData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNo: string;
  altNo?: string;
  position?: string;
  commissionPercentage?: number;
}

// Client Partner API methods
export const clientPartnerApi = {
  // Get all client partners with optional filters
  getAllClientPartners: async (filters: ClientPartnerFilters = {}) => {
    const { page = 1, limit = 10, search } = filters;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);

    const response = await newRequest.get<GetClientPartnersResponse>(
      `/client-partner?${queryParams.toString()}`,
    );
    return response.data;
  },

  // Get a single client partner by ID
  getClientPartner: async (id: string) => {
    const response = await newRequest.get<ClientPartnerType>(
      `/client-partner/${id}`,
    );
    return response.data;
  },

  // Get a reference list of client partner
  getReference: async (includeDeleted?: boolean) => {
    const queryParams = new URLSearchParams();
    if (includeDeleted === true) queryParams.append("includeDeleted", "true");
    const response = await newRequest.get<GetRefernceResponse>(
      `/client-partner/reference?${queryParams.toString()}`,
    );
    return response.data;
  },

  // Create a new client partner
  createClientPartner: async (clientPartnerData: {
    cpId: string;
    name: string;
    email: string;
    phoneNo: string;
    altNo?: string;
    address?: string;
    website?: string;
    logo?: string;
    description?: string;
    employees?: EmployeeData[];
  }) => {
    const response = await newRequest.post<ClientPartnerResponse>(
      "/client-partner",
      clientPartnerData,
    );
    return response.data;
  },

  // Update an existing client partner
  updateClientPartner: async (
    id: string,
    clientPartnerData: Partial<{
      name: string;
      email: string;
      phoneNo: string;
      address: string;
      companyWebsite: string;
      notes: string;
    }>,
  ) => {
    const response = await newRequest.put<ClientPartnerResponse>(
      `/client-partner/${id}`,
      clientPartnerData,
    );
    return response.data;
  },

  // Delete a client partner
  deleteClientPartner: async (id: string) => {
    const response = await newRequest.delete<DeleteClientPartnerResponse>(
      `/client-partner/${id}`,
    );
    return response.data;
  },

  // Add employee to client partner
  addEmployee: async (id: string, employeeData: EmployeeData) => {
    const response = await newRequest.post<ClientPartnerResponse>(
      `/client-partner/${id}/employees`,
      employeeData,
    );
    return response.data;
  },

  // Update employee
  updateEmployee: async (
    id: string,
    employeeId: string,
    employeeData: Partial<EmployeeData>,
  ) => {
    const response = await newRequest.put<ClientPartnerResponse>(
      `/client-partner/${id}/employees/${employeeId}`,
      employeeData,
    );
    return response.data;
  },

  // Remove employee from client partner
  removeEmployee: async (id: string, employeeId: string) => {
    const response = await newRequest.delete<ClientPartnerResponse>(
      `/client-partner/${id}/employees/${employeeId}`,
    );
    return response.data;
  },
};
