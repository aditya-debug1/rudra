import { Combobox, ComboboxOption } from "@/components/custom ui/combobox";
import { DatePickerV2 } from "@/components/custom ui/date-time-pickers";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useClientStore } from "@/store/client";
import { useClientPartners } from "@/store/client-partner";
import {
  ignoreRole,
  refDefaultOptions,
  requirementOptions,
  statusOptions,
} from "@/store/data/options";
import { useInventory } from "@/store/inventory";
import { useUsersSummary } from "@/store/users";
import { toProperCase } from "@/utils/func/strUtils";
import { ListFilter } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

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
  clearFilter?: () => void;
  setIsFiltered?: (state: boolean) => void;
  children?: ReactNode;
}

export const ClientFilter = ({
  clearFilter,
  setIsFiltered,
  children,
}: ClientFilterProps) => {
  // Hooks
  const { filters, setFilters, resetFilters } = useClientStore();
  const { useReferenceWithDelete } = useClientPartners();
  const { data: users } = useUsersSummary();
  const { useProjectsStructure } = useInventory();
  const { data: projectsData } = useProjectsStructure();
  const { data: refData } = useReferenceWithDelete();
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  // States
  const [isOpen, setIsOpen] = useState(false);
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

  const projectOptions =
    projectsData?.data?.map((p) => ({ label: p.name, value: p.name! })) || [];

  const managerOptions =
    users
      ?.filter((user) => !user.roles.some((role) => ignoreRole.includes(role)))
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

  // Event Handlers
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
    if (setIsFiltered) setIsFiltered(hasActiveFilters);
    setIsOpen(false);
  }

  const resetClientFilters = () => {
    setActiveFilters({ ...initialFilters });
    setAppliedFilterCount(0);
    resetFilters();
    if (clearFilter) clearFilter();
    setIsOpen(false);
  };

  // Filter content component to use in both Sheet and Drawer
  const FilterContent = () => (
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

      {/* <FormFieldWrapper LabelText="Select Budget Range">
        <BudgetRangeSelector
          onValueChange={({ minInRupees, maxInRupees }) => {
            updateFilter("minBudget", minInRupees);
            updateFilter("maxBudget", maxInRupees);
          }}
          // initialMin={activeFilters.minBudget || 0}
          // initialMax={activeFilters.maxBudget || 0}
        />
      </FormFieldWrapper> */}

      <FormFieldWrapper LabelText="Reference">
        <Combobox
          value={activeFilters.reference}
          options={referenceOptions}
          onChange={(value) => updateFilter("reference", value)}
          width="w-full"
          align={isSmallScreen ? "center" : "end"}
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
            value={activeFilters[type as keyof typeof activeFilters] as string}
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
  );

  // Filter trigger button

  const FilterTrigger = () => {
    return children ? (
      children
    ) : (
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
    );
  };

  // Filter footer with action buttons
  const FilterFooter = () => (
    <div className="flex gap-3 justify-end">
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
      <Button onClick={handleApplyFilter}>Apply Filter</Button>
    </div>
  );

  return isSmallScreen ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <span onClick={() => setIsOpen(true)} className="w-full">
          <FilterTrigger />
        </span>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="mb-2">
          <DrawerTitle>Client Filter Options</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="px-4 h-[calc(100vh-250px)]">
          <FilterContent />
          <DrawerFooter className="pt-2 pb-4">
            <FilterFooter />
          </DrawerFooter>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  ) : (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <span className="w-full">
          <FilterTrigger />
        </span>
      </SheetTrigger>
      <SheetContent className="overflow-hidden">
        <SheetHeader className="mb-6">
          <SheetTitle>Client Filter Options</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-150px)] w-full pr-4">
          <FilterContent />
          <SheetFooter className="mt-4 mb-2 gap-3 sm:gap-0 pr-1">
            <FilterFooter />
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
