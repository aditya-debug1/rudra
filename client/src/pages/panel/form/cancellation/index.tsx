import { Combobox } from "@/components/custom ui/combobox";
import { DatePickerV2 } from "@/components/custom ui/date-time-pickers";
import { FormFieldWrapper } from "@/components/custom ui/form-field-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUpdateClientBooking } from "@/store/client-booking/query";
import {
  ProjectType,
  unitStatus,
  UnitType,
  useInventory,
} from "@/store/inventory";
import { getOrdinal } from "@/utils/func/numberUtils";
import { toProperCase } from "@/utils/func/strUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { pdf } from "@react-pdf/renderer";
import { TicketX } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { CancellationLetter } from "./cancellation-pdf";

const PropertyTypeEnum = z.enum(["flat", "shop", "office"]);

// Project schema
const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  by: z.string(),
  location: z.string(),
});

// Property schema
const PropertySchema = z.object({
  type: PropertyTypeEnum,
  wing: z.string(),
  floorNo: z.string().min(1, "Floor number is required"),
  unitNo: z.string().min(1, "Unit number is required"),
});

// Main cancellation data schema
export const CancellationDataSchema = z.object({
  project: ProjectSchema,
  property: PropertySchema,
  date: z.date(),
  holder: z.string(),
});

