import ExcelJS from "exceljs";

// Helper function to auto-size columns
export function autoSizeColumns(worksheet: ExcelJS.Worksheet) {
  // For each column
  worksheet.columns.forEach((column) => {
    let maxLength = 0;

    // Get column letter
    const columnLetter = column.letter || "";

    // Check header length first
    if (column.header && column.header.length > maxLength) {
      maxLength = column.header.length;
    }

    // Check data in all cells for this column
    worksheet.eachRow({ includeEmpty: false }, function (row) {
      const cell = row.getCell(columnLetter);

      // Skip empty cells
      if (!cell.value) return;

      // Convert to string and calculate length
      const cellValue = String(cell.value);
      const cellLength = cellValue.length;

      // Update maxLength if this cell's content is longer
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });

    // Add a little buffer for better display
    column.width = maxLength + 2;
  });
}
