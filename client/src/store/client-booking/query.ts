import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientBookingApi } from "./api";
import { BookingFilters } from "./store";
import { ClientBookingCreateUpdateData } from "./types";

// Get all bookings with pagination and filters
export const useClientBookings = (params: BookingFilters) => {
  return useQuery({
    queryKey: ["clientBookings", params],
    queryFn: () => clientBookingApi.getBookings(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get a single booking by ID
export const useClientBookingById = (id: string | null) => {
  return useQuery({
    queryKey: ["clientBooking", id],
    queryFn: () => (id ? clientBookingApi.getBookingById(id) : null),
    enabled: !!id,
  });
};

// Create a new booking
export const useCreateClientBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: ClientBookingCreateUpdateData) =>
      clientBookingApi.createBooking(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientBookings"] });
    },
  });
};

// Update a booking
export const useUpdateClientBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: string;
      updateData: Partial<ClientBookingCreateUpdateData>;
    }) => clientBookingApi.updateBooking(id, updateData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clientBookings"] });
      queryClient.invalidateQueries({
        queryKey: ["clientBooking", variables.id],
      });
    },
  });
};

// Delete a booking
export const useDeleteClientBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientBookingApi.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientBookings"] });
    },
  });
};
