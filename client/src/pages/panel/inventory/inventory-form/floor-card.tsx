import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Input } from "@/components/ui/input";
import { FloorType, UnitType, WingType } from "@/store/inventory";
import {
  AlertCircle,
  CirclePlus,
  Eye,
  EyeClosed,
  MoreVertical,
  Trash,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnitTable } from "./unit-table";

interface FloorCardProps {
  floor: FloorType;
  floorIndex: number;
  wingIndex: number;
  wing: WingType;
  updateFloor: (floorIndex: number, data: Partial<FloorType>) => void;
  deleteFloor: (floorIndex: number) => void;
  wings: WingType[];
}

export const FloorCard = ({
  floor,
  floorIndex,
  wingIndex,
  wing,
  updateFloor,
  deleteFloor,
  wings,
}: FloorCardProps) => {
  // Unit span calculations
  const getTotalUnitSpanForFloor = () => {
    if (!floor?.units) return 0;

    return floor.units.reduce((total, unit) => total + (unit.unitSpan || 1), 0);
  };

  const isFloorOverMaxUnitSpan = () => {
    const maxUnitsPerFloor = wing?.unitsPerFloor || 0;
    const totalUnitSpan = getTotalUnitSpanForFloor();

    return totalUnitSpan > maxUnitsPerFloor;
  };

  const getRemainingUnitSpan = () => {
    const maxUnitsPerFloor = wing?.unitsPerFloor || 0;
    const totalUnitSpan = getTotalUnitSpanForFloor();

    return Math.max(0, maxUnitsPerFloor - totalUnitSpan);
  };

  const canAddUnitToFloor = () => {
    return getRemainingUnitSpan() > 0;
  };

  const addUnit = () => {
    const units = floor?.units || [];
    const newUnit: UnitType = {
      unitNumber: `${floorIndex + 1}${String(units.length + 1).padStart(2, "0")}`,
      area: 0,
      configuration: floor.type == "residential" ? "1bhk" : "shop",
      unitSpan: 1,
      status: "available",
    };

    const updatedUnits = [...units, newUnit];

    updateFloor(floorIndex, { ...floor, units: updatedUnits });
  };

  const updateUnit = (unitIndex: number, data: Partial<UnitType>) => {
    const units = [...(floor.units || [])];
    const currentUnit = units[unitIndex];

    units[unitIndex] = {
      ...currentUnit,
      ...data,
    };

    updateFloor(floorIndex, { ...floor, units: units });
  };

  const deleteUnit = (unitIndex: number) => {
    const units = [...floor.units];
    const updatedUnits = units.filter((_, i) => i !== unitIndex);

    updateFloor(floorIndex, { ...floor, units: updatedUnits });
  };

  const handleShowArea = () => {
    updateFloor(floorIndex, { showArea: !floor.showArea });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {floor.type == "commercial"
              ? "Commercial Floor "
              : "Residential Floor "}
            {floor.displayNumber}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden" asChild>
              <Button variant="outline" size="miniIcon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={addUnit}>
                <CirclePlus className="h-4 w-4 mr-2" /> Add Unit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShowArea}>
                {!floor.showArea ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" /> Show Area
                  </>
                ) : (
                  <>
                    <EyeClosed className="mr-2 h-4 w-4" /> Hide Area
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="items-center text-red-500"
                onClick={() => deleteFloor(floorIndex)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUnit}
              disabled={!canAddUnitToFloor()}
            >
              <CirclePlus className="mr-2 h-4 w-4" /> Add Unit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShowArea}
            >
              {!floor.showArea ? (
                <>
                  <Eye className="mr-2 h-4 w-4" /> Show Area
                </>
              ) : (
                <>
                  <EyeClosed className="mr-2 h-4 w-4" /> Hide Area
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => deleteFloor(floorIndex)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <FormFieldWrapper
            LabelText="Floor Display No"
            style={{ marginBottom: "1.25rem" }}
          >
            <Input
              // className="w-48"
              type="number"
              value={floor.displayNumber}
              onChange={(e) =>
                updateFloor(floorIndex, {
                  displayNumber: Number(e.target.value),
                })
              }
            />
          </FormFieldWrapper>
        </div>
        {isFloorOverMaxUnitSpan() && (
          <Alert variant="destructive" style={{ marginBottom: "1rem" }}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Total unit span exceeds the maximum units per floor (
              {wing.unitsPerFloor}). Please reduce the unit span values.
            </AlertDescription>
          </Alert>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <p className="text-sm text-muted-foreground">
            {getTotalUnitSpanForFloor()} of {wing.unitsPerFloor} unit spaces
            used.
            <span
              className={
                getRemainingUnitSpan() <= 0 ? "text-red-500" : "text-green-500"
              }
            >
              {" "}
              ({getRemainingUnitSpan()} remaining)
            </span>
          </p>
        </div>

        {floor.units && floor.units.length > 0 ? (
          <UnitTable
            units={floor.units}
            floorIndex={floorIndex}
            wingIndex={wingIndex}
            wing={wing}
            updateUnit={updateUnit}
            deleteUnit={deleteUnit}
            wings={wings}
            isCommercialUnit={floor.type == "commercial"}
          />
        ) : (
          <div
            className="border border-dashed rounded-sm flex flex-col justify-center items-center gap-3 p-8"
            style={{ marginTop: "1rem" }}
          >
            <p className="text-secondary text-center">No units added yet</p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1"
              onClick={addUnit}
            >
              <CirclePlus size={16} />
              Add Unit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
