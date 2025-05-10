import newRequest from "@/utils/func/request";
import {
  ClientBookingCreateUpdateData,
  ClientBookingPaginatedResponse,
  ClientBookingResponse,
} from "./types";

export const clientBookingApi = {
  // Create a new booking
  createBooking: async (bookingData: ClientBookingCreateUpdateData) => {
    const { data } = await newRequest.post<ClientBookingResponse>(
      "/client-booking",
      bookingData,
    );
    return data;
  },

  // Get all bookings with pagination and filters
  getBookings: async (params: { page?: number; limit?: number }) => {
    const { data } = await newRequest.get<ClientBookingPaginatedResponse>(
      "/client-booking",
      { params },
    );
    return data;
  },

  // Get booking by ID
  getBookingById: async (id: string) => {
    const { data } = await newRequest.get<ClientBookingResponse>(
      `/client-booking/${id}`,
    );
    return data;
  },

  // Update a booking
  updateBooking: async (
    id: string,
    updateData: Partial<ClientBookingCreateUpdateData>,
  ) => {
    const { data } = await newRequest.put<ClientBookingResponse>(
      `/client-booking/${id}`,
      updateData,
    );
    return data;
  },

  // Delete a booking
  deleteBooking: async (id: string) => {
    const { data } = await newRequest.delete(`/client-booking/${id}`);
    return data;
  },
};
