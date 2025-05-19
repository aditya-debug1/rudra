import { z } from "zod";

export const bookingUpdateSchema = z.object({
  applicant: z.string().min(1, "Applicant name is required"),
  coApplicant: z.string().optional(),
  phoneNo: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number is too long"),
  altNo: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")), // Allows optional empty string
  address: z.string().optional(),
  bookingAmt: z
    .number({ invalid_type_error: "Booking amount must be a number" })
    .nonnegative("Booking amount must be non-negative"),
  dealTerms: z.string().min(1, "Deal terms are required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  salesManager: z.string().min(1, "Sales manager is required"),
  clientPartner: z.string().min(1, "Client Partner is required"),
  paymentType: z.enum(["regular-payment", "down-payment"], {
    errorMap: () => ({ message: "Select a valid payment type" }),
  }),
});
