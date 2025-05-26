import RobotoBold from "@/fonts/roboto/Roboto-Bold.ttf";
import RobotoBoldItalic from "@/fonts/roboto/Roboto-BoldItalic.ttf";
import RobotoItalic from "@/fonts/roboto/Roboto-Italic.ttf";
import RobotoRegular from "@/fonts/roboto/Roboto-Regular.ttf";
import { FloorType, ProjectType, UnitType, WingType } from "@/store/inventory";
import { getOrdinal } from "@/utils/func/numberUtils";
import { capitalizeWords } from "@/utils/func/strUtils";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import _ from "lodash";
import React, { useMemo } from "react";

// Define status types for better type safety
type UnitStatus = UnitType["status"];

// Status configuration with colors and display names
const STATUS_CONFIG: Record<
  UnitStatus,
  { color: string; displayName: string }
> = {
  available: { color: "#ffffff", displayName: "Available" },
  reserved: { color: "#fff085", displayName: "Reserved" },
  booked: { color: "#ffba00", displayName: "Booked" },
  registered: { color: "#bbf451", displayName: "Registered" },
  canceled: { color: "#fb2c36", displayName: "Canceled" },
  "not-for-sale": { color: "#f5a97f", displayName: "Not For Sale" },
  investor: { color: "#8aadf4", displayName: "Investor" },
  others: { color: "#c4c4c4", displayName: "Others" },
};

// Extract status list from config for consistency
const STATUSES = Object.keys(STATUS_CONFIG) as UnitStatus[];

// Register all fonts at once for better performance
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal", fontStyle: "normal" },
    { src: RobotoBold, fontWeight: "bold", fontStyle: "normal" },
    { src: RobotoItalic, fontWeight: "normal", fontStyle: "italic" },
    { src: RobotoBoldItalic, fontWeight: "bold", fontStyle: "italic" },
  ],
});

// Constants for better maintenance and flexibility
const CONSTANTS = {
  // A4 dimensions
  A4_WIDTH: 595, // Portrait width in points
  A4_HEIGHT: 842, // Portrait height in points
  PAGE_PADDING: 20,
  FLOOR_CELL_WIDTH: 40,
  FLOORS_PER_PAGE_PORTRAIT: 16,
  FLOORS_PER_PAGE_LANDSCAPE: 11, // Less due to shorter page height in landscape
  UNIT_THRESHOLD: 10, // Threshold for switching to landscape
};

// Define PDF styles with improved organization
const styles = StyleSheet.create({
  // Layout
  page: {
    padding: CONSTANTS.PAGE_PADDING,
    backgroundColor: "#ffffff",
    fontFamily: "Roboto",
  },
  footer: {
    position: "absolute",
    bottom: CONSTANTS.PAGE_PADDING,
    left: CONSTANTS.PAGE_PADDING,
    right: CONSTANTS.PAGE_PADDING,
    textAlign: "center",
    fontSize: 8,
  },

  // Typography
  title: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 12,
    textAlign: "center",
  },
  wingTitle: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  continuedText: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 4,
    fontStyle: "italic",
  },

  // Table structure
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    width: "100%",
  },
  tableLastRow: {
    flexDirection: "row",
    width: "100%",
  },

  // Cells
  tableHeaderCell: {
    padding: 3,
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: 8,
  },
  tableCell: {
    padding: 3,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: 8,
  },
  floorCell: {
    width: CONSTANTS.FLOOR_CELL_WIDTH,
    padding: 3,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f3f4f6",
    fontSize: 8,
    fontWeight: "bold",
  },
  unitCell: {
    padding: 3,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  unitAreaText: {
    fontSize: 6,
  },

  // Legend
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 3,
  },
  legendColor: {
    width: 10,
    height: 10,
    marginRight: 3,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
  },
  legendText: {
    fontSize: 8,
  },

  // Backgrounds
  bgLabel: {
    backgroundColor: "#8ec5ff",
  },
  bgCommercial: {
    backgroundColor: "#ffb347", // Orange color for commercial section
  },

  // Commercial header
  commercialHeaderCell: {
    padding: 3,
    backgroundColor: "#ffb347", // Orange color for commercial header
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: 8,
    flex: 1,
  },
});

