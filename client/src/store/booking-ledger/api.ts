// api.ts
import newRequest from "@/utils/func/request";
import {
  BookingLedgerFilters,
  BookingLedgerSummary,
  CreateBookingLedgerPayload,
  IBookingLedger,
  IBookingLedgerPopulated,
  SoftDeletePayload,
} from "./types";

// Response types
export interface CreateBookingLedgerResponse {
  success: boolean;
  data: IBookingLedger;
}

export interface GetBookingLedgerByClientResponse {
  success: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  summary: BookingLedgerSummary;
  data: IBookingLedgerPopulated[];
}

export interface SoftDeleteBookingLedgerResponse {
  success: boolean;
  message: string;
  data: IBookingLedger;
}

export interface RestoreBookingLedgerResponse {
  success: boolean;
  message: string;
  data: IBookingLedger;
}

export const bookingLedgerApi = {
  // Create a new payment entry
  createPayment: async (paymentData: CreateBookingLedgerPayload) => {
    const response = await newRequest.post<CreateBookingLedgerResponse>(
      "/booking-ledger",
      paymentData,
    );
    return response.data;
  },

  // Get all payments by client with pagination and filtering
  getPaymentsByClient: async (
    clientId: string,
    filters: Partial<BookingLedgerFilters> = {},
  ) => {
    const {
      page = 1,
      limit = 10,
      fromDate,
      toDate,
      type,
      method,
      includeDeleted = false,
    } = filters;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    queryParams.append("includeDeleted", includeDeleted.toString());

    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);
    if (type) queryParams.append("type", type);
    if (method) queryParams.append("method", method);

    const response = await newRequest.get<GetBookingLedgerByClientResponse>(
      `/booking-ledger/client/${clientId}?${queryParams.toString()}`,
    );
    return response.data;
  },

  // Soft delete a payment entry
  softDeletePayment: async (paymentId: string, payload: SoftDeletePayload) => {
    const response = await newRequest.delete<SoftDeleteBookingLedgerResponse>(
      `/booking-ledger/${paymentId}`,
      { data: payload },
    );
    return response.data;
  },

  // Restore a soft deleted payment entry
  restorePayment: async (paymentId: string) => {
    const response = await newRequest.patch<RestoreBookingLedgerResponse>(
      `/booking-ledger/${paymentId}/restore`,
    );
    return response.data;
  },
};
