// query.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingLedgerApi } from "./api";
import { BookingLedgerFilters, SoftDeletePayload } from "./types";

export const useBookingLedger = () => {
  const queryClient = useQueryClient();

  // Query Keys
  const QUERY_KEYS = {
    PAYMENTS_BY_CLIENT: (
      clientId: string,
      filters: Partial<BookingLedgerFilters>,
    ) => ["bookingLedger", "client", clientId, filters],
  };

  // Queries
  // -------

  // Get payments by client with filters
  const usePaymentsByClient = (
    clientId: string,
    filters: Partial<BookingLedgerFilters> = {},
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.PAYMENTS_BY_CLIENT(clientId, filters),
      queryFn: () => bookingLedgerApi.getPaymentsByClient(clientId, filters),
      enabled: !!clientId,
      staleTime: 1 * 60 * 1000, // 1 minute
      placeholderData: (previousData) => previousData,
    });

  // Mutations
  // ---------

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: bookingLedgerApi.createPayment,
    onSuccess: (data) => {
      // Invalidate all payment queries for this client
      queryClient.invalidateQueries({
        queryKey: ["bookingLedger", "client", data.data.clientId],
      });
    },
    onError: (error) => {
      console.error("Failed to create payment:", error);
    },
  });

  // Soft delete payment mutation
  const softDeletePaymentMutation = useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: string;
      payload: SoftDeletePayload;
    }) => bookingLedgerApi.softDeletePayment(paymentId, payload),
    onSuccess: (data) => {
      // Invalidate all payment queries for this client
      queryClient.invalidateQueries({
        queryKey: ["bookingLedger", "client", data.data.clientId],
      });
    },
    onError: (error) => {
      console.error("Failed to delete payment:", error);
    },
  });

  // Restore payment mutation
  const restorePaymentMutation = useMutation({
    mutationFn: bookingLedgerApi.restorePayment,
    onSuccess: (data) => {
      // Invalidate all payment queries for this client
      queryClient.invalidateQueries({
        queryKey: ["bookingLedger", "client", data.data.clientId],
      });
    },
    onError: (error) => {
      console.error("Failed to restore payment:", error);
    },
  });

  // Helper functions
  // ---------------

  // Prefetch payments for a client
  const prefetchPaymentsByClient = (
    clientId: string,
    filters: Partial<BookingLedgerFilters> = {},
  ) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.PAYMENTS_BY_CLIENT(clientId, filters),
      queryFn: () => bookingLedgerApi.getPaymentsByClient(clientId, filters),
      staleTime: 1 * 60 * 1000,
    });
  };

  // Invalidate all payment queries for a specific client
  const invalidateClientPayments = (clientId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["bookingLedger", "client", clientId],
    });
  };

  // Invalidate all booking ledger queries
  const invalidateAllPayments = () => {
    queryClient.invalidateQueries({
      queryKey: ["bookingLedger"],
    });
  };

  return {
    // Queries
    usePaymentsByClient,

    // Mutations
    createPaymentMutation,
    softDeletePaymentMutation,
    restorePaymentMutation,

    // Helper functions
    prefetchPaymentsByClient,
    invalidateClientPayments,
    invalidateAllPayments,
  };
};
