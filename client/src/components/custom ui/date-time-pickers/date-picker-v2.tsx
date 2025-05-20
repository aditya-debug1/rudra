import { format, isAfter, isBefore } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  disableDates?: "past" | "present" | "future" | null;
  closeOnDayClick?: boolean;
  placeholder?: string | null;
  className?: string;
  defaultDate?: Date;
  disabled?: boolean;
  onDateChange: (date: Date) => void;
  fromYear?: number;
  toYear?: number;
}

export default function DatePickerV2({
  disableDates = null,
  closeOnDayClick = false,
  defaultDate,
  onDateChange,
  disabled = false,
  placeholder = null,
  fromYear = 1950,
  toYear = new Date().getFullYear(),
  className,
}: DatePickerProps) {
  // useStates
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date>();

  // useEffects
  useEffect(() => {
    if (defaultDate instanceof Date) setDate(defaultDate);
    if (defaultDate == undefined) setDate(undefined);
  }, [defaultDate]);

  // handlers
  const disableDate = (date: Date) => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    if (disableDates === "past") return isBefore(date, startOfToday);
    if (disableDates === "present") {
      return !(isBefore(date, startOfToday) || isAfter(date, startOfToday));
    }
    if (disableDates === "future") return isAfter(date, startOfToday);
    return false;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange(selectedDate);
    }
  };

  const handleDayClick = () => {
    if (closeOnDayClick) return setIsOpen(false);
    return undefined;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full sm:w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "MMM do, yyyy")
          ) : (
            <span>{placeholder ? placeholder : "Pick a date"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 mx-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          disabled={disableDate}
          captionLayout="dropdown"
          onDayClick={handleDayClick}
          fromYear={fromYear}
          toYear={toYear}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}
