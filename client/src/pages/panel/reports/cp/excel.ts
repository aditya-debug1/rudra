import { ClientPartnerType, EmployeeType } from "@/store/client-partner";
import { autosizeColumns } from "@/utils/func/excel";
import * as XLSX from "xlsx";

// Function to format company data
function formatCompanyData(cp: ClientPartnerType) {
  return {
    "Company Name": cp.name,
    "Owner Name": cp.ownerName,
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
    "Total Clients": employee.referredClients?.length.toString() || 0,
    "Alt Phone": employee.altNo || "N/A",
    "Commission %": employee.commissionPercentage.toString(),
  };
}

export function exportCpToExcel(data: ClientPartnerType[]): void {
  if (!data || data.length === 0) {
    console.warn("No client partners data to export");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Create companies sheet
  const companyData = data.map((cp) => formatCompanyData(cp));
  const companyWorksheet = XLSX.utils.json_to_sheet(companyData);

  // Apply styling to headers and autosize columns
  autosizeColumns(companyWorksheet);

  XLSX.utils.book_append_sheet(workbook, companyWorksheet, "Companies");

  // Create employees sheet
  const employeeData: ReturnType<typeof formatEmployeeData>[] = [];
  data.forEach((company) => {
    company.employees.forEach((employee) => {
      employeeData.push(formatEmployeeData(employee, company.name));
    });
  });

  if (employeeData.length > 0) {
    const employeeWorksheet = XLSX.utils.json_to_sheet(employeeData);

    // Apply styling to headers and autosize columns
    autosizeColumns(employeeWorksheet);

    XLSX.utils.book_append_sheet(workbook, employeeWorksheet, "Employees");
  }

  // Save the workbook
  XLSX.writeFile(workbook, "Client_Partners_and_Employees.xlsx");
}
