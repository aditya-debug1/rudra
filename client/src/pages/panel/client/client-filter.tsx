import { DatePicker } from "@/components/custom ui/date-time-pickers";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { MultiSelect } from "@/components/custom ui/multi-select";
import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListFilter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const ClientFilter = () => {
  const status = [
    { label: "Hot", value: "hot" },
    { label: "Warm", value: "warm" },
    { label: "Cold", value: "cold" },
    { label: "Lost", value: "lost" },
    { label: "Booked", value: "booked" },
  ];

  const requirement = [
    { label: "1BHK", value: "1bhk" },
    { label: "2BHK", value: "2bhk" },
    { label: "2.5BHK", value: "2.5bhk" },
    { label: "3.5BHK", value: "3.5bhk" },
    { label: "4.5BHK", value: "4.5bhk" },
    { label: "SHOP", value: "shop" },
    { label: "OFFICE", value: "office" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <span>
          <Tooltip content="More filter options">
            <Button className="flex-shrink-0" variant="outline" size="icon">
              <ListFilter size={20} />
            </Button>
          </Tooltip>
        </span>
      </SheetTrigger>
      <SheetContent className="overflow-hidden">
        <SheetHeader>
          <SheetTitle>Client Filter Options</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-150px)] w-full pr-4">
          <div className="flex flex-col gap-8 py-4">
            <FormFieldWrapper LabelText="Select Status">
              <MultiSelect
                options={status}
                placeholder="Status"
                onValueChange={(e) => e}
                className="w-full"
              />
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Pick Date">
              <div className="flex gap-3">
                <DatePicker
                  label="Start date"
                  className="w-full"
                  onDateChange={(e) => console.log(e)}
                />
                <DatePicker
                  label="End date"
                  className="w-full"
                  onDateChange={(e) => console.log(e)}
                />
              </div>
            </FormFieldWrapper>

            <FormFieldWrapper LabelText="Select Requirement">
              <MultiSelect
                options={requirement}
                placeholder="Requirement"
                onValueChange={(e) => e}
                className="w-full"
              />
            </FormFieldWrapper>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ClientFilter;