/**
 * Determine if wing should use landscape orientation
 */
const shouldUseLandscape = (wing: WingType): boolean => {
  // Find the floor with the most units
  const maxUnits = wing.unitsPerFloor;
  return maxUnits > CONSTANTS.UNIT_THRESHOLD;
};

/**
 * Determine if commercial floors should use landscape orientation
 */
const shouldCommercialUseLandscape = (floors: FloorType[]): boolean => {
  // Find the floor with the most units
  const maxUnits = Math.max(...floors.map((floor) => floor.units.length), 0);
  return maxUnits > CONSTANTS.UNIT_THRESHOLD;
};

/**
 * Calculate optimal column widths for commercial floors
 */
const useCommercialColumnWidths = (
  floors: FloorType[],
  isLandscape: boolean,
) => {
  return useMemo(() => {
    // Calculate available width for units based on orientation
    const pageWidth = isLandscape ? CONSTANTS.A4_HEIGHT : CONSTANTS.A4_WIDTH;
    const totalPageWidth = pageWidth - CONSTANTS.PAGE_PADDING * 2;
    const availableWidthForUnits = totalPageWidth - CONSTANTS.FLOOR_CELL_WIDTH;

    return {
      floorCellWidth: CONSTANTS.FLOOR_CELL_WIDTH,
      getUnitWidth: (_: number, floorIndex: number) => {
        const floor = floors[floorIndex];
        const totalUnits = floor.units.length;
        // Equal distribution for all units on this floor
        return availableWidthForUnits / totalUnits;
      },
      totalUnitWidth: availableWidthForUnits,
    };
  }, [floors, isLandscape]);
};

/**
 * Calculate optimal column widths for a wing based on orientation
 */
const useColumnWidths = (wing: WingType, isLandscape: boolean) => {
  return useMemo(() => {
    // Calculate available width for units based on orientation
    const pageWidth = isLandscape ? CONSTANTS.A4_HEIGHT : CONSTANTS.A4_WIDTH;
    const totalPageWidth = pageWidth - CONSTANTS.PAGE_PADDING * 2;
    const availableWidthForUnits = totalPageWidth - CONSTANTS.FLOOR_CELL_WIDTH;

    // Get the header floor to use for calculating column widths
    const headerFloor = wing.floors.find(
      (_floor, index) => index === wing.headerFloorIndex,
    );

    if (!headerFloor) {
      // If no header floor is found, provide a uniform width
      const unitCellWidth =
        availableWidthForUnits / Math.max(wing.unitsPerFloor, 1);
      return {
        floorCellWidth: CONSTANTS.FLOOR_CELL_WIDTH,
        getUnitWidth: (unitSpan: number) => unitCellWidth * unitSpan,
        totalUnitWidth: availableWidthForUnits,
      };
    }

    // Calculate total span values for proportional widths
    const totalSpans = headerFloor.units.reduce(
      (total, unit) => total + unit.unitSpan,
      0,
    );

    // Calculate base unit width (each span point gets equal portion of available width)
    const baseUnitWidth = availableWidthForUnits / Math.max(totalSpans, 1);

    return {
      floorCellWidth: CONSTANTS.FLOOR_CELL_WIDTH,
      getUnitWidth: (unitSpan: number) => baseUnitWidth * unitSpan,
      totalUnitWidth: availableWidthForUnits,
    };
  }, [wing, isLandscape]);
};

/**
 * Project Header Component
 */
const ProjectHeader: React.FC<{ project: ProjectType }> = ({ project }) => (
  <>
    <Text style={styles.title}>{project.name} - Availability Chart</Text>
    <Text style={styles.subtitle}>Project by: {project.by.toUpperCase()}</Text>

    {/* Legend with status colors */}
    <View style={styles.legend}>
      {STATUSES.map((status, index) => (
        <View key={index} style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: STATUS_CONFIG[status].color },
            ]}
          />
          <Text style={styles.legendText}>
            {STATUS_CONFIG[status].displayName}
          </Text>
        </View>
      ))}
    </View>
  </>
);

