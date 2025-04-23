import { useMutation, useQueryClient } from "@tanstack/react-query";
import { visitApi } from "./api";
import { VisitType } from "../client";

type VisitPayload = Omit<VisitType, "client">;

export const useVisits = () => {
  const queryClient = useQueryClient();

  const invalidateVisits = () => {
    queryClient.invalidateQueries({ queryKey: ["client-visits"] });
    queryClient.invalidateQueries({ queryKey: ["client"] });
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

  const handleError = (action: string) => (error: unknown) => {
    console.error(`Failed to ${action}:`, error);
  };

  const createVisitMutation = useMutation({
    mutationFn: ({
      clientId,
      visitData,
    }: {
      clientId: string;
      visitData: VisitPayload;
    }) => visitApi.createVisit(clientId, visitData),
    onSuccess: invalidateVisits,
    onError: handleError("create visit"),
  });

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, visitData }: { id: string; visitData: VisitPayload }) =>
      visitApi.updateVisit(id, visitData),
    onSuccess: invalidateVisits,
    onError: handleError("update visit"),
  });

  const deleteVisitMutation = useMutation({
    mutationFn: (id: string) => visitApi.deleteVisit(id),
    onSuccess: invalidateVisits,
    onError: handleError("delete visit"),
  });

  const createRemarkMutation = useMutation({
    mutationFn: ({ visitId, remark }: { visitId: string; remark: string }) =>
      visitApi.createRemark(visitId, remark),
    onSuccess: invalidateVisits,
    onError: handleError("create remark"),
  });

  const deleteRemarkMutation = useMutation({
    mutationFn: ({
      visitId,
      remarkId,
    }: {
      visitId: string;
      remarkId: string;
    }) => visitApi.deleteRemark(visitId, remarkId),
    onSuccess: invalidateVisits,
    onError: handleError("delete remark"),
  });

  return {
    createVisitMutation,
    updateVisitMutation,
    deleteVisitMutation,
    createRemarkMutation,
    deleteRemarkMutation,
  };
};
