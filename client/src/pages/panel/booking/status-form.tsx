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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useUpdateClientBooking } from "@/store/client-booking/query";
import { ClientBooking } from "@/store/client-booking/types";
import { CustomAxiosError } from "@/utils/types/axios";
import { useState } from "react";

interface BookingStatusFormProps {
  booking: ClientBooking;
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
}

export const BookingStatusForm = ({
  booking,
  isOpen,
  onOpenChange,
}: BookingStatusFormProps) => {
  const [bookingStatus, setBookingStatus] = useState(booking.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateBookingMutation = useUpdateClientBooking();

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await updateBookingMutation.mutateAsync({
        id: booking._id,
        updateData: { status: bookingStatus },
      });
      toast({
        title: "Status Updated",
        description: "The booking status has been successfully updated.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      const err = error as CustomAxiosError;
      toast({
        title: "Update Failed",
        description:
          err.response?.data.error ||
          "An unknown error occurred while updating the booking status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">
            Update Booking Status
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {booking.applicant}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <FormFieldWrapper
            Important
            ImportantSide="right"
            LabelText="Booking Status"
            className="gap-3"
          >
            <Select
              value={bookingStatus}
              onValueChange={setBookingStatus}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="registeration-process">
                    Registration Process
                  </SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="loan-process">Loan Process</SelectItem>
                  <SelectItem value="cnc">CNC</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || bookingStatus == booking.status}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