/**
 * Commercial Floor Row Component
 */
const CommercialFloorRow: React.FC<{
  floor: FloorType;
  floorCellWidth: number;
  getUnitWidth: (unitIndex: number, floorIndex: number) => number;
  isLastRow?: boolean;
  floorIndex: number;
}> = ({
  floor,
  floorCellWidth,
  getUnitWidth,
  isLastRow = false,
  floorIndex,
}) => (
  <View style={isLastRow ? styles.tableLastRow : styles.tableRow}>
    {/* Floor Number Cell */}
    <View
      style={[styles.floorCell, styles.bgCommercial, { width: floorCellWidth }]}
    >
      <Text>
        {floor.displayNumber === 0 ? "Ground" : getOrdinal(floor.displayNumber)}
      </Text>
    </View>

    {/* Unit Cells */}
    {floor.units.map((unit, unitIndex) => (
      <View
        key={unitIndex}
        style={[
          styles.unitCell,
          {
            backgroundColor: STATUS_CONFIG[unit.status]?.color || "#ffffff",
            width: getUnitWidth(unitIndex, floorIndex),
          },
        ]}
      >
        <Text>{unit.unitNumber}</Text>
        {floor.showArea && unit.area && <Text>{unit.area} sqft</Text>}
        {unit.configuration && unit.configuration !== "terrace" && (
          <Text>{unit.configuration.toUpperCase()}</Text>
        )}
        {unit.reservedByOrReason && (
          <Text>{capitalizeWords(unit.reservedByOrReason.toLowerCase())}</Text>
        )}
      </View>
    ))}
  </View>
);

/**
 * Project-level Commercial Section Component
 */
