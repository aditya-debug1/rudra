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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { unitStatus, UnitType, WingType } from "@/store/inventory";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { HolderModal } from "./holder-modal";

const residentialConfig = [
  "1bhk",
  "2bhk",
  "3bhk",
  "1bhk+t",
  "2bhk+t",
  "3bhk+t",
  "terrace",
];
const commercialConfig = ["shop", "office"];

interface UnitTableProps {
  units: UnitType[];
  floorIndex: number;
  wingIndex: number;
  wing: WingType;
  updateUnit: (unitIndex: number, data: Partial<UnitType>) => void;
  deleteUnit: (unitIndex: number) => void;
  wings: WingType[];
  isCommercialUnit: boolean;
}

export const UnitTable = ({
  units,
  floorIndex,
  wingIndex,
  updateUnit,
  deleteUnit,
  wings,
  isCommercialUnit,
}: UnitTableProps) => {
  const [isOpen, setIsOpen] = useState<number | boolean>(false);
  const [newStatus, setNewStatus] = useState<unitStatus>();
  const [editingUnitSpans, setEditingUnitSpans] = useState<{
    [key: string]: string;
  }>({});

  const configurations = isCommercialUnit
    ? commercialConfig
    : residentialConfig;
  const statuses: unitStatus[] = [
    "available",
    "booked",
    "registered",
    "reserved",
    "canceled",
    "not-for-sale",
    "investor",
  ];

  // Generate a unique key for each unit span input
  const getUnitSpanKey = (unitIndex: number) => {
    return `${wingIndex}-${floorIndex}-${unitIndex}`;
  };

  function handleStatusChange(unitIndex: number, status: unitStatus) {
    const currentStatus = units[unitIndex].status;

    // If changing to available, update directly
    if (status === "available") {
      setNewStatus(undefined);
      setIsOpen(false);
      updateUnit(unitIndex, {
        status: "available",
        reservedByOrReason: undefined,
      });
    }
    // If changing FROM available TO something else, open the modal
    else if (currentStatus === "available") {
      setNewStatus(status);
      setIsOpen(unitIndex);
    }
    // For any other change (not from available), update directly
    else {
      updateUnit(unitIndex, {
        status: status,
      });
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-center whitespace-nowrap">
              Number
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              Unit Span
            </TableHead>
            <TableHead className="text-center">Configuration</TableHead>
            <TableHead className="text-center">Area</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Holder</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit, unitIndex) => (
            <TableRow key={unitIndex} className="hover:bg-card">
              <TableCell align="center">
                <Input
                  className="h-8 w-16 text-center"
                  value={unit.unitNumber}
                  onChange={(e) =>
                    updateUnit(unitIndex, {
                      unitNumber: e.target.value,
                    })
                  }
                />
              </TableCell>
              <TableCell align="center">
                <Input
                  className="w-16 text-center"
                  type="number"
                  value={
                    editingUnitSpans[getUnitSpanKey(unitIndex)] !== undefined
                      ? editingUnitSpans[getUnitSpanKey(unitIndex)]
                      : unit.unitSpan
                  }
                  onChange={(e) => {
                    const key = getUnitSpanKey(unitIndex);
                    // Just update the editing state, not the actual data yet
                    setEditingUnitSpans({
                      ...editingUnitSpans,
                      [key]: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    const key = getUnitSpanKey(unitIndex);
                    const inputValue = editingUnitSpans[key];

                    // On blur, we validate and commit the change
                    let newValue = parseInt(inputValue);

                    // Clear the editing state
                    const newEditingUnitSpans = {
                      ...editingUnitSpans,
                    };
                    delete newEditingUnitSpans[key];
                    setEditingUnitSpans(newEditingUnitSpans);

                    // Ignore if not a valid number or no change
                    if (isNaN(newValue) || newValue === unit.unitSpan) {
                      return;
                    }

                    // Ensure at least 1
                    if (newValue < 1) newValue = 1;

                    // Calculate max available based on floor type (commercial or residential)
                    let currentFloorUnits;

                    if (isCommercialUnit && wings[wingIndex].commercialFloors) {
                      // For commercial floors
                      currentFloorUnits =
                        wings[wingIndex].commercialFloors[floorIndex]?.units ||
                        [];
                    } else {
                      // For residential floors
                      currentFloorUnits =
                        wings[wingIndex].floors[floorIndex]?.units || [];
                    }

                    const otherUnitsSpan = currentFloorUnits.reduce(
                      (total, u, idx) => {
                        if (idx === unitIndex) return total;
                        return total + (u.unitSpan || 1);
                      },
                      0,
                    );

                    const maxAvailable =
                      wings[wingIndex].unitsPerFloor - otherUnitsSpan;

                    // Cap at max available
                    if (newValue > maxAvailable) {
                      newValue = maxAvailable;
                    }

                    // Update the unit span
                    updateUnit(unitIndex, { unitSpan: newValue });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  min={1}
                />
              </TableCell>
              <TableCell align="center">
                <Select
                  value={unit.configuration}
                  onValueChange={(e) =>
                    updateUnit(unitIndex, {
                      configuration: e,
                    })
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Select Configuration" />
                  </SelectTrigger>
                  <SelectContent align="center">
                    <SelectGroup>
                      <SelectLabel>Configurations</SelectLabel>
                      {configurations.map((config, index) => (
                        <SelectItem value={config} key={index}>
                          {config.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell align="center">
                <Input
                  className="w-20 text-center"
                  value={isNaN(unit.area) ? "" : unit.area}
                  type="number"
                  onChange={(e) =>
                    updateUnit(unitIndex, {
                      area: parseInt(e.target.value),
                    })
                  }
                />
              </TableCell>

              <TableCell align="center">
                <Select
                  value={unit.status}
                  onValueChange={(e) =>
                    handleStatusChange(unitIndex, e as unitStatus)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent align="center">
                    <SelectGroup>
                      <SelectLabel>Unit Status</SelectLabel>
                      {statuses.map((status, index) => (
                        <SelectItem value={status} key={index}>
                          {status.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell align="center">
                {unit.reservedByOrReason || "N/A"}
              </TableCell>
              <TableCell align="center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUnit(unitIndex)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <HolderModal
        newStatus={newStatus}
        unitIndex={typeof isOpen === "number" ? isOpen : -1}
        updateUnit={updateUnit}
        isOpen={isOpen !== false}
        onOpenChange={setIsOpen}
      />
    </div>
  );
};
