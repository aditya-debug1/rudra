import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { GetBookingLedgerByClientResponse } from "@/store/booking-ledger";
import { CirclePlus, FilterX, Printer } from "lucide-react";

interface BookingLedgerHeaderProps {
  data: GetBookingLedgerByClientResponse | undefined;
  handlePageChange: (pageno: number) => void;
  handleGenerateLetter: (
    isSigned?: boolean,
    includeLetterHead?: boolean,
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
  const isSmallScreen = useMediaQuery("(max-width: 639px)");
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="flex items-center gap-1"
            >
              <Printer size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isSmallScreen ? "center" : "start"}>
            {[
              { label: "Signed", signed: true, head: true },
              { label: "Signed · No Head", signed: true, head: false },
              { label: "Unsigned", signed: false, head: true },
              { label: "Unsigned · No Head", signed: false, head: false },
            ].map(({ label, signed, head }) => (
              <DropdownMenuItem
                key={label}
                onClick={() => handleGenerateLetter(signed, head)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
