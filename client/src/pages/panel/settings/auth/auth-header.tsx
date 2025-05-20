// AuthHeader.tsx
import { Combobox } from "@/components/custom ui/combobox";
import { DatePickerWithRange } from "@/components/custom ui/date-time-pickers";
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
import { AuthLogsParams } from "@/store/auth";
import { useUsersSummary } from "@/store/users";
import { toProperCase } from "@/utils/func/strUtils";
import { FilterX } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

interface AuthHeaderProps {
  filters: AuthLogsParams;
  onFilterChange: (filter: Partial<AuthLogsParams>) => void;
  search: string;
  onSearch: (value: string) => void;
  onClearFilters: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  filters,
  onFilterChange,
  search,
  onSearch,
  onClearFilters,
}) => {
  const { data: users } = useUsersSummary();
  // Local state for date range to properly sync with filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined,
  );

  const isFiltered =
    filters.search ||
    filters.startDate ||
    filters.endDate ||
    filters.action ||
    filters.username;

  const userOptions =
    users?.map((user) => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.username,
    })) || [];

  // Sync local date range state with filters
  useEffect(() => {
    if (!filters.startDate || !filters.endDate) {
      setDateRange(undefined);
    } else if (
      !dateRange?.from ||
      !dateRange?.to ||
      filters.startDate.toString() !== dateRange.from.toString() ||
      filters.endDate.toString() !== dateRange.to.toString()
    ) {
      setDateRange({
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  const handleDateChange = (date: DateRange | undefined) => {
    setDateRange(date); // Update local state first

    if (!date) {
      onFilterChange({ startDate: undefined, endDate: undefined });
      return;
    }

    const from = date?.from;
    const to = date?.to;
    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      onFilterChange({ startDate: from, endDate: to });
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12 items-start">
        {/* Search and Clear Filters Section */}
        <div className="flex gap-2 lg:col-span-3">
          <Input
            placeholder="Search Log"
            className="w-full"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {isFiltered && (
            <Button
              size="icon"
              variant="outline"
              onClick={onClearFilters}
              className="flex-shrink-0"
              title="Clear filters"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
        {/* Date Range Picker Section */}
        <div className="lg:col-span-4 flex justify-center">
          <DatePickerWithRange
            value={dateRange}
            onDateChange={handleDateChange}
            label="Select Log Date Range"
            disableDates="future"
            className="w-full lg:w-auto"
            autoClose
          />
        </div>
        {/* Select Filters Section */}
        <div className="flex flex-col sm:flex-row gap-2 lg:col-span-5 lg:justify-end">
          <Combobox
            value={filters.username || ""}
            onChange={(value) => onFilterChange({ username: value })}
            options={userOptions || []}
            width="w-full lg:max-w-44"
            align="center"
          />
          <Select
            value={filters.action || ""}
            onValueChange={(value) => onFilterChange({ action: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Action</SelectLabel>
                {["login", "logout"].map((action) => (
                  <SelectItem key={action} value={action}>
                    {toProperCase(action)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;
