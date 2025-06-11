import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phoneNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  address: z.string().optional(),
  notes: z.string().optional(),
  companyWebsite: z.string().optional(),
});

export const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phoneNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  altNo: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || /^\d{10}$/.test(val), {
      message: "Alt Phone number must be 10 digits",
    }),
  position: z.string().optional(),
  commissionPercentage: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    },
    z
      .number()
      .optional()
      .refine((val) => val === undefined || (val >= 0 && val <= 100), {
        message: "Commission must be between 0 and 100",
      }),
  ),
});

// Updated schema to handle multiple employees
export const ClientPartnerSchema = z.object({
  company: companySchema,
  employees: z
    .array(employeeSchema)
    .min(1, "At least one employee is required")
    .max(50, "Maximum 50 employees allowed"), // Optional: add reasonable limit
});

// Keep the old schema for backward compatibility if needed
export const ClientPartnerSingleEmployeeSchema = z.object({
  company: companySchema,
  employee: employeeSchema,
});
