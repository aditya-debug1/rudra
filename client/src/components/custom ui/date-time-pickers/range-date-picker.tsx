import { addDays, format, isAfter, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DateRange, isDateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  disableDates?: "past" | "present" | "future" | null;
  className?: string;
  value?: DateRange;
  onDateChange: (date: DateRange | undefined) => void;
  label?: string;
  required?: boolean;
  clearable?: boolean;
  autoClose?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showIcons?: boolean;
}
export function DatePickerWithRange({
  disableDates = null,
  value,
  onDateChange,
  className,
  label = "Pick a date",
  required = false,
  clearable = true,
  autoClose = false,
  minDate,
  maxDate,
  showIcons = true,
}: DatePickerProps) {
  // Variables
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // useStates
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  });
  const [isOpen, setIsOpen] = useState(false);

  // useEffects
  useEffect(() => {
    if (isDateRange(value) || !value) setDate(value);
  }, [value]);

  // Handlers
  const today = startOfToday();

  const disableDate = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;

    if (disableDates === "past") return isBefore(date, today);
    if (disableDates === "present") return date.getTime() === today.getTime();
    if (disableDates === "future") return isAfter(date, today);

    return false;
  };

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange(selectedDate);
    }
    if (autoClose && selectedDate?.from && selectedDate?.to) {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setDate(undefined);
    onDateChange(undefined);
  };

  const formatDateRange = () => {
    if (!date?.from) return label;
    if (!date.to) return format(date.from, "LLL dd, y");
    return `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`;
  };

  return (
    <div className={cn("grid gap-2 w-[300px]", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            {showIcons && <CalendarIcon className="mr-2 h-4 w-4" />}
            <span>
              {formatDateRange()}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {clearable && date && (
              <X
                className="ml-2 h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={isDesktop ? 2 : 1}
            disabled={disableDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
