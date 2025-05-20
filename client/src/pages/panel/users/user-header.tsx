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
import { hasPermission } from "@/hooks/use-role.ts";
import { useAuth } from "@/store/auth";
import { RoleArrayType, useRoles } from "@/store/role";
import { toProperCase } from "@/utils/func/strUtils";
import { FilterX } from "lucide-react";
import { UserAddButton } from "./user-add-button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface FilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  isFiltered: boolean;
  onClearFilter: () => void;
}

interface RecordInfoProps {
  firstIndex?: number;
  lastIndex?: number;
  totalUsers?: number;
}

interface UserHeaderProp {
  filter: FilterProps;
  pagination: PaginationProps;
  recordInfo: RecordInfoProps;
}

export const UserHeader = ({ filter, pagination }: UserHeaderProp) => {
  return (
    <div className="w-full flex justify-around md:justify-between items-center gap-2 flex-wrap">
      <Filter filter={filter} />
      {pagination && (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage <= 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          >
            Previous
          </Button>

          <span className="px-2 text-sm whitespace-nowrap">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

const Filter = (props: { filter: FilterProps }) => {
  const { rolesArray: roles } = useRoles();
  const {
    searchTerm,
    onSearchChange,
    selectedRole,
    onRoleChange,
    isFiltered,
    onClearFilter,
  } = props.filter;

  const { combinedRole } = useAuth(false);
  const showUserAddButton = hasPermission(combinedRole, "Users", "create-user");

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search users"
        className="max-w-xs"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select onValueChange={onRoleChange} value={selectedRole}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Roles</SelectLabel>
            {roles.data &&
              roles.data.map((role: RoleArrayType) => {
                return (
                  <SelectItem value={role.name} key={role._id}>
                    {toProperCase(role.name)}
                  </SelectItem>
                );
              })}
          </SelectGroup>
        </SelectContent>
      </Select>

      {isFiltered && (
        <Tooltip content="Clear Filter" side="bottom">
          <Button
            onClick={onClearFilter}
            variant="outline"
            size="icon"
            className="px-2"
          >
            <FilterX size={20} />
          </Button>
        </Tooltip>
      )}

      {showUserAddButton && <UserAddButton />}
    </div>
  );
};
