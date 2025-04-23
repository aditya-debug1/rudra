import { useState, useEffect } from "react";
import { useClientStore } from "@/store/client";
import { useUsersSummary } from "@/store/users";
import {
  ignoreRole,
  projectOptions,
  refDefaultOptions,
  requirementOptions,
  statusOptions,
} from "@/store/data/options";
import { useMediaQuery } from "@/hooks/use-media-query";

// Components
import BudgetRangeSelector from "@/components/custom ui/buget-selector";
import { Combobox, ComboboxOption } from "@/components/custom ui/combobox";
import { DatePickerV2 } from "@/components/custom ui/date-time-pickers";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ListFilter } from "lucide-react";
import { toProperCase } from "@/utils/func/strUtils";
import { useClientPartners } from "@/store/client-partner";

// Types
type FilterKey = keyof typeof initialFilters;

type FilterValueType = string | number | Date | undefined;

const initialFilters = {
  requirement: "",
  project: "",
  minBudget: 0,
  maxBudget: 0,
  reference: "",
  source: "",
  relation: "",
  closing: "",
  fromDate: undefined as Date | undefined,
  toDate: undefined as Date | undefined,
  status: "",
};

interface ClientFilterProps {
  clearFilter: () => void;
  setIsFiltered: (state: boolean) => void;
}

