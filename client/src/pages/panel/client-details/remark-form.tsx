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
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { useVisits } from "@/store/visit"; // Adjust the path as needed
import { CustomAxiosError } from "@/utils/types/axios";
import { useToast } from "@/hooks/use-toast";
import withStopPropagation from "@/utils/events/withStopPropagation";

interface RemarkFormProps {
  id: string; // This will be the visitId
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
}

export const RemarkForm = ({ id, isOpen, onOpenChange }: RemarkFormProps) => {
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<string>("");
  const { toast } = useToast();
  const { createRemarkMutation } = useVisits();

  const validateForm = (): string => {
    let newErrors: string = "";

    if (!remark.trim()) {
      newErrors = "Remark is required";
    } else if (remark.trim().length < 5) {
      newErrors = "Remark must be at least 5 characters long";
    } else if (remark.trim().length > 500) {
      newErrors = "Remark cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      return toast({
        title: "Remark submission error",
        description: validateForm(),
        variant: "warning",
      });
    }

    try {
      await createRemarkMutation.mutateAsync({
        visitId: id,
        remark: remark.trim(),
      });

      toast({
        title: "Remark added successfully",
        description: "Your remark has been saved for future reference.",
        variant: "success",
      });

      // Reset form and close dialog
      setRemark("");
      onOpenChange(false);
    } catch (error) {
      const err = error as CustomAxiosError;
      toast({
        title: "Failed to add remark",
        description:
          err.response?.data.error ||
          "There was an error saving your remark. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setRemark("");
    setErrors("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="sm:max-w-[525px] p-6 gap-6 rounded-lg"
        onClick={withStopPropagation()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <MessageSquare className="h-5 w-5 mt-1" />
            <DialogTitle className="text-xl font-semibold">
              Client Remark
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500">
            Add your remarks or notes related to the client's visit. These will
            be saved for future reference.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <FormFieldWrapper LabelText="Remark" Important ImportantSide="right">
            <Textarea
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (errors) {
                  setErrors("");
                }
              }}
              placeholder="Enter your observations or comments here..."
              className={`min-h-32 resize-none ${errors ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {remark.trim().length > 0 && (
              <div className="text-xs text-gray-500 mt-1 text-right">
                {remark.trim().length}/500
              </div>
            )}
          </FormFieldWrapper>
        </div>
        <DialogFooter className="gap-3 sm:gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={createRemarkMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={!remark.trim() || createRemarkMutation.isPending}
          >
            {createRemarkMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Remark"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
