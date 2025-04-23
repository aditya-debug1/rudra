import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
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
import { budgetOptions } from "@/store/data/options";
import { simplifyNumber } from "@/utils/func/numberUtils";
import { useEffect, useMemo, useState } from "react";
import { Combobox } from "@/components/custom ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { ClientType } from "@/store/client";
import { projectOptions, requirementOptions } from "@/store/data/options";

interface ClientInfoProp {
  isEditable: boolean;
  client: ClientType;
  handleInputChange: (
    field: keyof ClientType,
    value: string | number | Date,
  ) => void;
  showContactInfo?: boolean;
}

export const ClientInfo = ({
  isEditable,
  client,
  handleInputChange,
  showContactInfo = false,
}: ClientInfoProp) => {
  // Handler for budget changes that passes to the parent's handleInputChange
  const handleBudgetChange = (value: number) => {
    handleInputChange("budget", value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Client Information</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <FormFieldWrapper
            className="gap-3"
            LabelText="Name"
            Important={isEditable}
            ImportantSide="right"
          >
            <div className="flex flex-col sm:flex-row gap-4 grow">
              <Input
                value={client.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder={isEditable ? "First Name" : "N/A"}
                disabled={!isEditable}
              />
              <Input
                value={client.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder={isEditable ? "Last Name" : "N/A"}
                disabled={!isEditable}
              />
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper className="gap-3" LabelText="Occupation">
            <Input
              value={client.occupation}
              onChange={(e) => handleInputChange("occupation", e.target.value)}
              placeholder={isEditable ? "Software Engineer" : "N/A"}
              disabled={!isEditable}
            />
          </FormFieldWrapper>

          <FormFieldWrapper className="gap-3" LabelText="Email">
            <Input
              value={showContactInfo ? client.email : "Access Restricted"}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={isEditable ? "john.doe@example.com" : "N/A"}
              disabled={!isEditable || !showContactInfo}
            />
          </FormFieldWrapper>
        </div>

        <div className="space-y-4 flex flex-col">
          {showContactInfo && (
            <FormFieldWrapper
              className="gap-3"
              LabelText="Phone Number"
              Important={isEditable}
              ImportantSide="right"
            >
              <div className="flex flex-col sm:flex-row gap-4 grow">
                <Input
                  value={client.phoneNo}
                  onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                  placeholder={isEditable ? "Primary Number" : "N/A"}
                  disabled={!isEditable}
                />
                <Input
                  value={client.altNo}
                  onChange={(e) => handleInputChange("altNo", e.target.value)}
                  placeholder={isEditable ? "Alt Number (optional)" : "N/A"}
                  disabled={!isEditable}
                />
              </div>
            </FormFieldWrapper>
          )}
          <FormFieldWrapper className="gap-3 flex-grow" LabelText="Notes">
            <Textarea
              className="h-full lg:resize-none"
              value={client.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder={
                isEditable ? "Additional notes about the client" : "N/A"
              }
              disabled={!isEditable}
            />
          </FormFieldWrapper>
        </div>

        <div className="space-y-4">
          <FormFieldWrapper
            className="gap-3"
            LabelText="Project"
            Important={isEditable}
            ImportantSide="right"
          >
            <Combobox
              options={projectOptions}
              value={client.project}
              onChange={(e) => handleInputChange("project", e)}
              placeholder={isEditable ? "Select project" : "N/A"}
              emptyMessage="No project found"
              width="w-full"
              disabled={!isEditable}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            className="gap-3"
            LabelText="Requirement"
            Important={isEditable}
            ImportantSide="right"
          >
            <Combobox
              options={requirementOptions}
              value={client.requirement}
              onChange={(e) => handleInputChange("requirement", e)}
              placeholder={isEditable ? "Select requirement" : "N/A"}
              emptyMessage="No requirement found"
              width="w-full"
              disabled={!isEditable}
            />
          </FormFieldWrapper>

          {/*BudgetField component */}
          <BudgetField
            value={client.budget}
            onChange={handleBudgetChange}
            isEditable={isEditable}
            important={true}
          />
        </div>
      </div>

      <FormFieldWrapper className="gap-3" LabelText="Address">
        <Textarea
          className="min-h-20"
          value={client.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder={
            isEditable ? "123 Main Street, Anytown, State, 12345" : "N/A"
          }
          disabled={!isEditable}
        />
      </FormFieldWrapper>
    </div>
  );
};

interface BudgetFieldProps {
  value: number;
  onChange: (value: number) => void;
  isEditable: boolean;
  important?: boolean;
}

const BudgetField = ({
  value,
  onChange,
  isEditable,
  important = false,
}: BudgetFieldProps) => {
  // Find the most appropriate unit for the current budget value
  const getBestUnitForValue = (value: number): string => {
    if (!value || value === 0) return "1000"; // Default to thousands for zero/empty
    if (value >= 10000000) return "10000000"; // Crores
    if (value >= 100000) return "100000"; // Lacs
    if (value >= 1000) return "1000"; // Thousands
    return "1"; // For small values, use base unit
  };

  // Initialize budgetUnit with the most appropriate unit for the current budget
  const [budgetUnit, setBudgetUnit] = useState(() => {
    const initialUnit = getBestUnitForValue(value || 0);
    return initialUnit || "1000"; // Fallback to thousands if nothing is returned
  });

  // Calculate appropriate display value based on the current unit
  const calculateDisplayValue = (budget: number, unit: string): string => {
    if (budget === 0 || !budget) return "0";
    const unitValue = parseInt(unit) || 1;
    // Use precise division to maintain decimals when needed
    const rawValue = budget / unitValue;

    // If the value is close to a whole number, round it to avoid floating point issues
    const isCloseToWhole = Math.abs(Math.round(rawValue) - rawValue) < 0.001;
    if (isCloseToWhole) {
      return Math.round(rawValue).toString();
    }

    // Format with up to 2 decimal places, removing trailing zeros
    return parseFloat(rawValue.toFixed(2)).toString();
  };

  // Get the unit's label for display
  const getUnitLabel = useMemo(() => {
    const unitOption = budgetOptions.find(
      (opt) => opt.value.toString() === budgetUnit,
    );
    return unitOption ? unitOption.label : "Units";
  }, [budgetUnit]);

  // Keep track of the display value state
  const [budgetDisplayValue, setBudgetDisplayValue] = useState(() =>
    calculateDisplayValue(value || 0, budgetUnit),
  );

  // Update the display value when budget or unit changes
  useEffect(() => {
    setBudgetDisplayValue(calculateDisplayValue(value || 0, budgetUnit));
  }, [value, budgetUnit]);

  // Handle budget value changes (when user types in the input)
  const handleBudgetValueChange = (inputValue: string) => {
    // Handle empty input
    if (!inputValue.trim()) {
      setBudgetDisplayValue("0");
      onChange(0);
      return;
    }

    // Filter non-numeric characters except decimal point
    const sanitizedValue = inputValue.replace(/[^\d.]/g, "");

    // Validate the input is a proper number
    const parsedValue = parseFloat(sanitizedValue);
    if (isNaN(parsedValue)) {
      // Revert to previous valid value if input isn't a number
      setBudgetDisplayValue(calculateDisplayValue(value || 0, budgetUnit));
      return;
    }

    // Update display value and actual budget
    setBudgetDisplayValue(sanitizedValue);
    const unitValue = parseInt(budgetUnit) || 1;
    const actualBudget = parsedValue * unitValue;

    // Prevent updating with invalid values
    if (!isFinite(actualBudget)) return;

    onChange(actualBudget);
  };

  // Handle budget unit changes (when user selects a different unit)
  const handleBudgetUnitChange = (newUnit: string) => {
    const oldUnitValue = parseInt(budgetUnit) || 1;
    const currentValue = parseFloat(budgetDisplayValue) || 0;

    // Calculate actual value in the old unit
    const actualValue = currentValue * oldUnitValue;

    // Set the new unit
    setBudgetUnit(newUnit);

    // Recalculate display value for the new unit
    const newDisplayValue = calculateDisplayValue(actualValue, newUnit);
    setBudgetDisplayValue(newDisplayValue);

    // Update the stored budget value (which stays the same in absolute terms)
    onChange(actualValue);
  };

  // Automatically suggest best unit when budget changes significantly
  useEffect(() => {
    if (!isEditable) return; // Only suggest when in edit mode

    const currentBudget = value || 0;
    const bestUnit = getBestUnitForValue(currentBudget);

    // If current unit isn't optimal for this value, suggest a better one
    if (bestUnit !== budgetUnit) {
      // Check if the current display value would be too large or small in the current unit
      const currentUnitValue = parseInt(budgetUnit) || 1;
      const displayValue = currentBudget / currentUnitValue;

      // Only auto-adjust if the display value is very large or very small
      if (
        displayValue >= 10000 ||
        (displayValue < 1 && currentBudget >= 1000)
      ) {
        setBudgetUnit(bestUnit);
        setBudgetDisplayValue(calculateDisplayValue(currentBudget, bestUnit));
      }
    }
  }, [value, isEditable, budgetUnit]);

  return (
    <FormFieldWrapper
      className="gap-3"
      LabelText="Budget"
      Important={important && isEditable}
      ImportantSide="right"
    >
      <div className="flex flex-col sm:flex-row gap-4 grow">
        {isEditable ? (
          <>
            <div className="relative w-full">
              <Input
                type="text"
                value={budgetDisplayValue}
                onChange={(e) => handleBudgetValueChange(e.target.value)}
                placeholder="0"
                aria-label={`Budget in ${getUnitLabel}`}
              />
              {value > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  {simplifyNumber(value)}
                </div>
              )}
            </div>
            <Select value={budgetUnit} onValueChange={handleBudgetUnitChange}>
              <SelectTrigger className="w-36 min-w-36">
                <SelectValue placeholder="Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Units</SelectLabel>
                  {budgetOptions.map((unit, index) => (
                    <SelectItem value={unit.value.toString()} key={index}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        ) : (
          <Input
            type="text"
            value={simplifyNumber(value)}
            disabled
            placeholder="N/A"
          />
        )}
      </div>
    </FormFieldWrapper>
  );
};
