import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { WingType } from "@/store/inventory";
import { wingSchema } from "@/utils/zod-schema/inventory";
import { parseInt } from "lodash";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { WingCard } from "./wing-card";

interface WingSectionProps {
  wings: WingType[];
  onWingsChange: (wings: WingType[]) => void;
  showCommercialFloors: boolean;
}

export const WingSection = ({
  wings,
  onWingsChange,
  showCommercialFloors,
}: WingSectionProps) => {
  const [activeWingIndex, setActiveWingIndex] = useState<number | null>(null);

  const addWing = () => {
    // validation for creating new wing if current-one is completed
    if (wings.length > 0) {
      const validation = wingSchema.safeParse(wings[activeWingIndex!]);
      if (!validation.success) {
        toast({
          title: "Incomplete Wing Details",
          description:
            "Please finish filling out the current wing’s information before adding a new one.",
          variant: "warning",
        });
        return null;
      }
    }

    const newWing: WingType = {
      name: `Wing ${String.fromCharCode(97 + (wings?.length || 0)).toUpperCase()}`,
      unitsPerFloor: 6,
      headerFloorIndex: 0,
      floors: [],
    };

    onWingsChange([...(wings || []), newWing as WingType]);
    setActiveWingIndex(wings?.length || 0);
  };

  const deleteWing = (wingIndex: number) => {
    const updatedWings = wings?.filter((_, i) => i !== wingIndex);
    onWingsChange(updatedWings);
    setActiveWingIndex(updatedWings.length - 1);
  };

  const updateWing = (wingIndex: number, data: Partial<WingType>) => {
    const updatedWings = [...(wings || [])];
    updatedWings[wingIndex] = { ...updatedWings[wingIndex], ...data };
    onWingsChange(updatedWings);
  };

  return (
    <div className="mt-6 pt-6 border-t">
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "1.5rem" }}
      >
        <h3 className="text-lg font-medium">Wings and Floors</h3>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-1"
          onClick={addWing}
        >
          <CirclePlus size={16} />
          Add Wing
        </Button>
      </div>

      {wings && wings.length > 0 ? (
        <Tabs
          defaultValue={
            activeWingIndex !== null ? activeWingIndex.toString() : "0"
          }
          value={
            activeWingIndex !== null ? activeWingIndex.toString() : undefined
          }
          onValueChange={(value) => setActiveWingIndex(parseInt(value))}
          className="w-full"
        >
          <TabsList className="flex-wrap mb-4">
            {wings.map((wing, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                {wing.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {wings.map((wing, wingIndex) => (
            <TabsContent key={wingIndex} value={wingIndex.toString()}>
              <WingCard
                wing={wing}
                wingIndex={wingIndex}
                updateWing={updateWing}
                deleteWing={deleteWing}
                onWingsChange={onWingsChange}
                wings={wings}
                showCommercialFloors={showCommercialFloors}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="border border-dashed rounded-sm flex flex-col justify-center items-center gap-3 p-8">
          <p className="text-secondary text-center">
            No wings added to this project yet
          </p>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-1"
            onClick={addWing}
          >
            <CirclePlus size={16} />
            Add First Wing
          </Button>
        </div>
      )}
    </div>
  );
};
