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
import { FilterX, Plus } from "lucide-react";
import { ClientFilter } from "./client-filter";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { hasPermission } from "@/hooks/use-role";

type ClientStatus = "lost" | "cold" | "warm" | "hot" | "booked" | undefined;

interface ClientHeaderProps {
  isFiltered: boolean;
  setIsFiltered: (state: boolean) => void;
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
  setIsFiltered,
  searchInput,
  status,
  data,
  handleSearch,
  handleSetStatus,
  handleClearFilter,
  handlePageChange,
}: ClientHeaderProps) => {
  const navigate = useNavigate();
  const { combinedRole } = useAuth(true);
  const createClient = hasPermission(combinedRole, "Form", "client-form");
  const handleStatusChange = (newStatus: string) => {
    if (newStatus == "all") {
      handleSetStatus(undefined);
    } else handleSetStatus(newStatus as ClientStatus);
  };

  return (
    <div className="w-full flex flex-wrap gap-3 items-center justify-around md:justify-between mb-3">
      <div className="flex gap-3 sm:gap-2 justify-around flex-wrap sm:flex-nowrap sm:justify-start">
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
          <SelectTrigger className="w-44 sm:w-[120px]">
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

        <span className="flex gap-2">
          {/* Additional filters */}
          <ClientFilter
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

          {createClient && (
            <Tooltip content="Add Client">
              <Button
                className="flex-shrink-0"
                onClick={() => navigate("/panel/form/client")}
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
