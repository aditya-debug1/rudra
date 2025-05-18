import { ClientBooking } from "@/store/client-booking/types";
import { usersSummaryType } from "@/store/users";
import { autosizeColumns } from "@/utils/func/excel";
import { toProperCase } from "@/utils/func/strUtils";
import * as XLSX from "xlsx";

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

export function exportBookingToExcel(
  data: ClientBooking[],
  managers: usersSummaryType[],
): void {
  if (!data || data.length === 0) {
    console.warn("No booking data to export");
    return;
  }

  const formattedData = data.map((booking) =>
    formatBookingData(booking, managers),
  );
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Add autosize to columns
  autosizeColumns(worksheet);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  XLSX.writeFile(workbook, "Booking_List.xlsx");
}
