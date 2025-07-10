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
    <div className="w-full mb-4 sm:mb-3">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 flex-1">
          {/* Search Input */}
          <div className="w-full sm:w-auto sm:min-w-64 sm:max-w-80">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search Client Partners..."
              className="w-full"
            />
          </div>

          {/* Filter Row */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {/* Employee Select */}
            <div className="flex-1 sm:flex-none sm:min-w-48">
              <Select onValueChange={setCreatedBy} value={createdBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {userOptions?.map((user) => (
                      <SelectItem key={user.username} value={user.username}>
                        {user.firstName + " " + user.lastName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {isFiltered && (
                <Tooltip content="Clear filter">
                  <Button
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
          </div>
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
    </div>
  );
};
