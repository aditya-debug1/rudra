import { ClientBooking } from "@/store/client-booking/types";
import { usersSummaryType } from "@/store/users";
import { autoSizeColumns } from "@/utils/func/excel";
import { toProperCase } from "@/utils/func/strUtils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Helper function for payment type abbreviation
function getPaymentTypeAbbreviation(paymentType: string): string {
  // Split into words (handling both hyphen and space separators)
  const words = paymentType.replace(/-/g, " ").split(" ");
  // Take the first letter of each word, capitalize, and join
  return words
    .filter((word) => word.length > 0) // Ignore empty strings (if any)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const getManagerName = (
  username: string,
  managers: usersSummaryType[] | undefined,
): string => {
  if (!managers || !username) return username;
  const manager = managers.find((m) => m.username === username);
  return manager ? `${manager.firstName} ${manager.lastName}` : username;
};

function formatBookingData(
  booking: ClientBooking,
  managers: usersSummaryType[],
) {
  return {
    Date: booking.date
      ? new Date(booking.date)
          .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(",", "")
      : "N/A",
    Applicant: booking.applicant,
    CoApplicant: booking.coApplicant,
    Project: booking.project,
    Wing: booking.wing,
    Floor: booking.floor,
    "Unit No": booking.unit.unitNumber,
    Area: booking.unit.area,
    Configuration: booking.unit.configuration.toUpperCase(),
    PhoneNo: booking.phoneNo,
    AltNo: booking.altNo,
    Plan: getPaymentTypeAbbreviation(booking.paymentType),
    "Booking Amount": booking.bookingAmt,
    Status: toProperCase(booking.status),
    "Deal Terms": booking.dealTerms,
    "Payment Terms": booking.paymentTerms,
    SM: getManagerName(booking.salesManager, managers),
    CP: booking.clientPartner,
  };
}

export async function exportBookingToExcel(
  data: ClientBooking[],
  managers: usersSummaryType[],
): Promise<void> {
  if (!data || data.length === 0) {
    console.warn("No booking data to export");
    return;
  }

  const formattedData = data.map((booking) =>
    formatBookingData(booking, managers),
  );

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bookings");

  // Get headers from the first object's keys
  const headers = Object.keys(formattedData[0]);

  // Add headers
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: 15, // Default width, will be auto-sized later
  }));

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" }, // Light gray background
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Add data rows
  formattedData.forEach((rowData) => {
    const row = worksheet.addRow(rowData);

    // Apply cell styles for data rows
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Align numbers to right
      if (typeof cell.value === "number") {
        cell.alignment = { horizontal: "right" };
      }
    });
  });

  // Auto-size columns based on content
  autoSizeColumns(worksheet);

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();

  // Create a Blob and save the file
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "Booking_List.xlsx");
}