const ProjectCommercialSection: React.FC<{
  commercialFloors: FloorType[];
  isLandscape: boolean;
}> = ({ commercialFloors, isLandscape }) => {
  // Sort commercial floors by display number
  const sortedCommercialFloors = _.orderBy(
    commercialFloors,
    ["displayNumber"],
    ["asc"],
  );

  const { floorCellWidth, getUnitWidth, totalUnitWidth } =
    useCommercialColumnWidths(sortedCommercialFloors, isLandscape);

  return (
    <>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {/* Floor Label Cell */}
          <View
            style={[
              styles.tableHeaderCell,
              styles.bgCommercial,
              {
                width: floorCellWidth,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text style={{ fontSize: 10 }}>Floor</Text>
          </View>

          {/* Commercial Header that spans all units */}
          <View
            style={[styles.commercialHeaderCell, { width: totalUnitWidth }]}
          >
            {/* <Text>Commercial Units</Text> */}
            <Text
              style={[
                styles.wingTitle,
                { fontSize: 10, marginTop: 6, marginBottom: 6 },
              ]}
            >
              Project Commercial Units
            </Text>
          </View>
        </View>

        {/* Each floor gets its own header since units may vary */}
        {sortedCommercialFloors.map((floor, floorIndex) => (
          <React.Fragment key={`commercial-floor-${floorIndex}`}>
            {/* Floor row */}
            <CommercialFloorRow
              floor={floor}
              floorCellWidth={floorCellWidth}
              getUnitWidth={getUnitWidth}
              isLastRow={floorIndex === sortedCommercialFloors.length - 1}
              floorIndex={floorIndex}
            />
          </React.Fragment>
        ))}
      </View>
    </>
  );
};

/**
 * Commercial Header Component
 */
const CommercialHeader: React.FC<{
  floorCellWidth: number;
  totalWidth: number;
}> = ({ floorCellWidth, totalWidth }) => (
  <View style={styles.tableRow}>
    {/* Floor Label Cell */}
    <View
      style={[
        styles.tableHeaderCell,
        styles.bgCommercial,
        { width: floorCellWidth },
      ]}
    >
      <Text>Floor</Text>
    </View>

    {/* Commercial Header that spans all units */}
    <View style={[styles.commercialHeaderCell, { width: totalWidth }]}>
      <Text>Commercial Floors</Text>
    </View>
  </View>
);

/**
 * Table Header Component
 */
const TableHeader: React.FC<{
  wing: WingType;
  floorCellWidth: number;
  getUnitWidth: (unitSpan: number) => number;
  totalUnitWidth: number;
  isCommercial?: boolean;
}> = ({
  wing,
  floorCellWidth,
  getUnitWidth,
  totalUnitWidth,
  isCommercial = false,
}) => {
  // Find the header floor that contains the configuration information
  const headerFloor = wing.floors.find(
    (_floor, index) => index === wing.headerFloorIndex,
  );

  // For commercial floors, render a special commercial header
  if (isCommercial) {
    return (
      <CommercialHeader
        floorCellWidth={floorCellWidth}
        totalWidth={totalUnitWidth}
      />
    );
  }

  // Regular residential header
  return (
    <View style={styles.tableRow}>
      {/* Floor Label Cell */}
      <View
        style={[
          styles.tableHeaderCell,
          styles.bgLabel,
          { width: floorCellWidth },
        ]}
      >
        <Text>Floor</Text>
      </View>

      {/* Unit Configuration Cells */}
      {headerFloor
        ? // Use header floor units as column headers
          headerFloor.units.map((unit, index) => (
            <View
              key={index}
              style={[
                styles.tableHeaderCell,
                styles.bgLabel,
                { width: getUnitWidth(unit.unitSpan) },
              ]}
            >
              <Text>{unit.configuration.toUpperCase()}</Text>
              {unit.area && (
                <Text style={styles.unitAreaText}>{unit.area} sqft</Text>
              )}
            </View>
          ))
        : // Fallback if no header floor is found
          Array(wing.unitsPerFloor)
            .fill(0)
            .map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tableHeaderCell,
                  styles.bgLabel,
                  { width: getUnitWidth(1) },
                ]}
              >
                <Text>Unit {i + 1}</Text>
              </View>
            ))}
    </View>
  );
};

/**
 * Floor Row Component
 */
const FloorRow: React.FC<{
  floor: FloorType;
  floorCellWidth: number;
  getUnitWidth: (unitSpan: number) => number;
  isLastRow?: boolean;
  isCommercial?: boolean;
}> = ({
  floor,
  floorCellWidth,
  getUnitWidth,
  isLastRow = false,
  isCommercial = false,
}) => (
  <View style={isLastRow ? styles.tableLastRow : styles.tableRow}>
    {/* Floor Number Cell */}
    <View
      style={[
        styles.floorCell,
        isCommercial ? styles.bgCommercial : styles.bgLabel,
        { width: floorCellWidth },
      ]}
    >
      <Text>
        {floor.displayNumber === 0 ? "Ground" : getOrdinal(floor.displayNumber)}
      </Text>
    </View>

    {/* Unit Cells */}
    {floor.units.map((unit, index) => {
      const addPadding = !unit.reservedByOrReason && !floor.showArea;
      return (
        <View
          key={index}
          style={[
            styles.unitCell,
            {
              backgroundColor: STATUS_CONFIG[unit.status]?.color || "#ffffff",
              width: getUnitWidth(unit.unitSpan),
            },
            addPadding ? { paddingTop: 8, paddingBottom: 8 } : {},
          ]}
        >
          <Text>{unit.unitNumber}</Text>
          {floor.showArea && unit.status !== "others" && unit.area && (
            <Text>{unit.area} sqft</Text>
          )}
          {floor.showArea && unit.status !== "others" && unit.configuration && (
            <Text>{unit.configuration.toUpperCase()}</Text>
          )}
          {unit.reservedByOrReason && (
            <Text>
              {capitalizeWords(unit.reservedByOrReason.toLowerCase())}
            </Text>
          )}
        </View>
      );
    })}
  </View>
);

