import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { ClientBookingPaginatedResponse } from "@/store/client-booking/types";
import { FilterX, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BookingFilter } from "./booking-filter";

interface BookingHeaderProps {
  data: ClientBookingPaginatedResponse | undefined;
  isFiltered: boolean;
  setIsFiltered: (state: boolean) => void;
  handleClearFilter: () => void;
  searchTerm: string;
  handleSearch: (value: string) => void;
  status: string;
  handleSetStatus: (value: string) => void;
  handlePageChange: (pageno: number) => void;
}

const STATUS_OPTIONS = [
  "booked",
  "canceled",
  "registered",
  "registeration-process",
  "loan-process",
  "cnc",
];

export const BookingHeader = ({
  data,
  isFiltered,
  setIsFiltered,
  handleClearFilter,
  searchTerm,
  handleSearch,
  handleSetStatus,
  status,
  handlePageChange,
}: BookingHeaderProps) => {
  const navigate = useNavigate();
  const { combinedRole } = useAuth(true);
  const createBooking = hasPermission(combinedRole, "Form", "booking-form");

  // Event Handler
  const handleStatusChange = (newStatus: string) => {
    handleSetStatus(newStatus == "all" ? "" : newStatus);
  };

  return (
    <div className="w-full flex flex-wrap gap-3 items-center justify-around md:justify-between mb-3">
      <div className="flex gap-3 sm:gap-2 justify-around flex-wrap sm:flex-nowrap sm:justify-start">
        {/* Search input */}
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Clients..."
          className="sm:max-w-64"
        />

        {/* Status filter */}
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className="w-44 sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem value={option} key={option}>
                  {option.replace("-", " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <span className="flex gap-2">
          {/* Additional filters */}
          <BookingFilter
            clearFilter={handleClearFilter}
            setIsFiltered={setIsFiltered}
          />

          {/* Clear filters button */}
          {isFiltered && (
            <Tooltip content="Clear filter">
              <Button
                className="flex-shrink-0"
                onClick={handleClearFilter}
                variant="outline"
                size="icon"
                aria-label="Clear filters"
              >
                <FilterX size={20} />
              </Button>
            </Tooltip>
          )}

          {createBooking && (
            <Tooltip content="Add Client">
              <Button
                className="flex-shrink-0"
                onClick={() => navigate("/panel/form/booking")}
                variant="outline"
                size="icon"
                aria-label="Add Clients"
              >
                <Plus />
              </Button>
            </Tooltip>
          )}
        </span>
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
