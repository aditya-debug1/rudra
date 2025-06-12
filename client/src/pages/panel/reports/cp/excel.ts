import { ClientPartnerType, EmployeeType } from "@/store/client-partner";
import { usersSummaryType } from "@/store/users";
import { autoSizeColumns } from "@/utils/func/excel";
import ExcelJS from "exceljs";

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getManagerName = (
  username: string,
  managers: usersSummaryType[] | undefined,
) => {
  if (!managers || !username) return username;
  const manager = managers.find((m) => m.username === username);
  return manager ? manager.firstName + " " + manager.lastName : username;
};

// Function to format company data
function formatCompanyData(
  cp: ClientPartnerType,
  usersSummary: usersSummaryType[],
) {
  return {
    "Created At": formatDateTime(cp.createdAt || ""),
    "Company Name": cp.name,
    "Owner Name": cp.ownerName,
    "Created By": getManagerName(cp.createdBy || "N/A", usersSummary),
    "Company Phone": cp.phoneNo || "N/A",
    "Company Email": cp.email || "N/A",
    "Total Employees": cp.employees.length.toString(),
    "Total Clients": cp.employees
      .reduce((total, emp) => total + (emp.referredClients?.length || 0), 0)
      .toString(),
    Website: cp.companyWebsite || "N/A",
    Address: cp.address || "N/A",
    Notes: cp.notes || "N/A",
  };
}

// Function to format employee data
function formatEmployeeData(employee: EmployeeType, companyName: string) {
  return {
    "Company Name": companyName,
    "Employee Name": `${employee.firstName} ${employee.lastName}`,
    Position: employee.position || "-",
    Email: employee.email || "N/A",
    Phone: employee.phoneNo,
    "Total Clients": employee.referredClients?.length.toString() || "0",
    "Alt Phone": employee.altNo || "N/A",
    "Commission %": employee.commissionPercentage.toString(),
  };
}

export function exportCpToExcel(
  data: ClientPartnerType[],
  usersSummary: usersSummaryType[] | undefined,
): void {
  if (!data || data.length === 0) {
    console.warn("No client partners data to export");
    return;
  }

  // Create workbook
  const workbook = new ExcelJS.Workbook();

  // Format data
  const companyData = data.map((cp) =>
    formatCompanyData(cp, usersSummary || []),
  );

  // Create companies sheet
  const companyWorksheet = workbook.addWorksheet("Companies");

  // Add column headers for companies
  if (companyData.length > 0) {
    const companyHeaders = Object.keys(companyData[0]);
    companyWorksheet.columns = companyHeaders.map((header) => ({
      header: header,
      key: header,
      width: 12, // Default width, will be auto-sized later
    }));

    // Add company data rows
    companyWorksheet.addRows(companyData);

    // Style the header row
    const headerRow = companyWorksheet.getRow(1);
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
    autoSizeColumns(companyWorksheet);
  }

  // Create employees sheet
  const employeeData: ReturnType<typeof formatEmployeeData>[] = [];
  data.forEach((company) => {
    company.employees.forEach((employee) => {
      employeeData.push(formatEmployeeData(employee, company.name));
    });
  });

  if (employeeData.length > 0) {
    const employeeWorksheet = workbook.addWorksheet("Employees");

    // Add column headers for employees
    const employeeHeaders = Object.keys(employeeData[0]);
    employeeWorksheet.columns = employeeHeaders.map((header) => ({
      header: header,
      key: header,
      width: 12, // Default width, will be auto-sized later
    }));

    // Add employee data rows
    employeeWorksheet.addRows(employeeData);

    // Style the header row
    const headerRow = employeeWorksheet.getRow(1);
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
    autoSizeColumns(employeeWorksheet);
  }

  // Save the workbook
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "Client_Partners_and_Employees.xlsx";
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadLink);
  });
}