/**
 * Commercial Section Component
 */
const CommercialSection: React.FC<{
  wing: WingType;
  floorCellWidth: number;
  getUnitWidth: (unitSpan: number) => number;
  totalUnitWidth: number;
}> = ({ wing, floorCellWidth, getUnitWidth, totalUnitWidth }) => {
  // Check if there are commercial floors
  if (!wing.commercialFloors || wing.commercialFloors.length === 0) {
    return null;
  }

  // Sort commercial floors by display number
  const sortedCommercialFloors = _.orderBy(
    wing.commercialFloors,
    ["displayNumber"],
    ["asc"],
  );

  return (
    <>
      <Text style={styles.sectionTitle}>Commercial Units</Text>
      <View style={styles.table}>
        {/* Commercial Header */}
        <TableHeader
          wing={wing}
          floorCellWidth={floorCellWidth}
          getUnitWidth={getUnitWidth}
          totalUnitWidth={totalUnitWidth}
          isCommercial={true}
        />

        {/* Commercial Floor Rows */}
        {sortedCommercialFloors.map((floor, index) => (
          <FloorRow
            key={index}
            floor={floor}
            floorCellWidth={floorCellWidth}
            getUnitWidth={getUnitWidth}
            isLastRow={index === sortedCommercialFloors.length - 1}
            isCommercial={true}
          />
        ))}
      </View>
    </>
  );
};

/**
 * Residential Section Component
 */
const ResidentialSection: React.FC<{
  wing: WingType;
  floorCellWidth: number;
  getUnitWidth: (unitSpan: number) => number;
  totalUnitWidth: number;
  pageFloors: FloorType[];
}> = ({ wing, floorCellWidth, getUnitWidth, totalUnitWidth, pageFloors }) => {
  if (pageFloors.length === 0) {
    return null;
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Residential Units</Text>
      <View style={styles.table}>
        {/* Residential Header */}
        <TableHeader
          wing={wing}
          floorCellWidth={floorCellWidth}
          getUnitWidth={getUnitWidth}
          totalUnitWidth={totalUnitWidth}
          isCommercial={false}
        />

        {/* Residential Floor Rows */}
        {pageFloors.map((floor, index) => (
          <FloorRow
            key={index}
            floor={floor}
            floorCellWidth={floorCellWidth}
            getUnitWidth={getUnitWidth}
            isLastRow={index === pageFloors.length - 1}
            isCommercial={false}
          />
        ))}
      </View>
    </>
  );
};

/**
 * Project Commercial Page Component
 */
