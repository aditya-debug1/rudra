import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { GetProjectsResponse } from "@/store/inventory";
import { FilterX, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectHeaderProps {
  search: string;
  handleSearch: (search: string) => void;
  isFiltered: boolean;
  handleClearFilter: () => void;
  data?: GetProjectsResponse;
  handlePageChange: (pageno: number) => void;
}

export const ProjectHeader = ({
  search,
  handleSearch,
  isFiltered,
  handleClearFilter,
  data,
  handlePageChange,
}: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const { combinedRole } = useAuth(true);
  const createInventory = hasPermission(
    combinedRole,
    "Inventory",
    "create-inventory",
  );
  function handleAddProject() {
    navigate("/panel/inventory/form");
  }

  return (
    <div className="w-full flex flex-wrap gap-3 items-center justify-around md:justify-between mb-4 sm:mb-3">
      {/* Search input */}
      <div className="flex gap-3 sm:gap-2 ">
        <Input
          placeholder="Search projects..."
          className="max-w-52"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

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

        {createInventory && (
          <Tooltip content="Add Project">
            <Button variant="outline" size="icon" onClick={handleAddProject}>
              <Plus />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Pagination controls */}
      {data && data?.pagination.totalProjects > 0 && (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={data.pagination.currentPage <= 1}
            onClick={() => handlePageChange(data.pagination.currentPage - 1)}
          >
            Previous
          </Button>

          <span className="px-2 text-sm whitespace-nowrap">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={data.pagination.currentPage >= data.pagination.totalPages}
            onClick={() => handlePageChange(data.pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
