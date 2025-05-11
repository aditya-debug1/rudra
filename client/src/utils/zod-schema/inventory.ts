import { z } from "zod";

// UnitStatus enum schema
const unitStatusSchema = z.enum([
  "reserved",
  "available",
  "booked",
  "registered",
  "canceled",
  "investor",
  "not-for-sale",
]);

// Project status enum schema
const projectStatusSchema = z.enum([
  "planning",
  "under-construction",
  "completed",
]);

// Floor type enum schema
const floorTypeSchema = z.enum(["residential", "commercial"]);

// Commercial unit placement enum schema
const commercialUnitPlacementSchema = z.enum(["projectLevel", "wingLevel"]);

// Unit schema
const unitSchema = z.object({
  _id: z.string().optional(),
  floorId: z.string().optional(),
  unitNumber: z.string().min(1, "Unit number is required."),
  area: z.number().min(1, "Area is required"),
  configuration: z.string().min(1, "Configuration is required."),
  unitSpan: z.number().int().positive().default(1),
  status: unitStatusSchema,
  reservedByOrReason: z.string().optional(),
  referenceId: z.string().optional(),
});

// Floor schema
const floorSchema = z.object({
  _id: z.string().optional(),
  wingId: z.string().optional(),
  projectId: z.string().optional(),
  type: floorTypeSchema,
  displayNumber: z.number().int(),
  showArea: z.boolean().default(false),
  units: z.array(unitSchema).min(1, "Atleast 1 unit per floor is required."),
});

// Wing schema with custom validation for unitSpan
const wingSchema = z
  .object({
    _id: z.string().optional(),
    projectId: z.string().optional(),
    name: z.string().min(1, "Wing name is required."),
    commercialFloors: z.array(floorSchema).optional(),
    floors: z.array(floorSchema).min(1, "Floors are required in a wing."),
    unitsPerFloor: z
      .number()
      .int()
      .positive()
      .min(1, "Atleast 1 unit per floor is required."),
    headerFloorIndex: z.number().int().nonnegative(),
  })
  .superRefine((wing, ctx) => {
    // Check each floor's units to ensure total unitSpan equals or doesn't exceed maxUnitsPerFloor
    wing.floors.forEach((floor, floorIndex) => {
      const totalUnitSpan = floor.units.reduce(
        (total, unit) => total + unit.unitSpan,
        0,
      );

      if (totalUnitSpan !== wing.unitsPerFloor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `In Wing "${wing.name}" floor ${floorIndex + 1} has a total unit span of ${totalUnitSpan}, but unitsPerFloor is ${wing.unitsPerFloor}. The total unit span must be exactly equal to unitsPerFloor - not more, not less.`,
          path: ["floors", floorIndex, "units"],
        });
      }
    });
  });

// Project schema with validation for commercialUnitPlacement
const projectSchema = z
  .object({
    _id: z.string().optional(),
    name: z.string().min(1, "Project name is required"),
    by: z.string().min(1, "Project by is required"),
    location: z.string().min(1, "Project location is required"),
    description: z.string(),
    startDate: z.string(),
    completionDate: z.string().optional(),
    status: projectStatusSchema,
    commercialUnitPlacement: commercialUnitPlacementSchema,
    wings: z
      .array(wingSchema)
      .min(1, "Atleast 1 wing is required in a project"),
    commercialFloors: z.array(floorSchema).optional(),
  })
  .superRefine((project, ctx) => {
    // If commercialUnitPlacement is wingLevel, validate each wing's commercial floors
    if (project.commercialUnitPlacement === "wingLevel") {
      project.wings.forEach((wing, wingIndex) => {
        if (wing.commercialFloors) {
          wing.commercialFloors.forEach((floor, floorIndex) => {
            const totalUnitSpan = floor.units.reduce(
              (total, unit) => total + unit.unitSpan,
              0,
            );

            if (totalUnitSpan !== wing.unitsPerFloor) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `In Wing "${wing.name}" commercial floor ${floorIndex + 1} has a total unit span of ${totalUnitSpan}, but unitsPerFloor is ${wing.unitsPerFloor}. The total unit span must be exactly equal to unitsPerFloor.`,
                path: [
                  "wings",
                  wingIndex,
                  "commercialFloors",
                  floorIndex,
                  "units",
                ],
              });
            }
          });
        }
      });
    }
  });

export {
  commercialUnitPlacementSchema,
  floorSchema,
  floorTypeSchema,
  projectSchema,
  projectStatusSchema,
  unitSchema,
  unitStatusSchema,
  wingSchema,
};
