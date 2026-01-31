import { Combobox } from "@/components/custom ui/combobox";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VisitType } from "@/store/client";
import { useVisits } from "@/store/visit";
import withStopPropagation from "@/utils/events/withStopPropagation";
import { toProperCase } from "@/utils/func/strUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { useCallback, useEffect, useState } from "react";

interface StatusChangeFormProps {
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
  initialData?: VisitType;
}

export const StatusChangeForm = ({
  isOpen,
  onOpenChange,
  initialData,
}: StatusChangeFormProps) => {
  // Hooks
  const { updateVisitMutation } = useVisits();
  const { toast } = useToast();

  const [status, setStatus] = useState<VisitType["status"] | null>(null);
  const [initialStatus, setInitialStatus] = useState<
    VisitType["status"] | null
  >(null);

  // Define status options
  const statusOptions = [
    { label: "Lost", value: "lost" },
    { label: "Cold", value: "cold" },
    { label: "Warm", value: "warm" },
    { label: "Hot", value: "hot" },
    { label: "Booked", value: "booked" },
  ];

  // Event Handlers
  const handleInitialLoad = useCallback(() => {
    if (initialData) {
      setStatus(initialData.status);
      setInitialStatus(initialData.status);
    }
  }, [initialData]);

  const handleStatusChange = (value: string) => {
    const newStatus = value as VisitType["status"] | null;
    setStatus(newStatus);
  };

  const handleCancel = () => {
    onOpenChange(false);
    handleInitialLoad();
  };

  const handleSubmit = () => {
    if (!status) {
      toast({
        title: "Validation Error",
        description: "Please select a status",
        variant: "warning",
      });
      return;
    }

    if (!initialData?._id) {
      toast({
        title: "Error",
        description: "Visit ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      updateVisitMutation.mutate({
        id: initialData._id,
        visitData: {
          ...initialData,
          status,
        },
      });

      toast({
        title: "Status updated successfully",
        description: `Visit status changed to ${toProperCase(status)}`,
        variant: "success",
      });

      onOpenChange(false);
    } catch (error) {
      const err = error as CustomAxiosError;
      toast({
        title: "Failed to update status",
        description:
          err.response?.data.error ||
          "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // useEffects
  useEffect(() => {
    handleInitialLoad();
  }, [handleInitialLoad]);

  // Dynamic variables
  const isSubmitting = updateVisitMutation.isPending;
  const isDataChanged = status === initialStatus;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md" onClick={withStopPropagation()}>
        <DialogHeader>
          <DialogTitle>Update Visit Status</DialogTitle>
          <DialogDescription>Change the status of this visit</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <FormFieldWrapper LabelText="Status" Important ImportantSide="right">
            <Combobox
              value={status || ""}
              width="w-full"
              options={statusOptions}
              onChange={handleStatusChange}
              placeholder="Select status"
              emptyMessage="No status found"
            />
          </FormFieldWrapper>
        </div>

        <div className="flex flex-col-reverse justify-center items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isDataChanged}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
