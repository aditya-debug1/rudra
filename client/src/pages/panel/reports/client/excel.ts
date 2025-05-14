import { ComboboxOption } from "@/components/custom ui/combobox";
import { ClientType } from "@/store/client";
import { RefernceListType } from "@/store/client-partner";
import { usersSummaryType } from "@/store/users";
import {
  getLabelFromValue,
  getSafeLabelFromValue,
} from "@/utils/func/arrayUtils";
import { autosizeColumns } from "@/utils/func/excel";
import { capitalizeWords, toProperCase } from "@/utils/func/strUtils";
import * as XLSX from "xlsx";

// Helper function to get a reference's full name
const getReferenceName = (
  refId: string,
  references: RefernceListType[] | undefined,
): string => {
  if (!references || !refId) return refId;
  const reference = references.find((r) => r._id === refId);
  return reference ? `${reference.firstName} ${reference.lastName}` : refId;
};

// Helper function to get a manager's full name
const getManagerName = (
  username: string,
  managers: usersSummaryType[] | undefined,
): string => {
  if (!managers || !username) return username;
  const manager = managers.find((m) => m.username === username);
  return manager ? `${manager.firstName} ${manager.lastName}` : username;
};

// Format the client data for export
const formatClientData = (client: ClientType, lists: ExportLists) => {
  const lastVisit = client.visits[0];
  return {
    Date: new Date(lastVisit.date).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    Name: `${client.firstName} ${client.lastName}`,
    Contact: client.phoneNo,
    "Alt Contact": client.altNo || "-",
    Requirement: getLabelFromValue(lists.requirementList, client.requirement),
    Budget: `₹${client.budget}`,
    Project: getSafeLabelFromValue(lists.projectList, client.project),
    Reference: capitalizeWords(
      getReferenceName(lastVisit.reference, lists.referenceList).toLowerCase(),
    ),
    Sourcing: getManagerName(lastVisit.source, lists.managerList),
    Relationship: getManagerName(lastVisit.relation, lists.managerList),
    Closing: getManagerName(lastVisit.closing, lists.managerList),
    Status: toProperCase(lastVisit.status || ""),
  };
};

// Define the export lists interface
interface ExportLists {
  requirementList: ComboboxOption[];
  projectList: ComboboxOption[];
  managerList: usersSummaryType[];
  referenceList: RefernceListType[];
}

// Export client data to Excel file
export function exportClientToExcel(
  data: ClientType[],
  lists: ExportLists,
): void {
  if (!data || data.length === 0) {
    console.warn("No client data to export");
    return;
  }

  const formattedData = data.map((client) => formatClientData(client, lists));
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Add autosize to columns
  autosizeColumns(worksheet);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

  // Apply styling to header row - now with a different color
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[headerCell]) continue;

    if (!worksheet[headerCell].s) worksheet[headerCell].s = {};
    worksheet[headerCell].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } }, // White text
      fill: { fgColor: { rgb: "4472C4" } }, // Blue background
      alignment: { horizontal: "center" },
    };
  }

  XLSX.writeFile(workbook, "Client_Report.xlsx");
}
