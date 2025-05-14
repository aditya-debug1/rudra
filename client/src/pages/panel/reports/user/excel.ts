import { userType } from "@/store/users";
import { autosizeColumns } from "@/utils/func/excel";
import * as XLSX from "xlsx";

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

  const formattedData = data.map((user) => formatUserData(user));
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Add autosize to columns
  autosizeColumns(worksheet);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  XLSX.writeFile(workbook, "Users_List.xlsx");
}
