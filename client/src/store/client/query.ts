// src/hooks/useClients.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "./api";

// Central hook for client-related queries and mutations
export const useClients = () => {
  const queryClient = useQueryClient();

  // Get clients with filters
  const useClientsList = (filters = { page: 1, limit: 10, search: "" }) =>
    useQuery({
      queryKey: ["clients", filters],
      queryFn: () => clientApi.getClients(filters),
      staleTime: 1 * 60 * 1000, // 1 minutes
      placeholderData: (previousData) => previousData,
    });

  // Get a single client
  const useClientDetails = (id: string) =>
    useQuery({
      queryKey: ["client", id],
      queryFn: () => {
        return clientApi.getClient(id);
      },
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: clientApi.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      console.error("Failed to create client:", error);
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & Parameters<typeof clientApi.updateClient>[1]) =>
      clientApi.updateClient(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["client", data.client._id], data.client);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      console.error("Failed to update client:", error);
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: clientApi.deleteClient,
    onSuccess: (_, id) => {
      // Remove client details query
      queryClient.removeQueries({ queryKey: ["client", id] });

      // Invalidate clients list to refetch latest data
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      console.error("Failed to delete client:", error);
    },
  });

  return {
    useClientsList,
    useClientDetails,
    createClientMutation,
    updateClientMutation,
    deleteClientMutation,
  };
};
