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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useInventory } from "@/store/inventory";
import { formatZodMessagesOnly } from "@/utils/func/zodUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { bankDetailsSchema } from "@/utils/zod-schema/inventory";
import { useState } from "react";

interface BankDetails {
  holderName: string;
  accountNumber: string;
  name: string;
  branch: string;
  ifscCode: string;
  accountType: "saving" | "current";
}

interface BankDetailsFormProps {
  projectId: string;
  bankDetails?: BankDetails;
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
}

export const BankDetailsForm = ({
  projectId,
  bankDetails,
  isOpen,
  onOpenChange,
}: BankDetailsFormProps) => {
  const { updateProjectMutation } = useInventory();
  const [formData, setFormData] = useState<BankDetails>({
    holderName: bankDetails?.holderName || "",
    accountNumber: bankDetails?.accountNumber || "",
    name: bankDetails?.name || "",
    branch: bankDetails?.branch || "",
    ifscCode: bankDetails?.ifscCode || "",
    accountType: bankDetails?.accountType || "current",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountTypes: Array<{ value: "saving" | "current"; label: string }> = [
    { value: "saving", label: "Saving Account" },
    { value: "current", label: "Current Account" },
  ];

  const handleInputChange = (field: keyof BankDetails, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.holderName.trim() !== "" &&
      formData.accountNumber.trim() !== "" &&
      formData.name.trim() !== "" &&
      formData.branch.trim() !== "" &&
      formData.ifscCode.trim() !== "" &&
      formData.accountType
    );
  };

  const hasChanges = () => {
    if (!bankDetails) return true;
    return (
      formData.holderName !== bankDetails.holderName ||
      formData.accountNumber !== bankDetails.accountNumber ||
      formData.name !== bankDetails.name ||
      formData.branch !== bankDetails.branch ||
      formData.ifscCode !== bankDetails.ifscCode ||
      formData.accountType !== bankDetails.accountType
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const validation = bankDetailsSchema.safeParse(formData);
    if (!validation.success) {
      const errorMessages = formatZodMessagesOnly(validation.error.errors);
      toast({
        title: "Form Validation Error",
        description: `Please correct the following errors:\n${errorMessages}`,
        variant: "warning",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await updateProjectMutation.mutateAsync({
        projectId: projectId,
        bank: formData,
      });

      toast({
        title: "Bank Details Saved",
        description: "The bank details have been successfully updated.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save bank details:", error);
      const err = error as CustomAxiosError;
      toast({
        title: "Save Failed",
        description:
          err.response?.data.error ||
          "An unknown error occurred while saving the bank details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (bankDetails) {
      setFormData(bankDetails);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md px-2">
        <DialogHeader className="space-y-2 px-4">
          <DialogTitle className="text-xl font-semibold">
            {bankDetails ? "Update Bank Details" : "Add Bank Details"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter the bank account information for transactions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(100svh-200px)] px-4">
          <div className="py-4 space-y-4">
            <FormFieldWrapper
              Important
              ImportantSide="right"
              LabelText="Account Holder Name"
              className="gap-3"
            >
              <Input
                value={formData.holderName}
                onChange={(e) =>
                  handleInputChange("holderName", e.target.value)
                }
                placeholder="Enter account holder name"
                disabled={isSubmitting}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              Important
              ImportantSide="right"
              LabelText="Account Number"
              className="gap-3"
            >
              <Input
                value={formData.accountNumber}
                onChange={(e) =>
                  handleInputChange("accountNumber", e.target.value)
                }
                placeholder="Enter account number"
                disabled={isSubmitting}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              Important
              ImportantSide="right"
              LabelText="Bank Name"
              className="gap-3"
            >
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter bank name"
                disabled={isSubmitting}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              Important
              ImportantSide="right"
              LabelText="Branch"
              className="gap-3"
            >
              <Input
                value={formData.branch}
                onChange={(e) => handleInputChange("branch", e.target.value)}
                placeholder="Enter branch name"
                disabled={isSubmitting}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              Important
              ImportantSide="right"
              LabelText="IFSC Code"
              className="gap-3"
            >
              <Input
                value={formData.ifscCode}
                onChange={(e) =>
                  handleInputChange("ifscCode", e.target.value.toUpperCase())
                }
                placeholder="Enter IFSC code"
                disabled={isSubmitting}
                maxLength={11}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              Important
              ImportantSide="right"
              LabelText="Account Type"
              className="gap-3"
            >
              <Select
                value={formData.accountType}
                onValueChange={(value) =>
                  handleInputChange("accountType", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>

          <DialogFooter className="flex justify-end gap-2 py-2 px-1">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !isFormValid() || !hasChanges()}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
