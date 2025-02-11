import React from "react";
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
import { FilterX } from "lucide-react";
import { DateRange } from "react-day-picker";

interface FilterParams {
  search: string;
  source: string;
  action: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

type FilterKey = keyof Omit<FilterParams, "page" | "limit">;

interface AuditHeaderProps {
  filters: FilterParams;
  onFilterChange: (key: FilterKey, value: string) => void;
  onClearFilters: () => void;
  actionOptions: string[];
  sourceOptions: string[];
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  actionOptions,
  sourceOptions,
}) => {
  const showClear =
    filters.search ||
    filters.action ||
    filters.source ||
    filters.startDate ||
    filters.endDate;

  const handleDateChange = (date: DateRange) => {
    const from = date?.from;
    const to = date?.to;

    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      console.log(from, to);
      onFilterChange("startDate", from.toISOString());
      onFilterChange("endDate", to.toISOString());
    }
  };

  return (
    <div className="w-[90svw] md:w-full">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12 items-start">
        {/* Search and Clear Filters Section */}
        <div className="flex gap-2 lg:col-span-3">
          <Input
            placeholder="Search Log"
            className="w-full"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
          {showClear && (
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
            defaultDate={
              filters.startDate && filters.endDate
                ? {
                    from: new Date(filters.startDate),
                    to: new Date(filters.endDate),
                  }
                : undefined
            }
            onDateChange={handleDateChange}
            disableDates="future"
            className="w-full lg:w-auto"
          />
        </div>

        {/* Select Filters Section */}
        <div className="flex flex-col sm:flex-row gap-2 lg:col-span-5 lg:justify-end">
          <Select
            value={filters.action}
            onValueChange={(value) => onFilterChange("action", value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Action</SelectLabel>
                {actionOptions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.source}
            onValueChange={(value) => onFilterChange("source", value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Source</SelectLabel>
                {sourceOptions.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source.toUpperCase()}
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

export default AuditHeader;