export const ClientFilter = ({
  clearFilter,
  setIsFiltered,
}: ClientFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters, resetFilters } = useClientStore();
  const { useReferenceWithDelete } = useClientPartners();
  const { data: users } = useUsersSummary();
  const { data: refData } = useReferenceWithDelete();
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const [activeFilters, setActiveFilters] = useState({ ...initialFilters });
  const [appliedFilterCount, setAppliedFilterCount] = useState(0);

  // Options
  // Define reference options
  const refDynamicOptions: ComboboxOption[] =
    refData?.references?.map((ref) => ({
      label: `${ref.firstName} ${ref.lastName}${ref.companyName ? ` (${ref.companyName})` : ""}`,
      value: ref._id,
    })) || [];

  const referenceOptions: ComboboxOption[] = [
    ...refDefaultOptions,
    ...refDynamicOptions,
  ];

  const managerOptions =
    users
      ?.filter((user) => !ignoreRole.includes(user.roles[0]))
      .map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.username,
      })) || [];

  // Initialize filters from store
  useEffect(() => {
    const currentFilters = { ...initialFilters };

    // Only copy values that exist in filters to currentFilters
    if (filters.requirement) currentFilters.requirement = filters.requirement;
    if (filters.project) currentFilters.project = filters.project;
    if (filters.minBudget) currentFilters.minBudget = filters.minBudget;
    if (filters.maxBudget) currentFilters.maxBudget = filters.maxBudget;
    if (filters.reference) currentFilters.reference = filters.reference;
    if (filters.source) currentFilters.source = filters.source;
    if (filters.relation) currentFilters.relation = filters.relation;
    if (filters.closing) currentFilters.closing = filters.closing;
    if (filters.fromDate) currentFilters.fromDate = filters.fromDate;
    if (filters.toDate) currentFilters.toDate = filters.toDate;
    if (filters.status) currentFilters.status = filters.status;

    setActiveFilters(currentFilters);
    countAppliedFilters(currentFilters);
  }, [filters]);

  // Count applied filters
  const countAppliedFilters = (filterObj: typeof initialFilters) => {
    const count = Object.entries(filterObj).reduce((total, [key, value]) => {
      // Skip empty values and handle budget filters as a single filter
      if (key === "maxBudget" && !filterObj.minBudget) return total;
      if (key === "minBudget" && filterObj.maxBudget) return total + 1;
      return value ? total + 1 : total;
    }, 0);

    setAppliedFilterCount(count);
  };

  // Update a single filter value
  const updateFilter = (key: FilterKey, value: FilterValueType) => {
    setActiveFilters((prev) => {
      const updated = { ...prev, [key]: value };
      countAppliedFilters(updated);
      return updated;
    });
  };

  // Apply filters
  function handleApplyFilter() {
    const newFilters = { ...filters, page: 1 };
    let hasActiveFilters = false;

    // Process each filter
    Object.keys(initialFilters).forEach((key) => {
      const filterKey = key as FilterKey;
      const value = activeFilters[filterKey];

      if (value) {
        if (filterKey == "minBudget" || filterKey == "maxBudget")
          newFilters[filterKey] = value as number;
        else if (filterKey == "fromDate" || filterKey == "toDate")
          newFilters[filterKey] = value as Date;
        else if (filterKey == "status")
          newFilters[filterKey] = value as
            | "lost"
            | "cold"
            | "warm"
            | "hot"
            | "booked"
            | undefined;
        else newFilters[filterKey] = value as string;

        hasActiveFilters = true;
      } else {
        delete newFilters[filterKey];
      }
    });

    setFilters(newFilters);
    setIsFiltered(hasActiveFilters);
  }

  const resetClientFilters = () => {
    setActiveFilters({ ...initialFilters });
    setAppliedFilterCount(0);
    resetFilters();
    clearFilter();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <span>
          <Tooltip content="More filter options">
            <Button
              className="flex-shrink-0 relative"
              variant="outline"
              size="icon"
            >
              <ListFilter size={20} />
              {appliedFilterCount > 0 && (
                <Badge className="bg-red-500 text-white absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {appliedFilterCount}
                </Badge>
              )}
            </Button>
          </Tooltip>
        </span>
      </SheetTrigger>
      <SheetContent
        className="overflow-hidden"
        side={isSmallScreen ? "bottom" : "right"}
      >
        <SheetHeader className="mb-6">
          <SheetTitle>Client Filter Options</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-150px)] w-full pr-4">
          <div className="flex flex-col gap-8 py-4">
            <FormFieldWrapper LabelText="Pick Date">
              <div className="flex flex-col sm:flex-row gap-3">
                <DatePickerV2
                  placeholder="Start date"
                  className="sm:w-full"
                  defaultDate={activeFilters.fromDate}
                  onDateChange={(date) => updateFilter("fromDate", date)}
                />
                <DatePickerV2
                  placeholder="End date"
                  className="sm:w-full"
                  defaultDate={activeFilters.toDate}
                  onDateChange={(date) => updateFilter("toDate", date)}
                />
              </div>
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Select Requirement">
              <Combobox
                value={activeFilters.requirement}
                options={requirementOptions}
                onChange={(value) => updateFilter("requirement", value)}
                width="w-full"
                align="center"
                placeholder="Select a requirement"
              />
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Select Project">
              <Combobox
                value={activeFilters.project}
                options={projectOptions}
                onChange={(value) => updateFilter("project", value)}
                width="w-full"
                align="center"
                placeholder="Select a project"
              />
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Select Budget Range">
              <BudgetRangeSelector
                onValueChange={({ minInRupees, maxInRupees }) => {
                  updateFilter("minBudget", minInRupees);
                  updateFilter("maxBudget", maxInRupees);
                }}
                // initialMin={activeFilters.minBudget || 0}
                // initialMax={activeFilters.maxBudget || 0}
              />
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Reference">
              <Combobox
                value={activeFilters.reference}
                options={referenceOptions}
                onChange={(value) => updateFilter("reference", value)}
                width="w-full"
                align="center"
                placeholder="Select a reference"
              />
            </FormFieldWrapper>

            {/* Manager filters */}
            {(["source", "relation", "closing"] as const).map((type) => (
              <FormFieldWrapper
                LabelText={`${toProperCase(type)} Manager`}
                key={type}
              >
                <Combobox
                  value={
                    activeFilters[type as keyof typeof activeFilters] as string
                  }
                  options={managerOptions}
                  onChange={(value) => updateFilter(type as FilterKey, value)}
                  width="w-full"
                  align="center"
                  placeholder={`Select ${type} manager`}
                />
              </FormFieldWrapper>
            ))}

            <FormFieldWrapper LabelText="Select Status">
              <Combobox
                value={activeFilters.status}
                options={statusOptions}
                onChange={(value) => updateFilter("status", value)}
                width="w-full"
                align="center"
                placeholder="Select a status"
              />
            </FormFieldWrapper>
          </div>
          <SheetFooter className="mt-4 mb-2 gap-3 sm:gap-0 pr-1">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Close
            </Button>
            <Button variant="secondary" onClick={resetClientFilters}>
              Reset
            </Button>
            <SheetClose asChild>
              <Button onClick={handleApplyFilter}>Apply Filter</Button>
            </SheetClose>
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ClientFilter;
