import {
  FloorType,
  ProjectType,
  unitStatus,
  UnitType,
  WingType,
} from "@/store/inventory";

// Constants
export const STATUS_COLORS: Record<
  Exclude<unitStatus, "not-for-sale">,
  string
> = {
  available: "#ffffff", // White
  reserved: "#a6da95", // Muted Green
  booked: "#ffba00", // Yellow
  registered: "#bbf451", // Light Green
  canceled: "#fb2c36", // Red
  investor: "#8aadf4", // Light Blue
};

export const ALL_UNIT_STATUSES: Array<Exclude<unitStatus, "not-for-sale">> = [
  "available",
  "reserved",
  "booked",
  "registered",
  "canceled",
  "investor",
];

// Helper functions
export const getStatusColor = (
  status: Exclude<unitStatus, "not-for-sale">,
): string => STATUS_COLORS[status] || "#64748B";

export const collectAllUnits = (project: ProjectType): UnitType[] => {
  const allUnits: UnitType[] = [];

  // Units from wings
  project.wings.forEach((wing: WingType) => {
    // Residential floors
    allUnits.push(...wing.floors.flatMap((floor) => floor.units));

    // Wing-level commercial floors
    if (wing.commercialFloors?.length) {
      allUnits.push(...wing.commercialFloors.flatMap((floor) => floor.units));
    }
  });

  // Project-level commercial floors
  if (project.commercialFloors?.length) {
    allUnits.push(
      ...project.commercialFloors.flatMap((floor: FloorType) => floor.units),
    );
  }

  // Filter out "not-for-sale" units
  return allUnits.filter((unit) => unit.status !== "not-for-sale");
};

export const calculateStatusCounts = (
  units: UnitType[],
): Record<Exclude<unitStatus, "not-for-sale">, number> => {
  const counts: Partial<Record<Exclude<unitStatus, "not-for-sale">, number>> =
    {};

  ALL_UNIT_STATUSES.forEach((status) => {
    counts[status] = units.filter(
      (unit: UnitType) => unit.status === status,
    ).length;
  });

  return counts as Record<Exclude<unitStatus, "not-for-sale">, number>;
};

export const calculatePercentages = (
  counts: Record<Exclude<unitStatus, "not-for-sale">, number>,
  total: number,
): Record<Exclude<unitStatus, "not-for-sale">, string> => {
  const percentages: Partial<
    Record<Exclude<unitStatus, "not-for-sale">, string>
  > = {};

  ALL_UNIT_STATUSES.forEach((status) => {
    percentages[status] =
      total > 0 ? ((counts[status] / total) * 100).toFixed(1) + "%" : "0%";
  });

  return percentages as Record<Exclude<unitStatus, "not-for-sale">, string>;
};
