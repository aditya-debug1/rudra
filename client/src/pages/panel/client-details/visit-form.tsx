import { Combobox, ComboboxOption } from "@/components/custom ui/combobox";
import { DatePickerV2 } from "@/components/custom ui/date-time-pickers";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { VisitType } from "@/store/client";
import { useClientPartners } from "@/store/client-partner";
import { ignoreRole, refDefaultOptions } from "@/store/data/options";
import { useUsersSummary } from "@/store/users";
import { useVisits } from "@/store/visit";
import withStopPropagation from "@/utils/events/withStopPropagation";
import { formatZodErrors } from "@/utils/func/zodUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { VisitSchema } from "@/utils/zod-schema/client";
import { DialogDescription } from "@radix-ui/react-dialog";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";

const VisitFormSchema = VisitSchema.pick({
  date: true,
  reference: true,
  source: true,
  relation: true,
  closing: true,
}).extend({
  status: z.union([
    z.literal("lost"),
    z.literal("cold"),
    z.literal("warm"),
    z.literal("hot"),
    z.literal("booked"),
  ]),
});

interface VisitFormProps {
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
  clientId?: string;
  initialData?: VisitType;
  mode: "add" | "update";
}

export const VisitForm = ({
  isOpen,
  onOpenChange,
  clientId,
  initialData,
  mode,
}: VisitFormProps) => {
  // Hooks
  const { createVisitMutation, updateVisitMutation } = useVisits();
  const { useReference } = useClientPartners();
  const { data: users } = useUsersSummary();
  const { toast } = useToast();

  const defaultValues = useMemo(
    () => ({
      date: new Date(),
      reference: "",
      source: "",
      relation: "",
      closing: "",
      status: null,
    }),
    [],
  );

  const [formData, setFormData] =
    useState<Omit<VisitType, "_id" | "remarks">>(defaultValues);
  const [oldData, setOldData] =
    useState<Omit<VisitType, "_id" | "remarks">>(defaultValues);

  // Define reference options
  const { data: refData } = useReference();

  const refDynamicOptions: ComboboxOption[] =
    refData?.references?.map((ref) => ({
      label: `${ref.firstName} ${ref.lastName}${ref.companyName ? ` (${ref.companyName})` : ""}`,
      value: ref._id,
    })) || [];

  const referenceOptions: ComboboxOption[] = [
    ...refDefaultOptions,
    ...refDynamicOptions,
  ];

  //Define manager options
  const managerOptions = [{ label: "N/A", value: "N/A" }].concat(
    users
      ?.filter((user) => !user.roles.some((role) => ignoreRole.includes(role)))
      .map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.username,
      })) || [],
  );

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
    if (mode === "update" && initialData) {
      // Extract only the needed fields from initialData
      const { date, reference, source, relation, closing, status } =
        initialData;

      // Create the value object with destructuring
      const value = { date, reference, source, relation, closing, status };

      setFormData(value);
      setOldData(value);
    } else if (mode === "add") {
      // Reset to default values when in add mode
      setFormData(defaultValues);
      setOldData(defaultValues);
    }
  }, [initialData, mode, defaultValues]);

  const handleDateChange = (date: Date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handleInputChange = (
    field: keyof Omit<VisitType, "_id" | "date" | "remarks" | "status">,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (value: string) => {
    const status = value as VisitType["status"] | null;
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleCancel = () => {
    onOpenChange(false);
    handleInitialLoad();
  };

  const handleSubmit = () => {
    // Create a validated version of the data with the date properly formatted
    const dataToValidate = {
      ...formData,
      date: new Date(formData.date), // Ensure date is a Date object
    };

    const validation = VisitFormSchema.safeParse(dataToValidate);

    if (!validation.success) {
      const errorMessages = formatZodErrors(validation.error.errors);
      toast({
        title: "Form Validation Error",
        description: `Please correct the following errors:\n${errorMessages}`,
        variant: "warning",
      });
      return;
    }

    try {
      if (mode === "add" && clientId) {
        createVisitMutation.mutate({
          clientId,
          visitData: dataToValidate, // Use the validated data
        });
      } else if (mode === "update" && initialData?._id) {
        updateVisitMutation.mutate({
          id: initialData._id,
          visitData: dataToValidate, // Use the validated data
        });
      }

      toast({
        title: `Visit ${mode == "add" ? "added" : "updated"} successfully`,
        description: `Your visit has been ${mode == "add" ? "added" : "updated"}`,
        variant: "success",
      });

      onOpenChange(false);
    } catch (error) {
      const err = error as CustomAxiosError;
      toast({
        title: `Failed to ${mode == "add" ? "add" : "update"} visit`,
        description:
          err.response?.data.error ||
          "There was an error saving your visit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // useEffects
  useEffect(() => {
    handleInitialLoad();
  }, [handleInitialLoad]);

  // Dynamic variables
  const isSubmitting =
    createVisitMutation.isPending || updateVisitMutation.isPending;
  const isDataChanged = mode == "update" ? isEqual(formData, oldData) : false;
  const formTitle = mode === "add" ? "Add Visit" : "Update Visit";
  const formDescription =
    mode === "add"
      ? "Fill the form to create a new visit"
      : "Update the visit information";

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh]"
        onClick={withStopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{formDescription}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[64vh] pr-4">
          <div className="space-y-4 my-4">
            {/* Visit Date - Full width */}
            <FormFieldWrapper
              LabelText="Visit Date"
              Important
              ImportantSide="right"
            >
              <DatePickerV2
                className="sm:w-full"
                defaultDate={new Date(formData.date)}
                onDateChange={handleDateChange}
              />
            </FormFieldWrapper>

            {/* Row 1: Reference and Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormFieldWrapper
                LabelText="Reference"
                Important
                ImportantSide="right"
              >
                <Combobox
                  value={formData.reference}
                  width="w-full"
                  options={referenceOptions}
                  onChange={(value) => handleInputChange("reference", value)}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                LabelText="Source"
                Important
                ImportantSide="right"
              >
                <Combobox
                  value={formData.source}
                  width="w-full"
                  options={managerOptions}
                  onChange={(value) => handleInputChange("source", value)}
                  placeholder="Select source"
                  emptyMessage="No source found"
                />
              </FormFieldWrapper>
            </div>

            {/* Row 2: Relation and Closing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormFieldWrapper
                LabelText="Relation"
                Important
                ImportantSide="right"
              >
                <Combobox
                  value={formData.relation}
                  width="w-full"
                  options={managerOptions}
                  onChange={(value) => handleInputChange("relation", value)}
                  placeholder="Select relation"
                  emptyMessage="No relation found"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                LabelText="Closing"
                Important
                ImportantSide="right"
              >
                <Combobox
                  value={formData.closing}
                  width="w-full"
                  options={managerOptions}
                  onChange={(value) => handleInputChange("closing", value)}
                  placeholder="Select closing"
                  emptyMessage="No closing found"
                />
              </FormFieldWrapper>
            </div>

            {/* Status - Full width */}
            <FormFieldWrapper
              LabelText="Status"
              Important
              ImportantSide="right"
            >
              <Combobox
                value={formData.status || ""}
                width="w-full"
                options={statusOptions}
                onChange={handleStatusChange}
                placeholder="Select status"
                emptyMessage="No status found"
              />
            </FormFieldWrapper>
          </div>

          <div className="flex flex-col-reverse justify-center items-stretch gap-3 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
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
              {isSubmitting ? "Saving..." : "Save Visit"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
