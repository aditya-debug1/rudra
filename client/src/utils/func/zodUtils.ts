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

export const peekZodErrors = (
  input: z.ZodError | z.ZodIssue[],
  page = 1,
  limit = 4,
) => {
  const issues: z.ZodIssue[] = Array.isArray(input) ? input : input.issues;

  const start = Math.max(0, (page - 1) * limit);
  const shown = issues.slice(start, start + limit);

  const text = shown
    .map((e) => {
      const fieldPath = e.path.join(".").replace(/_/g, " ");
      const label = fieldPath
        ? fieldPath.charAt(0).toUpperCase() + fieldPath.slice(1)
        : "Field";
      return `• ${label}: ${e.message}`;
    })
    .join("\n");

  const remaining = Math.max(0, issues.length - (start + shown.length));
  return remaining ? `${text}\n\n... +${remaining} more` : text;
};
