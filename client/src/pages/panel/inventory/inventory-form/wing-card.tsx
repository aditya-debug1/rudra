import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FloorType, UnitType, WingType } from "@/store/inventory";
import { CirclePlus, CopyPlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FloorCard } from "./floor-card";

interface WingCardProps {
  wing: WingType;
  wingIndex: number;
  updateWing: (wingIndex: number, data: Partial<WingType>) => void;
  deleteWing: (wingIndex: number) => void;
  onWingsChange: (wings: WingType[]) => void;
  wings: WingType[];
  showCommercialFloors: boolean;
}

export const WingCard = ({
  wing,
  wingIndex,
  updateWing,
  deleteWing,
  onWingsChange,
  wings,
  showCommercialFloors,
}: WingCardProps) => {
  // State to track the input value for header floor number
  const [headerFloorInput, setHeaderFloorInput] = useState<string>(
    wing.headerFloorIndex !== undefined
      ? String(wing.headerFloorIndex + 1)
      : "",
  );

  // Timer for validation delay
  const [headerFloorTimer, setHeaderFloorTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Update input field when wing.headerFloorIndex changes externally
  useEffect(() => {
    if (wing.headerFloorIndex !== undefined) {
      setHeaderFloorInput(String(wing.headerFloorIndex + 1));
    }
  }, [wing.headerFloorIndex]);

  const handleHeaderFloorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHeaderFloorInput(inputValue);

    // Clear any existing timer
    if (headerFloorTimer) {
      clearTimeout(headerFloorTimer);
    }

    // If input is empty, we still update the state immediately to show empty field
    if (inputValue === "") {
      updateWing(wingIndex, { headerFloorIndex: 0 });
    } else {
      // Otherwise convert to number and update
      const value = parseInt(inputValue);
      if (!isNaN(value)) {
        updateWing(wingIndex, { headerFloorIndex: value - 1 });
      }
    }

    // Set a timer to validate after 1 second
    const timer = setTimeout(() => {
      const value = parseInt(inputValue);
      if (inputValue === "" || isNaN(value) || value < 1) {
        // Reset to default (1) if invalid after delay
        setHeaderFloorInput("1");
        updateWing(wingIndex, { headerFloorIndex: 0 });
      }
    }, 1500);

    setHeaderFloorTimer(timer);
  };

  const addCommercialFloor = () => {
    const floors = wing?.commercialFloors || [];
    const newFloor: FloorType = {
      displayNumber: floors.length + 1,
      type: "commercial",
      showArea: false,
      units: [],
    };

    const updatedWings = [...(wings || [])];
    // Initialize commercialFloors if it doesn't exist
    if (!updatedWings[wingIndex].commercialFloors) {
      updatedWings[wingIndex].commercialFloors = [];
    }

    updatedWings[wingIndex].commercialFloors = [
      ...updatedWings[wingIndex].commercialFloors,
      newFloor,
    ];

    onWingsChange(updatedWings);
  };

  const deleteCommercialFloor = (floorIndex: number) => {
    const updatedWings = [...wings];
    if (updatedWings[wingIndex].commercialFloors) {
      updatedWings[wingIndex].commercialFloors = updatedWings[
        wingIndex
      ].commercialFloors.filter((_, i) => i !== floorIndex);
      onWingsChange(updatedWings);
    }
  };

  const updateCommercialFloor = (
    floorIndex: number,
    data: Partial<FloorType>,
  ) => {
    const updatedWings = [...(wings || [])];
    if (
      updatedWings[wingIndex].commercialFloors &&
      updatedWings[wingIndex].commercialFloors[floorIndex]
    ) {
      updatedWings[wingIndex].commercialFloors[floorIndex] = {
        ...updatedWings[wingIndex].commercialFloors[floorIndex],
        ...data,
      };
      onWingsChange(updatedWings);
    }
  };

  const addResidentialFloor = () => {
    const floors = wing?.floors || [];
    const newFloor: FloorType = {
      displayNumber: floors.length + 1,
      type: "residential",
      showArea: false,
      units: [],
    };

    const updatedWings = [...(wings || [])];
    // Initialize floors if it doesn't exist
    if (!updatedWings[wingIndex].floors) {
      updatedWings[wingIndex].floors = [];
    }

    updatedWings[wingIndex].floors = [
      ...updatedWings[wingIndex].floors,
      newFloor,
    ];

    onWingsChange(updatedWings);
  };

  const duplicatePreviousFloor = () => {
    const floors = wing?.floors || [];
    if (floors.length === 0) return;

    // Get the last floor in the array to duplicate
    const lastFloorIndex = floors.length - 1;
    const lastFloor = floors[lastFloorIndex];

    // Create a deep clone of the last floor
    const lastFloorClone = JSON.parse(JSON.stringify(lastFloor));

    // New display number for the duplicated floor
    const newDisplayNumber = lastFloor.displayNumber + 1;

    // Update the unit numbers based on the new floor number
    // For example: units on floor 1 (101, 102, 103) → floor 2 (201, 202, 203)
    const updatedUnits = lastFloorClone.units.map((unit: UnitType) => {
      // Create a new unit object to avoid modifying the original
      const updatedUnit = { ...unit };

      // Extract the unit number part (e.g., from "101" get "01")
      const unitNumberPart = String(unit.unitNumber).slice(
        String(lastFloor.displayNumber).length,
      );

      // Create the new unit number with the new floor display number
      updatedUnit.unitNumber = `${newDisplayNumber}${unitNumberPart}`;

      return updatedUnit;
    });

    // Create a new floor object with updated values
    const newFloor: FloorType = {
      ...lastFloorClone,
      type: "residential",
      displayNumber: newDisplayNumber,
      units: updatedUnits,
    };

    const updatedWings = [...(wings || [])];
    updatedWings[wingIndex].floors = [
      ...updatedWings[wingIndex].floors,
      newFloor,
    ];

    onWingsChange(updatedWings);
  };

  const deleteResidentialFloor = (floorIndex: number) => {
    const updatedWings = [...wings];
    if (updatedWings[wingIndex].floors) {
      updatedWings[wingIndex].floors = updatedWings[wingIndex].floors.filter(
        (_, i) => i !== floorIndex,
      );
      onWingsChange(updatedWings);
    }
  };

  const updateResidentialFloor = (
    floorIndex: number,
    data: Partial<FloorType>,
  ) => {
    const updatedWings = [...(wings || [])];
    if (
      updatedWings[wingIndex].floors &&
      updatedWings[wingIndex].floors[floorIndex]
    ) {
      updatedWings[wingIndex].floors[floorIndex] = {
        ...updatedWings[wingIndex].floors[floorIndex],
        ...data,
      };
      onWingsChange(updatedWings);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            Wing Details
          </CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteWing(wingIndex)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ marginBottom: "1.5rem" }}
        >
          <FormFieldWrapper
            Important
            ImportantSide="right"
            LabelText="Wing Name"
          >
            <Input
              placeholder="Enter wing name"
              value={wing.name || ""}
              onChange={(e) => updateWing(wingIndex, { name: e.target.value })}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            Important
            ImportantSide="right"
            LabelText="Units per floor"
          >
            <Input
              type="number"
              value={isNaN(wing.unitsPerFloor) ? "" : wing.unitsPerFloor}
              onChange={(e) =>
                updateWing(wingIndex, {
                  unitsPerFloor: parseInt(e.target.value) || 0,
                })
              }
              min={1}
              placeholder="e.g. 6"
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            Important
            ImportantSide="right"
            LabelText="Header Floor No"
          >
            <Input
              type="number"
              value={headerFloorInput}
              onChange={handleHeaderFloorChange}
              min={1}
              placeholder="Enter floor number"
            />
          </FormFieldWrapper>
        </div>

        <div
          className="flex items-center justify-between mx-1"
          style={{ marginBottom: "1rem" }}
        >
          <h3 className="text-base font-medium">Floors</h3>

          <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden" asChild>
              <Button variant="outline" size="miniIcon">
                <Plus size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={addCommercialFloor}>
                Add Commercial Floor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addResidentialFloor}>
                Add Residential Floor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-2">
            {showCommercialFloors && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1"
                onClick={addCommercialFloor}
              >
                <CirclePlus size={16} />
                Add Commercial Floor
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1"
              onClick={addResidentialFloor}
            >
              <CirclePlus size={16} />
              Add Residential Floor
            </Button>
          </div>
        </div>

        {showCommercialFloors &&
          wing.commercialFloors &&
          wing.commercialFloors.length > 0 && (
            <div className="space-y-4 mb-4">
              {wing.commercialFloors.map((floor, floorIndex) => (
                <FloorCard
                  key={`commercial-${floorIndex}`}
                  floor={floor}
                  floorIndex={floorIndex}
                  wingIndex={wingIndex}
                  wing={wing}
                  updateFloor={updateCommercialFloor}
                  deleteFloor={deleteCommercialFloor}
                  wings={wings}
                />
              ))}
            </div>
          )}

        {wing.floors && wing.floors.length > 0 ? (
          <div className="space-y-4">
            {wing.floors.map((floor, floorIndex) => (
              <FloorCard
                key={`residential-${floorIndex}`}
                floor={floor}
                floorIndex={floorIndex}
                wingIndex={wingIndex}
                wing={wing}
                updateFloor={updateResidentialFloor}
                deleteFloor={deleteResidentialFloor}
                wings={wings}
              />
            ))}
            <div
              className="border border-dashed rounded-sm flex flex-row justify-center flex-wrap-reverse items-center gap-3 px-6 py-4 mx-1"
              style={{ marginTop: "1rem" }}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1"
                onClick={addResidentialFloor}
              >
                <CirclePlus size={16} />
                Add Next Floor
              </Button>

              {wing.floors && wing.floors.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center gap-1"
                  onClick={duplicatePreviousFloor}
                >
                  <CopyPlus size={16} />
                  Duplicate Previous Floor
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-dashed rounded-sm flex flex-col justify-center items-center gap-3 p-8 mx-1">
            <p className="text-secondary text-center">
              No floors added to this wing yet
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1"
              onClick={addResidentialFloor}
            >
              <CirclePlus size={16} />
              Add First Floor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
