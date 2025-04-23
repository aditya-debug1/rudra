// src/hooks/useClientPartners.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientPartnerApi, EmployeeData } from "./api";

// Central hook for client partner-related queries and mutations
export const useClientPartners = () => {
  const queryClient = useQueryClient();

  // Get client partners with filters
  const useClientPartnersList = (
    filters = { page: 1, limit: 10, search: "" },
  ) =>
    useQuery({
      queryKey: ["clientPartners", filters],
      queryFn: () => clientPartnerApi.getAllClientPartners(filters),
      staleTime: 1 * 60 * 1000, // 1 minute
      placeholderData: (previousData) => previousData,
    });

  // Get a single client partner
  const useClientPartnerDetails = (id: string) =>
    useQuery({
      queryKey: ["clientPartner", id],
      queryFn: () => clientPartnerApi.getClientPartner(id),
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  // Get reference list
  const useReference = () =>
    useQuery({
      queryKey: ["referenceList"],
      queryFn: () => clientPartnerApi.getReference(false),
      enabled: true,
      staleTime: 1 * 60 * 1000, // 1 minutes
    });

  const useReferenceWithDelete = () =>
    useQuery({
      queryKey: ["referenceListwithDelete"],
      queryFn: () => clientPartnerApi.getReference(true),
      enabled: true,
      staleTime: 1 * 60 * 1000, // 1 minutes
    });

  // Create client partner mutation
  const createClientPartnerMutation = useMutation({
    mutationFn: clientPartnerApi.createClientPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "clientPartners",
          "referenceList",
          "referenceListwithDelete",
        ],
      });
    },
    onError: (error) => {
      console.error("Failed to create client partner:", error);
    },
  });

  // Update client partner mutation
  const updateClientPartnerMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & Parameters<
      typeof clientPartnerApi.updateClientPartner
    >[1]) => clientPartnerApi.updateClientPartner(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["clientPartner", data.cp._id], data.cp);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "clientPartners",
          "referenceList",
          "referenceListwithDelete",
        ],
      });
    },
    onError: (error) => {
      console.error("Failed to update client partner:", error);
    },
  });

  // Delete client partner mutation
  const deleteClientPartnerMutation = useMutation({
    mutationFn: clientPartnerApi.deleteClientPartner,
    onSuccess: (_, id) => {
      // Remove client partner details query
      queryClient.removeQueries({
        queryKey: ["clientPartner", id, "referenceList"],
      });
      // Invalidate client partners list to refetch latest data
      queryClient.invalidateQueries({ queryKey: ["clientPartners"] });
    },
    onError: (error) => {
      console.error("Failed to delete client partner:", error);
    },
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: ({
      id,
      employeeData,
    }: {
      id: string;
      employeeData: EmployeeData;
    }) => clientPartnerApi.addEmployee(id, employeeData),
    onSuccess: (data) => {
      queryClient.setQueryData(["clientPartner", data.cp._id], data.cp);
      queryClient.invalidateQueries({
        queryKey: [
          "clientPartners",
          "referenceList",
          "referenceListwithDelete",
        ],
      });
    },
    onError: (error) => {
      console.error("Failed to add employee:", error);
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: ({
      id,
      employeeId,
      employeeData,
    }: {
      id: string;
      employeeId: string;
      employeeData: Partial<EmployeeData>;
    }) => clientPartnerApi.updateEmployee(id, employeeId, employeeData),
    onSuccess: (data) => {
      queryClient.setQueryData(["clientPartner", data.cp._id], data.cp);
      queryClient.invalidateQueries({
        queryKey: [
          "clientPartners",
          "referenceList",
          "referenceListwithDelete",
        ],
      });
    },
    onError: (error) => {
      console.error("Failed to update employee:", error);
    },
  });

  // Remove employee mutation
  const removeEmployeeMutation = useMutation({
    mutationFn: ({ id, employeeId }: { id: string; employeeId: string }) =>
      clientPartnerApi.removeEmployee(id, employeeId),
    onSuccess: (data) => {
      queryClient.setQueryData(["clientPartner", data.cp._id], data.cp);
      queryClient.invalidateQueries({
        queryKey: ["clientPartners", "clientPartner", "referenceList"],
      });
    },
    onError: (error) => {
      console.error("Failed to remove employee:", error);
    },
  });

  return {
    useClientPartnersList,
    useClientPartnerDetails,
    useReference,
    useReferenceWithDelete,
    createClientPartnerMutation,
    updateClientPartnerMutation,
    deleteClientPartnerMutation,
    addEmployeeMutation,
    updateEmployeeMutation,
    removeEmployeeMutation,
  };
};
