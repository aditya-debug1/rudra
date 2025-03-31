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
import { GetClientsResponse } from "@/store/client";
import { toProperCase } from "@/utils/func/strUtils";
import { FilterX } from "lucide-react";
import { ClientFilter } from "./client-filter";

type ClientStatus = "lost" | "cold" | "warm" | "hot" | "booked" | undefined;

interface ClientHeaderProps {
  isFiltered: boolean;
  searchInput: string;
  status: string;
  data?: GetClientsResponse;
  handleSearch: (value: string) => void;
  handleSetStatus: (status: ClientStatus) => void;
  handleClearFilter: () => void;
  handlePageChange: (page: number) => void;
}

const STATUS_OPTIONS = ["lost", "cold", "warm", "hot", "booked"] as const;

export const ClientHeader = ({
  isFiltered,
  searchInput,
  status,
  data,
  handleSearch,
  handleSetStatus,
  handleClearFilter,
  handlePageChange,
}: ClientHeaderProps) => {
  const handleStatusChange = (newStatus: string) => {
    if (newStatus == "all") {
      handleSetStatus(undefined);
    } else handleSetStatus(newStatus as ClientStatus);
  };
  return (
    <div className="w-full flex flex-wrap gap-3 items-center justify-around md:justify-between mb-3">
      <div className="flex gap-2">
        {/* Search input */}
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Clients..."
          className="sm:max-w-64"
        />

        {/* Status filter */}
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem value={option} key={option}>
                  {toProperCase(option)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Additional filters */}
        <ClientFilter />

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