const ProjectCommercialPage: React.FC<{
  project: ProjectType;
  isLandscape: boolean;
}> = ({ project, isLandscape }) => {
  return (
    <Page
      size="A4"
      orientation={isLandscape ? "landscape" : "portrait"}
      style={styles.page}
    >
      {/* Project Header */}
      <ProjectHeader project={project} />

      {/* Commercial Section */}
      <ProjectCommercialSection
        commercialFloors={project.commercialFloors || []}
        isLandscape={isLandscape}
      />

      {/* Footer */}
      <Text style={styles.footer}>
        Generated on{" "}
        {new Date().toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
      </Text>
    </Page>
  );
};

/**
 * Wing Page Component
 */
const WingPage: React.FC<{
  project: ProjectType;
  wing: WingType;
  pageIndex: number;
  pageFloors: WingType["floors"];
  showCommercial: boolean;
  totalPages: number;
  isLandscape: boolean;
}> = ({
  project,
  wing,
  pageIndex,
  pageFloors,
  showCommercial,
  totalPages,
  isLandscape,
}) => {
  const { floorCellWidth, getUnitWidth, totalUnitWidth } = useColumnWidths(
    wing,
    isLandscape,
  );

  return (
    <Page
      key={`${wing._id}-page-${pageIndex}`}
      size="A4"
      orientation={isLandscape ? "landscape" : "portrait"}
      style={styles.page}
    >
      {/* Show header on first page of wing */}
      {pageIndex === 0 && <ProjectHeader project={project} />}

      {/* Wing Title with continuation indication */}
      {pageIndex === 0 ? (
        <Text style={styles.wingTitle}>Wing {wing.name}</Text>
      ) : (
        <Text style={styles.continuedText}>{wing.name} (continued)</Text>
      )}

      {/* Commercial Section (only on first page if showCommercial is true) */}
      {pageIndex === 0 &&
        showCommercial &&
        project.commercialUnitPlacement === "wingLevel" && (
          <CommercialSection
            wing={wing}
            floorCellWidth={floorCellWidth}
            getUnitWidth={getUnitWidth}
            totalUnitWidth={totalUnitWidth}
          />
        )}

      {/* Residential Section */}
      {pageFloors.length > 0 && (
        <ResidentialSection
          wing={wing}
          floorCellWidth={floorCellWidth}
          getUnitWidth={getUnitWidth}
          totalUnitWidth={totalUnitWidth}
          pageFloors={pageFloors}
        />
      )}

      {/* Page indicator for multi-page wings */}
      {totalPages > 1 && (
        <Text style={styles.footer}>
          Page {pageIndex + 1} of {totalPages} | Generated on{" "}
          {new Date().toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </Text>
      )}

      {/* Single page footer */}
      {totalPages === 1 && (
        <Text style={styles.footer}>
          Generated on{" "}
          {new Date().toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </Text>
      )}
    </Page>
  );
};

/**
 * Main AvailabilityPDF Component
 */
export const AvailabilityPDF: React.FC<{ project: ProjectType }> = ({
  project,
}) => {
  // Check if project has commercial units at project level
  const hasProjectCommercialUnits =
    project.commercialUnitPlacement === "projectLevel" &&
    project.commercialFloors &&
    project.commercialFloors.length > 0;

  // Determine orientation for project commercial section
  const isProjectCommercialLandscape =
    hasProjectCommercialUnits &&
    shouldCommercialUseLandscape(project.commercialFloors || []);

  return (
    <Document>
      {/* Project-level Commercial Units (displayed before any wings) */}
      {hasProjectCommercialUnits && (
        <ProjectCommercialPage
          project={project}
          isLandscape={isProjectCommercialLandscape || false}
        />
      )}

      {/* Process each wing */}
      {project.wings.map((wing, i) => {
        // Determine orientation based on number of units
        const isLandscape = shouldUseLandscape(wing);

        // Sort floors by display number in ascending order (residential floors only)
        const sortedFloors = _.orderBy(wing.floors, ["displayNumber"], ["asc"]);

        // Check if wing has commercial floors (only for wingLevel placement)
        const hasCommercialFloors =
          project.commercialUnitPlacement === "wingLevel" &&
          wing.commercialFloors &&
          wing.commercialFloors.length > 0;

        // Calculate floors per page based on orientation
        const floorsPerPage = isLandscape
          ? CONSTANTS.FLOORS_PER_PAGE_LANDSCAPE
          : CONSTANTS.FLOORS_PER_PAGE_PORTRAIT;

        // Calculate pages needed for this wing's residential floors
        const totalPages = Math.ceil(sortedFloors.length / floorsPerPage);

        // Create pages for this wing
        return Array.from({ length: totalPages }).map((_, pageIndex) => {
          // Calculate floor range for this page
          const startFloorIndex = pageIndex * floorsPerPage;
          const endFloorIndex = Math.min(
            startFloorIndex + floorsPerPage,
            sortedFloors.length,
          );

          // Get floors for this page
          const pageFloors = sortedFloors.slice(startFloorIndex, endFloorIndex);

          return (
            <WingPage
              key={`${i}-page-${pageIndex}`}
              project={project}
              wing={wing}
              pageIndex={pageIndex}
              pageFloors={pageFloors}
              showCommercial={hasCommercialFloors || false}
              totalPages={totalPages}
              isLandscape={isLandscape}
            />
          );
        });
      })}
    </Document>
  );
};
