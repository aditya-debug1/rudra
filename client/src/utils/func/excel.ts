import * as XLSX from "xlsx";

// Helper function to auto-size columns
export const autosizeColumns = (worksheet: XLSX.WorkSheet): void => {
  // Get all column names (e.g., A, B, C, etc.)
  const columnsWidth: { [key: string]: number } = {};

  // Get the range of the worksheet
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  // Iterate through all cells to find the maximum width for each column
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const columnName = XLSX.utils.encode_col(C);
    columnsWidth[columnName] = 0;

    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];

      if (!cell || !cell.v) continue;

      // Calculate the width based on the content length
      // Add a bit of padding for better display
      const cellValue = String(cell.v);
      const width = cellValue.length + 2;

      if (width > columnsWidth[columnName]) {
        columnsWidth[columnName] = width;
      }
    }
  }

  // Apply the column widths
  worksheet["!cols"] = Object.keys(columnsWidth).map((col) => ({
    wch: columnsWidth[col],
  }));
};
