import { ComboboxOption } from "@/components/custom ui/combobox";
import { ClientType } from "@/store/client";
import { RefernceListType } from "@/store/client-partner";
import { usersSummaryType } from "@/store/users";
import {
  getLabelFromValue,
  getSafeLabelFromValue,
} from "@/utils/func/arrayUtils";
import { autoSizeColumns } from "@/utils/func/excel";
import { capitalizeWords, toProperCase } from "@/utils/func/strUtils";
import ExcelJS from "exceljs";

// Helper function to get a reference's full name
const getReferenceName = (
  refId: string,
  references: RefernceListType[] | undefined,
): string => {
  if (!references || !refId) return refId;
  const reference = references.find((r) => r._id === refId);
  return reference ? `${reference.companyName}` : refId;
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

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Clients");

  // Get headers from the first data item
  const headers = Object.keys(formattedData[0]);

  // Add columns with headers
  worksheet.columns = headers.map((header) => ({
    header: header,
    key: header,
    width: 12, // Default width, will be auto-sized later
  }));

  // Add rows
  worksheet.addRows(formattedData);

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" }, // White text
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" }, // Blue background
    };
    cell.alignment = { horizontal: "center" };
  });

  // Auto size columns
  autoSizeColumns(worksheet);

  // Save workbook
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "Client_Report.xlsx";
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadLink);
  });
}
