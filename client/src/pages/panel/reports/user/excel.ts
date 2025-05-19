import { userType } from "@/store/users";
import { autoSizeColumns } from "@/utils/func/excel";
import ExcelJS from "exceljs";

function formatUserData(user: userType) {
  return {
    Name: user.firstName + " " + user.lastName,
    Username: user.username,
    "Phone No": user.phone || "N/A",
    Email: user.email || "N/A",
    DOB: user.dob
      ? new Date(user.dob)
          .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(",", "")
      : "N/A",
    Roles: user.roles.join(", "),
    Locked: user.isLocked,
  };
}

export function exportUsersToExcel(data: userType[]): void {
  if (!data || data.length === 0) {
    console.warn("No users data to export");
    return;
  }

  // Format user data
  const formattedData = data.map((user) => formatUserData(user));

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Users");

  // Add column headers
  if (formattedData.length > 0) {
    const headers = Object.keys(formattedData[0]);
    worksheet.columns = headers.map((header) => ({
      header: header,
      key: header,
      width: 12, // Default width, will be auto-sized later
    }));

    // Add data rows
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
    downloadLink.download = "Users_List.xlsx";
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadLink);
  });
}
