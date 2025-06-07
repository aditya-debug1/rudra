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
    intrestAmt?: number,
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
    intrestAmt?: number,
  ) => void;
}

function PrintModal({ handleGenerateLetter }: PrintModalProps) {
  const [includeLetterHead, setIncludeLetterHead] = useState(true);
  const [isSigned, setIsSigned] = useState(true);
  const [letterType, setLetterType] = useState("demand");
  const [interestAmt, setInterestAmt] = useState("");
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    if (letterType == "interest" && !parseFloat(interestAmt)) {
      return toast({
        title: "Letter Creation Error",
        description: "Please enter a valid interest amount",
        variant: "warning",
      });
    }
    const intrestAmt =
      letterType === "interest" ? parseFloat(interestAmt) || 0 : 0;
    handleGenerateLetter(isSigned, includeLetterHead, intrestAmt);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <div className="space-y-2 mx-1">
                <Label htmlFor="interestAmt" className="text-sm font-medium">
                  Interest Amount
                </Label>
                <Input
                  id="interestAmt"
                  type="number"
                  placeholder="Enter interest amount"
                  value={interestAmt}
                  onChange={(e) => setInterestAmt(e.target.value)}
                  min="0"
                  step="0.01"
                />
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
                  Include Signature
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add authorized signature to the document
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
