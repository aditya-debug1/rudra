import { z } from "zod";

export const formatZodErrors = (errors: z.ZodIssue[]) => {
  return errors
    .map((err) => {
      // Join the path and replace underscores with spaces
      const field = err.path.join(".").replace(/_/g, " ");
      // Capitalize the first letter of the field
      const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
      const message = err.message;
      return `• ${formattedField}: ${message}`;
    })
    .join("\n");
};

export const formatZodMessagesOnly = (errors: z.ZodIssue[], maxToShow = 4) => {
  // Limit the number of errors to display
  const displayErrors = errors.slice(0, maxToShow);
  const remainingCount = Math.max(0, errors.length - maxToShow);

  // Format the visible errors
  const formattedErrors = displayErrors
    .map((err) => {
      // Join the path and replace underscores with spaces
      // const field = err.path.join(".").replace(/_/g, " "); // Add this variable to show field
      const message = err.message;
      return `• ${message}`;
    })
    .join("\n");

  // Add message about remaining errors if any
  if (remainingCount > 0) {
    return `${formattedErrors}\n\n... +${remainingCount} more ${remainingCount === 1 ? "warning" : "warnings"}`;
  }

  return formattedErrors;
};
