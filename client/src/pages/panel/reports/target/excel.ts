// salesManagerExcel.ts
import { SalesManagerStats } from "@/store/target";
import { usersSummaryType } from "@/store/users";
import ExcelJS from "exceljs";
import { DateRange } from "react-day-picker";

function romanToInt(roman: string): number {
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  let prev = 0;

  for (let i = roman.length - 1; i >= 0; i--) {
    const current = romanMap[roman[i].toUpperCase()];
    if (current < prev) {
      total -= current;
    } else {
      total += current;
    }
    prev = current;
  }

  return total;
}

function shortenProjectName(name: string): string {
  const parts = name.split(" ");
  let shortened = "";

  for (const part of parts) {
    // Handle parts in parentheses like "(Anantaa)"
    if (part.includes("(") && part.includes(")")) {
      const openIdx = part.indexOf("(");
      const closeIdx = part.indexOf(")");
      const mainPart = part.substring(0, openIdx);
      const parenthesized = part.substring(openIdx + 1, closeIdx);

      if (mainPart) shortened += mainPart[0];
      if (parenthesized) shortened += `(${parenthesized[0]})`;
    }
    // Handle Roman numerals
    else if (/^[IVXLCDM]+$/i.test(part)) {
      shortened += romanToInt(part);
    }
    // Handle numeric parts
    else if (/[0-9]/.test(part)) {
      shortened += part;
    }
    // Handle normal name parts
    else if (part.length > 0) {
      shortened += part[0];
    }
  }

  return shortened;
}

const getManagerName = (
  username: string,
  managers: usersSummaryType[] | undefined,
) => {
  if (!managers || !username) return username;
  const manager = managers.find((m) => m.username === username);
  return manager ? manager.firstName + " " + manager.lastName : username;
};

const formatDateRange = (dateRange: DateRange | undefined): string => {
  if (!dateRange?.from) return "";
  const fromStr = dateRange.from.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const toStr =
    dateRange.to?.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }) || fromStr;
  return `${fromStr} - ${toStr}`;
};

export function exportSalesManagerToExcel(
  data: SalesManagerStats[],
  allProjects: string[],
  managers: usersSummaryType[] | undefined,
  dateRange: DateRange | undefined,
): void {
  if (!data || data.length === 0) {
    console.warn("No sales manager data to export");
    return;
  }

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Report");

  // Define header keys (for data mapping) and display names (for showing in Excel)
  const headerKeys = [
    "Sales Manager",
    "Visits",
    "Bookings",
    "Canceled",
    "Registerations",
    ...allProjects,
  ];

  const headerDisplayNames = [
    "Sales Manager",
    "Visits",
    "Bookings",
    "Canceled",
    "Registerations",
    ...allProjects.map((project) => shortenProjectName(project)),
  ];

  // Set up columns with fixed widths instead of auto-sizing
  worksheet.columns = headerKeys.map((key, index) => {
    let width = 15; // default width

    // Adjust width based on column type
    if (index === 0)
      width = 20; // Sales Manager column - wider for names
    else if (index <= 4)
      width = 16; // Numeric columns - smaller
    else width = 8; // Project columns - compact due to shortened names

    return {
      key: key,
      width: width,
    };
  });

  // Add title and date range
  const titleRow = worksheet.addRow([]);
  titleRow.getCell(1).value = "Sales Report";
  titleRow.font = { bold: true, size: 16 };
  titleRow.height = 24;
  worksheet.mergeCells(
    `A1:${String.fromCharCode(65 + headerKeys.length - 1)}1`,
  );
  titleRow.alignment = { horizontal: "center", vertical: "middle" };

  const dateRangeRow = worksheet.addRow([]);
  dateRangeRow.getCell(1).value = `Date Range: ${formatDateRange(dateRange)}`;
  dateRangeRow.font = { italic: true };
  worksheet.mergeCells(
    `A2:${String.fromCharCode(65 + headerKeys.length - 1)}2`,
  );
  dateRangeRow.alignment = { horizontal: "center", vertical: "middle" };

  // Add empty row for spacing
  worksheet.addRow([]);

  // Add headers row with display names
  const headerRow = worksheet.addRow(headerDisplayNames);

  // Format and add data rows
  data.forEach((manager) => {
    const rowData: Record<string, string | number> = {
      "Sales Manager": getManagerName(manager.salesManager, managers),
      Visits: manager.totalVisits,
      Bookings: manager.totalBookings,
      Canceled: manager.canceledBookings,
      Registerations: manager.totalRegisterations,
    };

    // Add project stats using original project names as keys
    allProjects.forEach((projectName) => {
      const projectStat = manager.projects.find(
        (p) => p.projectName === projectName,
      );
      rowData[projectName] = projectStat ? projectStat.bookings : 0;
    });

    worksheet.addRow(rowData);
  });

  // Style the header row
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  // Style the data rows (starting from row 5)
  for (let i = 5; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    row.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      if (i % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8F9FA" },
        };
      }
    });
  }

  // Add borders to all data cells
  for (let i = 4; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  // Save workbook
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `Sales_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadLink);
  });
}
