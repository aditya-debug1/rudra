import { useAlertDialog } from "@/components/custom ui/alertDialog";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/hooks/use-role";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import {
  FloorType,
  unitStatus,
  UnitType,
  useInventory,
  WingType,
} from "@/store/inventory";
import { capitalizeWords } from "@/utils/func/strUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { MoreHorizontalIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface WingInfoProps {
  wings: WingType[];
}

export const WingInfo = ({ wings }: WingInfoProps) => {
  const [activeWingIndex, setActiveWingIndex] = useState(0);
  return (
    <div className="space-y-6 mt-6 pt-6 border-t">
      <h3 className="text-lg font-medium">Wing Information</h3>
      {wings.length > 0 ? (
        <>
          {wings.length > 1 ? (
            <Tabs
              defaultValue={
                activeWingIndex !== null ? activeWingIndex.toString() : "0"
              }
              value={
                activeWingIndex !== null
                  ? activeWingIndex.toString()
                  : undefined
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
                  <WingCard wing={wing} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <WingCard wing={wings[0]} />
          )}
        </>
      ) : (
        <div>No Wings Found</div>
      )}
    </div>
  );
};

// Utility functions extracted to be reused
const getUnitTotal = (floor: FloorType, status: unitStatus) => {
  return floor.units.filter((unit) => unit.status === status).length;
};

const getOverallTotal = (wing: WingType, status: unitStatus) => {
  return wing.floors.reduce((total, floor) => {
    return total + floor.units.filter((unit) => unit.status === status).length;
  }, 0);
};

// 1. FloorTable Component - Handles the floor table display and expandable rows
function FloorTable({ wing }: { wing: WingType }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [heights, setHeights] = useState<Record<string, number>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      // Uncomment the line below to allow multiple rows to be open simultaneously
      // ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const newHeights: Record<string, number> = {};
    Object.keys(contentRefs.current).forEach((id) => {
      const element = contentRefs.current[id];
      if (element) {
        newHeights[id] = element.scrollHeight;
      }
    });
    setHeights(newHeights);
  }, [wing.floors]);

  return (
    <div className="border rounded-md overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <TableHeader>
          <TableRow className="bg-card hover:bg-card sticky top-0 z-20">
            <TableHead className="text-center whitespace-nowrap">
              Floor No
            </TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center whitespace-nowrap">
              Total Units
            </TableHead>
            <TableHead className="text-center">Available</TableHead>
            <TableHead className="text-center">Reserved</TableHead>
            <TableHead className="text-center">Booked</TableHead>
            <TableHead className="text-center">Registered</TableHead>
            <TableHead className="text-center">Investor</TableHead>
            <TableHead className="text-center">Canceled</TableHead>
            <TableHead className="text-center whitespace-nowrap">
              Not For Sale
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wing.floors &&
            wing.floors.map((floor) => {
              const floorId = floor.displayNumber.toString();
              const isOpen = openItems[floorId] || false;

              return (
                <React.Fragment key={floorId}>
                  <TableRow
                    className={`transition-colors duration-200 cursor-pointer ${isOpen ? "bg-muted/30" : ""}`}
                    onClick={() => toggleItem(floorId)}
                  >
                    <TableCell className="text-center">
                      {floor.displayNumber}
                    </TableCell>
                    <TableCell className="text-center">{floor.type}</TableCell>
                    <TableCell className="text-center">
                      {floor.units.length - getUnitTotal(floor, "others")}
                    </TableCell>
                    <TableCell className="text-center">
                      {getUnitTotal(floor, "available")}
                    </TableCell>
                    <TableCell className="text-center">
                      {getUnitTotal(floor, "reserved")}
                    </TableCell>
                    <TableCell className="text-center">
                      {getUnitTotal(floor, "booked")}
                    </TableCell>
                    <TableCell className="text-center">
                      {getUnitTotal(floor, "registered")}
                    </TableCell>
                    <TableCell className="text-center">
                      {getUnitTotal(floor, "investor")}
                    </TableCell>
                    <TableCell className="text-center">
                      {getUnitTotal(floor, "canceled")}
                    </TableCell>
                    <TableCell className="text-center">
                      {getUnitTotal(floor, "not-for-sale")}
                    </TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-card expandable-row">
                    <TableCell colSpan={10} className="p-0 border-b border-t-0">
                      <div
                        style={{
                          height: isOpen ? `${heights[floorId] || 0}px` : "0px",
                          opacity: isOpen ? 1 : 0,
                          overflow: "hidden",
                          transition: "height 0.3s ease, opacity 0.3s ease",
                        }}
                      >
                        <div ref={(e) => (contentRefs.current[floorId] = e)}>
                          <UnitTable units={floor.units} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-card hover:bg-card sticky bottom-0 z-20">
            <TableCell colSpan={2} className="text-center font-medium">
              Total
            </TableCell>
            <TableCell className="text-center font-medium">
              {wing.floors.reduce(
                (total, floor) => total + floor.units.length,
                0,
              ) - getOverallTotal(wing, "others")}
            </TableCell>
            <TableCell className="text-center font-medium">
              {getOverallTotal(wing, "available")}
            </TableCell>
            <TableCell className="text-center font-medium">
              {getOverallTotal(wing, "reserved")}
            </TableCell>
            <TableCell className="text-center font-medium">
              {getOverallTotal(wing, "booked")}
            </TableCell>
            <TableCell className="text-center font-medium">
              {getOverallTotal(wing, "registered")}
            </TableCell>
            <TableCell className="text-center font-medium">
              {getOverallTotal(wing, "investor")}
            </TableCell>
            <TableCell className="text-center font-medium">
              {getOverallTotal(wing, "canceled")}
            </TableCell>
            <TableCell className="text-center font-medium">
              {getOverallTotal(wing, "not-for-sale")}
            </TableCell>
          </TableRow>
        </TableFooter>
      </table>
    </div>
  );
}

// 2. WingCard Component - Now simplified to use the FloorTable component
function WingCard({
  wing,
  isEditable = false,
}: {
  wing: WingType;
  isEditable?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Wing {wing.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ marginBottom: "1.5rem" }}
        >
          <FormFieldWrapper
            LabelText="Wing Name"
            Important={isEditable}
            ImportantSide="right"
          >
            <Input
              disabled={!isEditable}
              placeholder="Enter wing name"
              value={wing.name || ""}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            LabelText="Units per floor"
            Important={isEditable}
            ImportantSide="right"
          >
            <Input
              type="number"
              disabled={!isEditable}
              value={isNaN(wing.unitsPerFloor) ? "" : wing.unitsPerFloor}
              min={1}
              placeholder="e.g. 6"
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            LabelText="Header Floor No"
            Important={isEditable}
            ImportantSide="right"
          >
            <Input
              type="number"
              disabled={!isEditable}
              value={
                isNaN(wing.headerFloorIndex) ||
                wing.headerFloorIndex === undefined
                  ? ""
                  : wing.headerFloorIndex + 1
              }
              min={1}
            />
          </FormFieldWrapper>
        </div>

        {/* Use the FloorTable component here */}
        <FloorTable wing={wing} />
      </CardContent>
    </Card>
  );
}

const getStatusColor = (status: unitStatus) => {
  switch (status) {
    case "canceled":
      return "bg-destructive text-destructive-foreground hover:bg-destructive";
    case "not-for-sale":
      return "bg-orange-300 text-orange-600 hover:bg-orange-300";
    case "others":
      return "bg-gray-600 text-gray-100 hover:bg-gray-600";
    case "investor":
      return "bg-blue-600 text-slate-50 hover:bg-blue-600";
    case "reserved":
      return "bg-yellow-100 text-yellow-600 hover:bg-yellow-100";
    case "booked":
      return "bg-yellow-300/90 text-yellow-700 hover:bg-yellow-300/90";
    case "registered":
      return "bg-green-700 text-slate-50 hover:bg-green-700";
    case "available":
      return;
    default:
      return;
  }
};

type unitDataType = {
  _id: string;
  unitNo: string;
  area: number;
  configuration: string;
  status: unitStatus;
  reservedByOrReason?: string;
};

function UnitTable({ units }: { units: UnitType[] }) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedUnitData, setSelectedUnitData] = useState<unitDataType>({
    _id: "",
    area: 0,
    configuration: "",
    unitNo: "",
    status: "available",
  });
  const { combinedRole } = useAuth(true);
  const updateUnitStatus = hasPermission(
    combinedRole,
    "Inventory",
    "update-unit-status",
  );
  const updateUnit = hasPermission(combinedRole, "Inventory", "update-unit");

  const hasPerms = updateUnit || updateUnitStatus;

  const handleSetUpdate = (data: unitDataType) => {
    setSelectedUnitData(data);
    setIsUpdateOpen(true);
  };

  const handleSetStatus = (data: unitDataType) => {
    setSelectedUnitData(data);
    setIsStatusOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead className="text-center font-medium">Unit No</TableHead>
            <TableHead className="text-center font-medium">
              Configuration
            </TableHead>
            <TableHead className="text-center font-medium">Area</TableHead>
            <TableHead className="text-center font-medium">Holder</TableHead>
            <TableHead className="text-center font-medium">Status</TableHead>
            {hasPerms && (
              <TableHead className="text-center font-medium">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit, index) => (
            <TableRow key={index} className="hover:bg-card">
              <TableCell className="text-center font-medium">
                {unit.unitNumber}
              </TableCell>
              <TableCell className="text-center font-medium">
                {unit.configuration.toUpperCase()}
              </TableCell>
              <TableCell className="text-center font-medium">
                {unit.area} sqft.
              </TableCell>
              <TableCell className="text-center font-medium">
                {unit.reservedByOrReason || "N/A"}
              </TableCell>
              <TableCell className="text-center font-medium">
                <Badge className={`${getStatusColor(unit.status)}`}>
                  {unit.status.toUpperCase().replace(/-/g, " ")}
                </Badge>
              </TableCell>
              {hasPerms && (
                <TableCell className="text-center font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="miniIcon">
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Unit Options</DropdownMenuLabel>
                      {updateUnit && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleSetUpdate({
                              _id: unit._id!,
                              area: unit.area,
                              configuration: unit.configuration,
                              status: unit.status,
                              unitNo: unit.unitNumber,
                              reservedByOrReason: unit.reservedByOrReason,
                            })
                          }
                        >
                          Update Unit
                        </DropdownMenuItem>
                      )}
                      {updateUnitStatus && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleSetStatus({
                              _id: unit._id!,
                              area: unit.area,
                              configuration: unit.configuration,
                              status: unit.status,
                              unitNo: unit.unitNumber,
                              reservedByOrReason: unit.reservedByOrReason,
                            })
                          }
                        >
                          Change Status
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <UnitUpdateForm
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        unitData={selectedUnitData}
        setUnitData={setSelectedUnitData}
      />
      <UnitStatusModal
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        unitData={selectedUnitData}
        setUnitData={setSelectedUnitData}
      />
    </>
  );
}

function UnitStatusModal({
  open,
  onOpenChange,
  unitData,
  setUnitData,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  unitData: unitDataType;
  setUnitData: (data: unitDataType) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUnitStatusMutation } = useInventory();

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      onOpenChange(false);
      await updateUnitStatusMutation.mutateAsync({
        unitId: unitData._id,
        status: unitData.status,
        reservedByOrReason: unitData.reservedByOrReason,
      });
    } catch (error) {
      console.error("Failed to update unit status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">
            Unit Status - {unitData.unitNo}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <FormFieldWrapper
            LabelText="Unit Status"
            Important
            ImportantSide="right"
            className="gap-2"
          >
            <Select
              value={unitData.status}
              onValueChange={(e) =>
                setUnitData({ ...unitData, status: e as unitStatus })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="not-for-sale">Not For Sale</SelectItem>
                <SelectItem value="others">Others</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
          {unitData.status !== "available" && (
            <FormFieldWrapper
              Important
              ImportantSide="right"
              LabelText="Holder Name"
              className="gap-2"
            >
              <Input
                placeholder="Enter Holder's Name"
                value={unitData.reservedByOrReason || ""}
                onChange={(e) =>
                  setUnitData({
                    ...unitData,
                    reservedByOrReason: capitalizeWords(e.target.value),
                  })
                }
              />
            </FormFieldWrapper>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UnitUpdateForm({
  open,
  onOpenChange,
  unitData,
  setUnitData,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  unitData: unitDataType;
  setUnitData: (data: unitDataType) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUnitMutation } = useInventory();
  const dialog = useAlertDialog({
    title: "Update Unit",
    description: `Are you sure? you want to update this unit`,
    alertType: "Warn",
    iconName: "CircleFadingArrowUp",
  });

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    dialog.show({
      config: {
        description: `Are you sure? you want to update this unit: ${unitData.unitNo}`,
        cancelLabel: "Cancel",
        actionLabel: "Update Unit",
      },
      onAction: async () => {
        try {
          setIsSubmitting(true);
          onOpenChange(false);
          await updateUnitMutation.mutateAsync({
            unitId: unitData._id,
            unitNumber: unitData.unitNo,
            area: unitData.area,
            configuration: unitData.configuration,
          });
          toast({
            title: "Unit Updated",
            description: "Successfully updated unit",
          });
        } catch (error) {
          const err = error as CustomAxiosError;
          console.error("Failed to update unit:", error);
          toast({
            title: "Error Occurred",
            description: err.response?.data.error || "Failed to update unit",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Update Unit - {unitData.unitNo}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <FormFieldWrapper
              LabelText="Unit Number"
              Important
              ImportantSide="right"
              className="gap-2"
            >
              <Input
                type="text"
                placeholder="Enter unit number"
                value={unitData.unitNo || ""}
                onChange={(e) =>
                  setUnitData({ ...unitData, unitNo: e.target.value })
                }
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              LabelText="Area (sqft)"
              Important
              ImportantSide="right"
              className="gap-2"
            >
              <Input
                type="number"
                placeholder="Enter area in sqft"
                value={unitData.area || ""}
                onChange={(e) =>
                  setUnitData({
                    ...unitData,
                    area: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                step={0.01}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              LabelText="Configuration"
              Important
              ImportantSide="right"
              className="gap-2"
            >
              <Select
                value={unitData.configuration}
                onValueChange={(value) =>
                  setUnitData({ ...unitData, configuration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Configuration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1bhk">1BHK</SelectItem>
                  <SelectItem value="1bhk+t">1BHK+Terrace</SelectItem>
                  <SelectItem value="2bhk">2BHK</SelectItem>
                  <SelectItem value="2bhk+t">2BHK+Terrace</SelectItem>
                  <SelectItem value="3bhk">3BHK</SelectItem>
                  <SelectItem value="3bhk+t">3BHK+Terrace</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <dialog.AlertDialog />
    </>
  );
}
