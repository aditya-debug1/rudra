// src/hooks/useRegisteredClients.ts
import { useQuery } from "@tanstack/react-query";
import { registeredClientsApi, RegisteredClientsFilters } from "./api";

export const useRegisteredClients = () => {
  // Get registered clients by project
  const useRegisteredClientsByProject = (
    project: string,
    filters: RegisteredClientsFilters = {},
  ) =>
    useQuery({
      queryKey: ["registeredClients", "project", project, filters],
      queryFn: () =>
        registeredClientsApi.getRegisteredClientsByProject(project, filters),
      enabled: !!project,
      staleTime: 2 * 60 * 1000, // 2 minutes
      placeholderData: (previousData) => previousData,
    });

  // Get summary for all projects
  const useAllProjectsSummary = (filters: RegisteredClientsFilters = {}) =>
    useQuery({
      queryKey: ["registeredClients", "summary", filters],
      queryFn: () => registeredClientsApi.getAllProjectsSummary(filters),
      staleTime: 2 * 60 * 1000, // 2 minutes
      placeholderData: (previousData) => previousData,
    });

  return {
    useRegisteredClientsByProject,
    useAllProjectsSummary,
  };
};
