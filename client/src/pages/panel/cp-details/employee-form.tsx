import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { EmployeeData, useClientPartners } from "@/store/client-partner";
import withStopPropagation from "@/utils/events/withStopPropagation";
import { formatZodErrors } from "@/utils/func/zodUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { employeeSchema } from "@/utils/zod-schema/client-partner";
import { isEqual } from "lodash";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface EmpType extends EmployeeData {
  id: string;
}

interface EmployeeFormProps {
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
  cpId?: string;
  initialData?: EmpType;
  mode: "add" | "update";
}

export default function EmployeeFormDialog({
  isOpen,
  onOpenChange,
  cpId,
  initialData,
  mode,
}: EmployeeFormProps) {
  // Hooks
  const { addEmployeeMutation, updateEmployeeMutation } = useClientPartners();
  const { toast } = useToast();

  const defaultValues = useMemo(
    () => ({
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      altNo: "",
      position: "",
      commissionPercentage: 0,
      referredClients: [],
    }),
    [],
  );
  const empId = initialData?.id;

  // states
  const [formData, setFormData] = useState<EmployeeData>(defaultValues);
  const [oldData, setOldData] = useState<EmployeeData>(defaultValues);

  const handleInitialLoad = useCallback(() => {
    if (mode === "update" && initialData) {
      // Extract only the needed fields from initialData
      const {
        firstName,
        lastName,
        email,
        phoneNo,
        altNo,
        position,
        commissionPercentage,
      } = initialData;

      // Create the value object with destructuring
      const value = {
        firstName,
        lastName,
        email,
        phoneNo,
        altNo,
        position,
        commissionPercentage,
      };

      setFormData(value);
      setOldData(value);
    } else if (mode === "add") {
      // Reset to default values when in add mode
      setFormData(defaultValues);
      setOldData(defaultValues);
    }
  }, [initialData, mode, defaultValues]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "commissionPercentage" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCancel = () => {
    onOpenChange(false);
    handleInitialLoad();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const validation = employeeSchema.safeParse(formData);

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
      if (mode === "add" && cpId) {
        addEmployeeMutation.mutateAsync({ id: cpId, employeeData: formData });
      } else if (mode === "update" && empId && cpId) {
        updateEmployeeMutation.mutateAsync({
          id: cpId,
          employeeId: empId,
          employeeData: formData,
        });
      }

      toast({
        title: `Employee ${mode == "add" ? "added" : "updated"} successfully`,
        description: `Employee has been ${mode == "add" ? "added" : "updated"}`,
        variant: "success",
      });

      onOpenChange(false);
    } catch (error) {
      const err = error as CustomAxiosError;
      toast({
        title: `Failed to ${mode == "add" ? "add" : "update"} employee`,
        description:
          err.response?.data.error ||
          "There was an error saving your employee. Please try again.",
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
    addEmployeeMutation.isPending || updateEmployeeMutation.isPending;
  const isDataChanged = mode == "update" ? isEqual(formData, oldData) : false;
  const formTitle = mode === "add" ? "Add Employee" : "Update Employee";
  const formDescription =
    mode === "add"
      ? "Fill in the employee details and submit the form"
      : "Update the employee information";

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="w-[90vw] sm:max-w-md max-h-[90vh]"
        onClick={withStopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{formDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4 pb-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormFieldWrapper LabelText="Name" Important ImportantSide="right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  placeholder="Last Name"
                  onChange={handleChange}
                  required
                />
              </div>
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Email">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. johndoe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              LabelText="Phone Number"
              Important
              ImportantSide="right"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  id="phoneNo"
                  name="phoneNo"
                  placeholder="Primary Number"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  required
                />
                <Input
                  id="altNo"
                  name="altNo"
                  placeholder="Alt Number (Optional)"
                  value={formData.altNo}
                  onChange={handleChange}
                />
              </div>
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Position">
              <Input
                id="position"
                name="position"
                placeholder="e.g. Manager"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Commission Percentage">
              <Input
                id="commissionPercentage"
                name="commissionPercentage"
                type="number"
                max="100"
                min="0"
                step="0.01"
                value={formData.commissionPercentage}
                onChange={handleChange}
                required
              />
            </FormFieldWrapper>
          </form>
          <DialogFooter className="flex gap-2 pt-4 mt-4">
            <Button
              type="button"
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
              {isSubmitting ? "Saving..." : "Save Employee"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