export const CancellationForm = () => {
  // Hooks
  const { toast } = useToast();
  const { useProjectsStructure, updateUnitStatusMutation } = useInventory();
  const { data: projectsData } = useProjectsStructure();
  const updateClientBookingMutation = useUpdateClientBooking();

  const flatStatusFilter: unitStatus[] = ["booked", "registered", "investor"];

  // Add this function inside the BookingForm component
  const getFilteredProjectsData = () => {
    if (!projectsData?.data) return [];

    // Deep clone the projects to avoid mutating the original data
    const filteredProjects = JSON.parse(
      JSON.stringify(projectsData.data),
    ) as ProjectType[];

    return filteredProjects
      .map((project) => {
        // Filter commercial floors at project level if applicable
        if (
          project.commercialUnitPlacement === "projectLevel" &&
          project.commercialFloors
        ) {
          project.commercialFloors = project.commercialFloors
            .map((floor) => ({
              ...floor,
              units: floor.units.filter((unit) =>
                flatStatusFilter.includes(unit.status),
              ),
            }))
            .filter((floor) => floor.units.length > 0);
        }

        // Filter wings and their floors
        project.wings = project.wings
          .map((wing) => {
            // Filter residential floors
            wing.floors = wing.floors
              .map((floor) => ({
                ...floor,
                units: floor.units.filter((unit) =>
                  flatStatusFilter.includes(unit.status),
                ),
              }))
              .filter((floor) => floor.units.length > 0);

            // Filter commercial floors at wing level if applicable
            if (
              project.commercialUnitPlacement === "wingLevel" &&
              wing.commercialFloors
            ) {
              wing.commercialFloors = wing.commercialFloors
                .map((floor) => ({
                  ...floor,
                  units: floor.units.filter((unit) =>
                    flatStatusFilter.includes(unit.status),
                  ),
                }))
                .filter((floor) => floor.units.length > 0);
            }

            return wing;
          })
          .filter((wing) => {
            const hasResidentialFloors = wing.floors.length > 0;
            const hasCommercialFloors =
              wing.commercialFloors && wing.commercialFloors.length > 0;
            return hasResidentialFloors || hasCommercialFloors;
          });

        return project;
      })
      .filter((project) => {
        const hasWings = project.wings.length > 0;
        const hasCommercialFloors =
          project.commercialUnitPlacement === "projectLevel" &&
          project.commercialFloors &&
          project.commercialFloors.length > 0;

        return hasWings || hasCommercialFloors;
      });
  };

  // Replace the existing projects assignment with this:
  const projects = getFilteredProjectsData();

  // states and variable
  const [formType, setFormType] = useState<"residential" | "commercial">(
    "residential",
  );
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>();
  const DEFAULT_VALUE = {
    project: {
      name: "",
      by: "",
      location: "",
    },
    property: {
      type: (formType == "residential" ? "flat" : "shop") as
        | "flat"
        | "shop"
        | "office",
      wing: "",
      floorNo: "",
      unitNo: "",
    },
    date: new Date(),
    holder: "",
  };

  const [cancellationData, setCancellationData] = useState(DEFAULT_VALUE);

  const showWing =
    formType === "residential" ||
    projects?.find((p) => p.name === cancellationData.project.name)
      ?.commercialUnitPlacement === "wingLevel";

  const projectOptions =
    projects?.map((p) => ({ label: p.name, value: p.name! })) || [];

  const getProjectData = () =>
    projects?.find((p) => p.name === cancellationData.project.name);

  const wingOptions =
    getProjectData()?.wings.map((w) => ({
      label: `Wing ${w.name}`,
      value: w.name,
    })) || [];

  const getFloors = () => {
    const project = getProjectData();
    if (!project) return;

    const isFlat = formType === "residential";
    const isProjectLevel =
      !isFlat && project.commercialUnitPlacement === "projectLevel";
    const wing = project.wings.find(
      (w) => w.name === cancellationData.property.wing,
    );

    return isFlat
      ? wing?.floors
      : isProjectLevel
        ? project.commercialFloors
        : wing?.commercialFloors;
  };

  const floorOptions =
    getFloors()?.map((f) => ({
      label:
        f.displayNumber === 0
          ? "Ground Floor"
          : `${getOrdinal(f.displayNumber)} Floor`,
      value: f.displayNumber.toString(),
    })) || [];

  const getUnits = () => {
    const floors = getFloors();
    const floor = floors?.find(
      (f) => f.displayNumber === Number(cancellationData.property.floorNo),
    );

    return floor?.units.map((u) => ({
      label: `${floor.type === "commercial" ? toProperCase(u.configuration) : "Unit"} ${u.unitNumber}`,
      value: u.unitNumber.toString(),
    }));
  };

  const unitOptions = getUnits() || [];

  // Event Handlers
  const handleFormTypeChange = (type: "residential" | "commercial") => {
    setFormType(type);
    setCancellationData(DEFAULT_VALUE);
  };

  const handleProjectChange = (value: string) => {
    setCancellationData({
      ...cancellationData,
      project: {
        name: value,
        by: getProjectData()?.by || "",
        location: getProjectData()?.location || "",
      },
      property: {
        unitNo: "",
        floorNo: "",
        wing: "",
        type: formType == "residential" ? "flat" : "shop",
      },
    });
  };

  const findUnit = (unitNo: string) => {
    const floors = getFloors();
    const floor = floors?.find(
      (f) => f.displayNumber === Number(cancellationData.property.floorNo),
    );
    return floor?.units.find((u) => u.unitNumber == unitNo);
  };

  const handlePropertyChange = (
    field: keyof typeof cancellationData.property,
    value: string,
  ) => {
    if (field == "unitNo") {
      const unit = findUnit(value);
      setCancellationData({
        ...cancellationData,
        property: {
          ...cancellationData.property,
          unitNo: unit?.unitNumber || value,
          type:
            formType == "residential"
              ? "flat"
              : (unit?.configuration.toLowerCase() as "shop" | "office"),
        },
        holder: unit?.reservedByOrReason || "",
      });
      setSelectedUnit(unit);
      return;
    }

    setCancellationData({
      ...cancellationData,
      property: {
        ...cancellationData.property,
        [field]: value,
        ...(field == "floorNo" && { unitNo: "" }),
        ...(field == "wing" && { floorNo: "", unitNo: "" }),
      },
    });
  };

  const openPdfInNewTab = async (data: typeof cancellationData) => {
    try {
      const blob = await pdf(<CancellationLetter data={data} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.log(error);
      toast({
        title: "PDF Generation Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    const validate = CancellationDataSchema.safeParse(cancellationData);

    if (!validate.success) {
      toast({
        title: "Form Submission Error",
        description: "Please fill all the required fields",
        variant: "warning",
      });
      return;
    }

    try {
      await openPdfInNewTab(cancellationData);
      if (selectedUnit?._id) {
        await updateUnitStatusMutation.mutateAsync({
          unitId: selectedUnit._id!,
          status: "canceled",
        });
      }

      if (selectedUnit?.referenceId) {
        await updateClientBookingMutation.mutateAsync({
          id: selectedUnit.referenceId,
          updateData: { status: "canceled" },
        });
      }
    } catch (error) {
      const err = error as CustomAxiosError;
      console.log(err);
      toast({
        title: "Error Occurred",
        description: err.response?.data.error || err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TicketX className="h-5 w-5" />
          Cancellation Form
        </CardTitle>
        <CardDescription>Enter details to cancel booking</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant={formType === "residential" ? "default" : "outline"}
              onClick={() => handleFormTypeChange("residential")}
            >
              Residential
            </Button>
            <Button
              variant={formType === "commercial" ? "default" : "outline"}
              onClick={() => handleFormTypeChange("commercial")}
            >
              Commercial
            </Button>
          </div>
          <div
            className={`grid grid-cols-1 lg:${showWing ? "grid-cols-5" : "grid-cols-4"} gap-4 lg:gap-1`}
          >
            <FormFieldWrapper className="gap-3" LabelText="Date">
              <DatePickerV2
                defaultDate={cancellationData.date}
                onDateChange={(e) =>
                  setCancellationData((prev) => ({ ...prev, date: e }))
                }
                className="sm:w-full"
              />
            </FormFieldWrapper>
            <FormFieldWrapper
              className="gap-3"
              Important
              ImportantSide="right"
              LabelText="Project"
            >
              <Combobox
                width="w-full"
                align="center"
                value={cancellationData.project.name}
                options={projectOptions}
                onChange={handleProjectChange}
                placeholder="Select Project"
              />
            </FormFieldWrapper>

            {showWing && (
              <FormFieldWrapper
                className="gap-3"
                Important
                ImportantSide="right"
                LabelText="Wing"
              >
                <Combobox
                  width="w-full"
                  align="center"
                  disabled={!cancellationData.project.name}
                  value={cancellationData.property.wing}
                  options={wingOptions}
                  onChange={(e) => handlePropertyChange("wing", e)}
                  placeholder="Select Wing"
                />
              </FormFieldWrapper>
            )}

            <FormFieldWrapper
              className="gap-3"
              Important
              ImportantSide="right"
              LabelText="Floor"
            >
              <Combobox
                width="w-full"
                align="center"
                disabled={
                  formType === "residential"
                    ? !cancellationData.property.wing
                    : projects?.find(
                          (p) => p.name === cancellationData.project.name,
                        )?.commercialUnitPlacement === "projectLevel"
                      ? !cancellationData.project.name
                      : !cancellationData.property.wing
                }
                value={cancellationData.property.floorNo}
                options={floorOptions}
                onChange={(e) => handlePropertyChange("floorNo", e)}
                placeholder="Select Floor"
              />
            </FormFieldWrapper>
            <FormFieldWrapper
              className="gap-3"
              Important
              ImportantSide="right"
              LabelText="Unit"
            >
              <Combobox
                width="w-full"
                align="center"
                value={cancellationData.property.unitNo}
                disabled={!cancellationData.property.floorNo}
                options={unitOptions}
                onChange={(e) => handlePropertyChange("unitNo", e)}
                placeholder="Select Unit"
              />
            </FormFieldWrapper>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSubmit}>Preview PDF</Button>
      </CardFooter>
    </Card>
  );
};
