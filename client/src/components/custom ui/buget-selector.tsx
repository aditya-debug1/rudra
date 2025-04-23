import { Input } from "@/components/ui/input";
import { DualRangeSlider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import React, { useEffect, useState, useCallback, useMemo } from "react";

// Constants
const LAKH = 100000;
const CRORE = 10000000;
const MIN_RANGE = 0;
const MAX_RANGE_LAKHS = 10000;
const MAX_RANGE_CRORES = 100;

export type BudgetUnit = "lakhs" | "crores";

export interface BudgetRangeValue {
  minInRupees: number; // Value always in rupees
  maxInRupees: number; // Value always in rupees
  unit: BudgetUnit;
  displayMin: number; // Value in selected unit (lakhs or crores)
  displayMax: number; // Value in selected unit (lakhs or crores)
}

export interface BudgetRangeSelectorProps {
  onValueChange?: (value: BudgetRangeValue) => void;
  initialUnit?: BudgetUnit;
  initialMin?: number;
  initialMax?: number;
  disabled?: boolean;
  className?: string;
}

export const BudgetRangeSelector: React.FC<BudgetRangeSelectorProps> = ({
  onValueChange = () => {},
  initialUnit = "lakhs",
  initialMin = 0,
  initialMax = 0,
  disabled = false,
  className = "",
}) => {
  // Validate initial values
  const validatedInitialUnit = initialUnit === "crores" ? "crores" : "lakhs";
  const validatedInitialMin = Math.max(MIN_RANGE, initialMin);
  const validatedInitialMax = Math.max(validatedInitialMin, initialMax);

  const [mode, setMode] = useState<BudgetUnit>(validatedInitialUnit);
  const [minValue, setMinValue] = useState<number>(validatedInitialMin);
  const [maxValue, setMaxValue] = useState<number>(validatedInitialMax);

  // Range values for the slider, memoized
  const { minRange, maxRange, step } = useMemo(
    () => ({
      minRange: MIN_RANGE,
      maxRange: mode === "lakhs" ? MAX_RANGE_LAKHS : MAX_RANGE_CRORES,
      step: mode === "lakhs" ? 5 : 0.1, // 5 lakhs or 0.1 crores steps
    }),
    [mode],
  );

  // Convert display value to rupees
  const toRupees = useCallback((value: number, unit: BudgetUnit): number => {
    return unit === "lakhs" ? value * LAKH : value * CRORE;
  }, []);

  // Format display values
  const formatValue = useCallback(
    (value: number): string => {
      if (value === 0) return "₹0";
      if (mode === "lakhs" && value >= 100)
        return `₹${(value / 100).toFixed(1)} Cr`;
      return `₹${value.toFixed(mode === "crores" ? 1 : 0)} ${mode === "lakhs" ? "L" : "Cr"}`;
    },
    [mode],
  );

  // Convert between lakhs and crores when mode changes
  useEffect(() => {
    if (mode === "crores") {
      // Convert from lakhs to crores
      setMinValue((prev) => {
        const converted = Math.round((prev / 100) * 10) / 10;
        return Math.max(0, Math.min(MAX_RANGE_CRORES, converted));
      });
      setMaxValue((prev) => {
        const converted = Math.round((prev / 100) * 10) / 10;
        // Allow zero value for max
        return Math.max(0, Math.min(MAX_RANGE_CRORES, converted));
      });
    } else {
      // Convert from crores to lakhs
      setMinValue((prev) => {
        const converted = Math.round(prev * 100);
        return Math.max(0, Math.min(MAX_RANGE_LAKHS, converted));
      });
      setMaxValue((prev) => {
        const converted = Math.round(prev * 100);
        // Allow zero value for max
        return Math.max(0, Math.min(MAX_RANGE_LAKHS, converted));
      });
    }
  }, [mode]);

  // We still need to ensure max is not less than min, but we'll allow both to be 0
  useEffect(() => {
    if (maxValue < minValue) {
      setMaxValue(minValue);
    }
  }, [minValue, maxValue]);

  // Update parent component when values change
  useEffect(() => {
    const updatedValue: BudgetRangeValue = {
      minInRupees: toRupees(minValue, mode),
      maxInRupees: toRupees(maxValue, mode),
      unit: mode,
      displayMin: minValue,
      displayMax: maxValue,
    };
    onValueChange(updatedValue);
  }, [minValue, maxValue, mode, onValueChange, toRupees]);

  // Handle slider change
  const handleSliderChange = useCallback(
    (values: number[]) => {
      if (values.length >= 2) {
        if (mode === "crores") {
          setMinValue(Math.round(values[0] * 10) / 10);
          setMaxValue(Math.round(values[1] * 10) / 10);
        } else {
          setMinValue(Math.round(values[0]));
          setMaxValue(Math.round(values[1]));
        }
      }
    },
    [mode],
  );

  // Validate and sanitize numeric input
  const sanitizeNumericInput = useCallback((value: string): number | null => {
    // Remove any non-numeric characters except decimal point
    const sanitized = value.replace(/[^\d.]/g, "");

    // Check for multiple decimal points and keep only the first one
    const parts = sanitized.split(".");
    const cleanValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "");

    // Convert to number
    const numValue = parseFloat(cleanValue);
    return isNaN(numValue) ? null : numValue;
  }, []);

  // Handle input change for min value
  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;

      // Allow empty field to be treated as 0
      if (inputVal === "") {
        setMinValue(0);
        return;
      }

      const sanitizedValue = sanitizeNumericInput(inputVal);
      if (sanitizedValue === null) return;

      // Apply constraints
      const constrainedValue = Math.max(
        minRange,
        Math.min(maxValue, sanitizedValue),
      );

      // Round based on mode
      if (mode === "crores") {
        setMinValue(Math.round(constrainedValue * 10) / 10);
      } else {
        setMinValue(Math.round(constrainedValue));
      }
    },
    [minRange, maxValue, mode, sanitizeNumericInput],
  );

  // Handle input change for max value
  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;

      // Allow max to be empty, treating it as 0
      if (inputVal === "") {
        setMaxValue(0);
        return;
      }

      const sanitizedValue = sanitizeNumericInput(inputVal);
      if (sanitizedValue === null) return;

      // Min value should be at least minValue
      const constrainedValue = Math.max(
        minValue,
        Math.min(maxRange, sanitizedValue),
      );

      // Round based on mode
      if (mode === "crores") {
        setMaxValue(Math.round(constrainedValue * 10) / 10);
      } else {
        setMaxValue(Math.round(constrainedValue));
      }
    },
    [maxRange, minValue, mode, sanitizeNumericInput],
  );

  // Toggle between lakhs and crores
  const toggleMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "lakhs" ? "crores" : "lakhs"));
  }, []);

  return (
    <div className={`space-y-6 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Lakhs</span>
          <Switch
            checked={mode === "crores"}
            onCheckedChange={toggleMode}
            disabled={disabled}
          />
          <span className="text-sm text-muted-foreground">Crores</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="font-medium">{formatValue(minValue)}</span>
          <span>-</span>
          <span className="font-medium">{formatValue(maxValue)}</span>
        </div>
      </div>

      <DualRangeSlider
        value={[minValue, maxValue]}
        min={minRange}
        max={maxRange}
        step={step}
        onValueChange={handleSliderChange}
        className="mt-4"
        disabled={disabled}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            type="text"
            inputMode="decimal"
            value={minValue}
            onChange={handleMinInputChange}
            placeholder="Min"
            className="w-full"
            disabled={disabled}
            aria-label="Minimum budget value"
          />
        </div>

        <div>
          <Input
            type="text"
            inputMode="decimal"
            value={maxValue}
            onChange={handleMaxInputChange}
            placeholder="Max"
            className="w-full"
            disabled={disabled}
            aria-label="Maximum budget value"
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetRangeSelector;
