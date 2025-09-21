import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { hasPermission } from "@/hooks/use-role";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import { GetBookingLedgerByClientResponse } from "@/store/booking-ledger";
import { CirclePlus, FilterX, Printer } from "lucide-react";
import { useState } from "react";

interface BookingLedgerHeaderProps {
  data: GetBookingLedgerByClientResponse | undefined;
  handlePageChange: (pageno: number) => void;
  handleGenerateLetter: (
    isSigned?: boolean,
    includeLetterHead?: boolean,
    interestData?:
      | { type: "amount"; value: number }
      | { type: "months"; value: number },
  ) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  handleAddPayment: () => void;
}

export const BookingLedgerHeader = ({
  data,
  handlePageChange,
  handleGenerateLetter,
  isFiltered,
  clearFilter,
  handleAddPayment,
}: BookingLedgerHeaderProps) => {
  const { combinedRole } = useAuth(true);
  const canCreatePayments = hasPermission(
    combinedRole,
    "BookingLedger",
    "add-booking-payment",
  );

  return (
    <div className="mb-3 w-full flex flex-wrap gap-3 items-center justify-around md:justify-between">
      <div className="flex gap-2">
        {canCreatePayments && (
          <Tooltip content="Add Payment">
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleAddPayment}
              size="icon"
            >
              <CirclePlus size={20} />
            </Button>
          </Tooltip>
        )}

        <PrintModal handleGenerateLetter={handleGenerateLetter} />

        {isFiltered && (
          <Tooltip content="Clear Filter">
            <Button variant="outline" size="icon" onClick={clearFilter}>
              <FilterX size={20} />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Pagination controls */}
      {data && (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={data.currentPage <= 1}
            onClick={() => handlePageChange(data.currentPage - 1)}
          >
            Previous
          </Button>

          <span className="px-2 text-sm whitespace-nowrap">
            Page {data.currentPage} of {data.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={data.currentPage >= data.totalPages}
            onClick={() => handlePageChange(data.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

interface PrintModalProps {
  handleGenerateLetter: (
    isSigned?: boolean,
    includeLetterHead?: boolean,
    interestData?:
      | { type: "amount"; value: number }
      | { type: "months"; value: number },
  ) => void;
}

function PrintModal({ handleGenerateLetter }: PrintModalProps) {
  const [includeLetterHead, setIncludeLetterHead] = useState(true);
  const [isSigned, setIsSigned] = useState(true);
  const [letterType, setLetterType] = useState("demand");
  const [interestCalculationType, setInterestCalculationType] =
    useState("manual"); // "manual" or "calculated"
  const [interestAmt, setInterestAmt] = useState("");
  const [months, setMonths] = useState("");
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    if (letterType === "interest") {
      let interestData:
        | { type: "amount"; value: number }
        | { type: "months"; value: number };

      if (interestCalculationType === "manual") {
        const amount = parseFloat(interestAmt);
        if (!amount || amount <= 0) {
          return toast({
            title: "Letter Creation Error",
            description: "Please enter a valid interest amount",
            variant: "warning",
          });
        }
        interestData = { type: "amount", value: amount };
      } else if (interestCalculationType === "calculated") {
        const monthsNum = parseInt(months);
        if (!monthsNum || monthsNum <= 0) {
          return toast({
            title: "Letter Creation Error",
            description: "Please enter a valid number of months",
            variant: "warning",
          });
        }
        interestData = { type: "months", value: monthsNum };
      } else {
        return;
      }

      handleGenerateLetter(isSigned, includeLetterHead, interestData);
    } else {
      handleGenerateLetter(isSigned, includeLetterHead);
    }

    setOpen(false);
  };

  const resetForm = () => {
    setLetterType("demand");
    setInterestCalculationType("manual");
    setInterestAmt("");
    setMonths("");
    setIncludeLetterHead(true);
    setIsSigned(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <Tooltip content="Print Options">
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="flex items-center gap-1"
          >
            <Printer size={20} />
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent className="sm:max-w-md px-2">
        <DialogHeader className="px-4">
          <DialogTitle>Print Options</DialogTitle>
          <DialogDescription>
            Configure your print settings before generating the document.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(100svh-140px)] px-4">
          <div className="space-y-6 py-4">
            <div className="space-y-2 mx-1">
              <Label htmlFor="letterType" className="text-sm font-medium">
                Letter Type
              </Label>
              <Select value={letterType} onValueChange={setLetterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select letter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand">Demand</SelectItem>
                  <SelectItem value="interest">Interest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {letterType === "interest" && (
              <div className="space-y-4 mx-1">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Interest Calculation Method
                  </Label>
                  <RadioGroup
                    value={interestCalculationType}
                    onValueChange={setInterestCalculationType}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="text-sm">
                        Manual Amount Entry
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="calculated" id="calculated" />
                      <Label htmlFor="calculated" className="text-sm">
                        Calculate by Months
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {interestCalculationType === "manual" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="interestAmt"
                      className="text-sm font-medium"
                    >
                      Interest Amount
                    </Label>
                    <Input
                      id="interestAmt"
                      type="number"
                      placeholder="Enter interest amount"
                      value={interestAmt}
                      onChange={(e) => setInterestAmt(e.target.value)}
                      min="0"
                      step="0"
                    />
                  </div>
                )}

                {interestCalculationType === "calculated" && (
                  <div className="space-y-2">
                    <Label htmlFor="months" className="text-sm font-medium">
                      Number of Months
                    </Label>
                    <Input
                      id="months"
                      type="number"
                      placeholder="Enter number of months"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      min="1"
                      step="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Interest will be calculated at 24% annual rate
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="letterhead" className="text-sm font-medium">
                  Include Letterhead
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add company letterhead to the document
                </p>
              </div>
              <Switch
                id="letterhead"
                checked={includeLetterHead}
                onCheckedChange={setIncludeLetterHead}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="signature" className="text-sm font-medium">
                  Include Signature &amp; Stamp
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add authorized signature &amp; stamp to the document
                </p>
              </div>
              <Switch
                id="signature"
                checked={isSigned}
                onCheckedChange={setIsSigned}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 mx-1 my-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrint}>Generate Document</Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
