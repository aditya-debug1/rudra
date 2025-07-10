import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { GetClientPartnersResponse } from "@/store/client-partner";
import { ignoreRole } from "@/store/data/options";
import { useUsersSummary } from "@/store/users";
import { FilterX, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientPartnerHeaderProps {
  searchInput: string;
  handleSearch: (value: string) => void;
  createdBy: string;
  setCreatedBy: (value: string) => void;
  isFiltered: boolean;
  handleClearFilter: () => void;
  data?: GetClientPartnersResponse;
  handlePageChange: (pageno: number) => void;
}

export const ClientPartnerHeader = ({
  searchInput,
  handleSearch,
  createdBy,
  setCreatedBy,
  isFiltered,
  handleClearFilter,
  data,
  handlePageChange,
}: ClientPartnerHeaderProps) => {
  const { data: users } = useUsersSummary();
  const navigate = useNavigate();
  const { combinedRole } = useAuth(true);
  const createClientPartner = hasPermission(
    combinedRole,
    "Form",
    "client-partner-form",
  );

  const userOptions = users?.filter(
    (user) => !user.roles.some((role) => ignoreRole.includes(role)),
  );

  return (
    <div className="w-full flex flex-wrap gap-3 items-center justify-around md:justify-between mb-4 sm:mb-3">
      {/* Search input */}
      <div className="flex gap-3 sm:gap-2 ">
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Client Partners..."
          className="sm:max-w-64"
        />
        <Select onValueChange={setCreatedBy} value={createdBy}>
          <SelectTrigger>
            <SelectValue placeholder="Select Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {userOptions?.map((user) => (
                <SelectItem value={user.username}>
                  {user.firstName + " " + user.lastName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

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
        {createClientPartner && (
          <Tooltip content="Add Channel Partners">
            <Button
              className="flex-shrink-0"
              onClick={() => navigate("/panel/form/client-partner")}
              variant="outline"
              size="icon"
              aria-label="Add Channel Partners"
            >
              <Plus />
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
